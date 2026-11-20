package org.jahia.modules.ckeditor.ai.service.impl;

import org.jahia.modules.ckeditor.ai.frame.BrandFrame;
import org.jahia.modules.ckeditor.ai.service.AIProxyService;
import org.jahia.modules.genai.api.Cancellable;
import org.jahia.modules.genai.api.CompletionRequest;
import org.jahia.modules.genai.api.CompletionResult;
import org.jahia.modules.genai.api.GenAiAccessDeniedException;
import org.jahia.modules.genai.api.GenAiException;
import org.jahia.modules.genai.api.GenAiNotConfiguredException;
import org.jahia.modules.genai.api.GenAiQuotaExceededException;
import org.jahia.modules.genai.api.GenAiService;
import org.jahia.modules.genai.api.ModelTier;
import org.jahia.modules.genai.api.StreamingHandler;
import org.json.JSONException;
import org.json.JSONObject;
import org.osgi.service.component.annotations.Activate;
import org.osgi.service.component.annotations.Component;
import org.osgi.service.component.annotations.Modified;
import org.osgi.service.component.annotations.Reference;
import org.osgi.service.component.annotations.ReferenceCardinality;
import org.osgi.service.component.annotations.ReferencePolicy;
import org.osgi.service.component.annotations.ReferencePolicyOption;
import org.osgi.service.metatype.annotations.Designate;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import javax.ws.rs.core.Response;
import javax.ws.rs.core.StreamingOutput;
import java.io.IOException;
import java.io.OutputStream;
import java.nio.charset.StandardCharsets;
import java.util.concurrent.BlockingQueue;
import java.util.concurrent.LinkedBlockingQueue;
import java.util.concurrent.TimeUnit;
import java.util.regex.Pattern;

/**
 * Answers the AI assistant through the Jahia GenAI connector.
 *
 * <p>The request body is {@code {"instructions": "...", "input": "...", "language": "en"}}. Each completion
 * names the site of the edited content, so the connector checks the permission {@code genaiAccess} of the user
 * on that site. When the module ai-assistant runs, the brand frame of that site follows the instructions.</p>
 *
 * <p>The response is a stream of server-sent events with the shapes of the {@code /modules/genai/stream}
 * endpoint of the connector:
 * {@code partial} with {@code text}, then one {@code complete} with {@code text} and {@code stopReason},
 * or one {@code error} with {@code error}.</p>
 */
@Component(
        service = {AIProxyService.class},
        configurationPid = AIProxyService.PARENT_PID + "." + GenAIProxyServiceImpl.API_TYPE,
        property = {"aiType=" + GenAIProxyServiceImpl.API_TYPE}
)
@Designate(ocd = GenAIConfigMetatype.class)
public class GenAIProxyServiceImpl implements AIProxyService {

    public static final String API_TYPE = "genai";

    private static final Logger logger = LoggerFactory.getLogger(GenAIProxyServiceImpl.class);

    private static final int TOO_MANY_REQUESTS = 429;
    static final String ACCESS_DENIED = "You do not have the permission to use AI on this site. "
            + "Ask an administrator for the permission genaiAccess.";
    private static final Pattern LANGUAGE = Pattern.compile("[a-z]{2,3}([_-][A-Za-z0-9]{2,8})*");
    private static final String PROVIDER_FAILED = "The AI provider could not complete the request.";
    // A backstop only: the timeouts of the connector end a stream long before.
    private static final long IDLE_TIMEOUT_SECONDS = 300;

    @Reference
    private GenAiService genAiService;

    /** The brand frame of the site, when the module ai-assistant runs. */
    @Reference(cardinality = ReferenceCardinality.OPTIONAL, policy = ReferencePolicy.DYNAMIC,
            policyOption = ReferencePolicyOption.GREEDY)
    private volatile BrandFrame brandFrame;

    private boolean enabled;
    private ModelTier tier;
    private Integer maxOutputTokens;

    @Activate
    @Modified
    public void activate(GenAIConfigMetatype config) {
        enabled = config.ai_enabled();
        tier = ModelTier.fromId(config.ai_tier()).orElseGet(() -> {
            logger.warn("Unknown ai.tier '{}', the AI assistant uses the balanced tier", config.ai_tier());
            return ModelTier.BALANCED;
        });
        maxOutputTokens = config.ai_maxOutputTokens() > 0 ? config.ai_maxOutputTokens() : null;
        logger.info("GenAI proxy service configured: enabled={}, tier={}, maxOutputTokens={}", enabled, tier.id(), maxOutputTokens);
    }

    @Override
    public boolean isEnabled() {
        return enabled && genAiService.isAvailable(tier);
    }

    @Override
    public Response handleRequest(String requestData, String siteKey) {
        CompletionRequest request;
        try {
            request = toCompletionRequest(requestData, siteKey);
        } catch (JSONException | IllegalArgumentException e) {
            return error(Response.Status.BAD_REQUEST.getStatusCode(), e.getMessage());
        }

        BlockingQueue<SseFrame> frames = new LinkedBlockingQueue<>();
        Cancellable stream;
        try {
            stream = genAiService.stream(request, new QueueingHandler(frames));
        } catch (GenAiAccessDeniedException e) {
            return accessDenied();
        } catch (GenAiQuotaExceededException e) {
            return error(TOO_MANY_REQUESTS, e.getMessage());
        } catch (GenAiNotConfiguredException e) {
            return error(Response.Status.SERVICE_UNAVAILABLE.getStatusCode(), e.getMessage());
        } catch (GenAiException e) {
            logger.warn("The GenAI connector refused the AI assistant request: {}", e.getMessage());
            return error(Response.Status.BAD_GATEWAY.getStatusCode(), PROVIDER_FAILED);
        }

        StreamingOutput output = out -> pipe(frames, stream, out);
        return Response.ok(output)
                .type("text/event-stream")
                .header("Cache-Control", "no-cache")
                .header("X-Accel-Buffering", "no")
                .build();
    }

    private CompletionRequest toCompletionRequest(String requestData, String siteKey) {
        JSONObject body = new JSONObject(requestData);
        String input = body.optString("input", null);
        String language = body.optString("language", null);
        return CompletionRequest.builder()
                .site(siteKey)
                .tier(tier)
                .instructions(withFrame(body.optString("instructions", null), siteKey, language, input))
                .input(input)
                .maxOutputTokens(maxOutputTokens)
                .build();
    }

    /**
     * The instructions of the editor, followed by the brand frame of the site, which the server reads:
     * the site comes from the edited node and the browser sends only the language, never the text of the frame.
     */
    String withFrame(String instructions, String siteKey, String language, String input) {
        BrandFrame frame = brandFrame;
        if (frame == null || siteKey == null || language == null || !LANGUAGE.matcher(language).matches()) {
            return instructions;
        }
        try {
            String text = frame.instructionsFor(siteKey, language, input);
            if (text == null || text.isEmpty()) {
                return instructions;
            }
            return (instructions == null || instructions.isEmpty() ? "" : instructions + "\n\n") + text;
        } catch (RuntimeException e) {
            logger.warn("The brand frame of {} could not be read: {}", siteKey, e.getMessage());
            return instructions;
        }
    }

    /**
     * Writes the frames to the editor until the terminal one. Cancels the generation when the editor goes
     * away or the wait ends, so the provider stops generating for nobody.
     */
    private static void pipe(BlockingQueue<SseFrame> frames, Cancellable stream, OutputStream out) throws IOException {
        try {
            SseFrame frame;
            do {
                frame = frames.poll(IDLE_TIMEOUT_SECONDS, TimeUnit.SECONDS);
                if (frame == null) {
                    frame = SseFrame.error(PROVIDER_FAILED);
                }
                out.write(frame.bytes());
                out.flush();
            } while (!frame.isTerminal());
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        } finally {
            stream.cancel();
        }
    }

    // The code lets a client tell a missing permission from another refusal.
    private static Response accessDenied() {
        return Response.status(Response.Status.FORBIDDEN)
                .entity(new JSONObject().put("error", ACCESS_DENIED).put("code", "genaiAccess").toString())
                .type("application/json")
                .build();
    }

    private static Response error(int status, String message) {
        return Response.status(status)
                .entity(new JSONObject().put("error", message).toString())
                .type("application/json")
                .build();
    }

    private static final class QueueingHandler implements StreamingHandler {

        private final BlockingQueue<SseFrame> frames;

        private QueueingHandler(BlockingQueue<SseFrame> frames) {
            this.frames = frames;
        }

        @Override
        public void onPartial(String textDelta) {
            frames.add(new SseFrame("partial", new JSONObject().put("text", textDelta), false));
        }

        @Override
        public void onComplete(CompletionResult result) {
            JSONObject data = new JSONObject()
                    .put("text", result.text())
                    .put("stopReason", result.stopReason().name());
            frames.add(new SseFrame("complete", data, true));
        }

        @Override
        public void onError(GenAiException error) {
            frames.add(SseFrame.error(clientMessage(error)));
        }

        // The message of a provider failure can carry details of the provider account: it goes to the log only.
        private static String clientMessage(GenAiException error) {
            if (error instanceof GenAiAccessDeniedException) {
                return ACCESS_DENIED;
            }
            if (error instanceof GenAiNotConfiguredException || error instanceof GenAiQuotaExceededException) {
                return error.getMessage();
            }
            logger.warn("An AI assistant request failed ({}): {}", error.getClass().getSimpleName(), error.getMessage());
            return PROVIDER_FAILED;
        }
    }

    private static final class SseFrame {

        private final String event;
        private final JSONObject data;
        private final boolean terminal;

        private SseFrame(String event, JSONObject data, boolean terminal) {
            this.event = event;
            this.data = data;
            this.terminal = terminal;
        }

        private static SseFrame error(String message) {
            return new SseFrame("error", new JSONObject().put("error", message), true);
        }

        private boolean isTerminal() {
            return terminal;
        }

        // JSONObject.toString() escapes line breaks, so the data always fits on one "data:" line.
        private byte[] bytes() {
            return ("event: " + event + "\ndata: " + data + "\n\n").getBytes(StandardCharsets.UTF_8);
        }
    }
}
