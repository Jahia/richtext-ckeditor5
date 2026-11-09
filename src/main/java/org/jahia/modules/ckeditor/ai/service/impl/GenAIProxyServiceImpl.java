package org.jahia.modules.ckeditor.ai.service.impl;

import org.jahia.modules.ckeditor.ai.service.AIProxyService;
import org.jahia.modules.genai.api.Cancellable;
import org.jahia.modules.genai.api.CompletionRequest;
import org.jahia.modules.genai.api.CompletionResult;
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

/**
 * Answers the AI assistant through the Jahia GenAI connector.
 *
 * <p>The request body is {@code {"instructions": "...", "input": "..."}}. The response is a stream of
 * server-sent events with the shapes of the {@code /modules/genai/stream} endpoint of the connector:
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
    private static final String PROVIDER_FAILED = "The AI provider could not complete the request.";
    // A backstop only: the timeouts of the connector end a stream long before.
    private static final long IDLE_TIMEOUT_SECONDS = 300;

    @Reference
    private GenAiService genAiService;

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
    public Response handleRequest(String requestData) {
        CompletionRequest request;
        try {
            request = toCompletionRequest(requestData);
        } catch (JSONException | IllegalArgumentException e) {
            return error(Response.Status.BAD_REQUEST.getStatusCode(), e.getMessage());
        }

        BlockingQueue<SseFrame> frames = new LinkedBlockingQueue<>();
        Cancellable stream;
        try {
            stream = genAiService.stream(request, new QueueingHandler(frames));
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

    private CompletionRequest toCompletionRequest(String requestData) {
        JSONObject body = new JSONObject(requestData);
        return CompletionRequest.builder()
                .tier(tier)
                .instructions(body.optString("instructions", null))
                .input(body.optString("input", null))
                .maxOutputTokens(maxOutputTokens)
                .build();
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
