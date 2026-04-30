/*
 * ==========================================================================================
 * =                            JAHIA'S ENTERPRISE DISTRIBUTION                             =
 * ==========================================================================================
 *
 *                                  http://www.jahia.com
 *
 * JAHIA'S ENTERPRISE DISTRIBUTIONS LICENSING - IMPORTANT INFORMATION
 * ==========================================================================================
 *
 *     Copyright (C) 2002-2026 Jahia Solutions Group. All rights reserved.
 *
 *     This file is part of a Jahia's Enterprise Distribution.
 *
 *     Jahia's Enterprise Distributions must be used in accordance with the terms
 *     contained in the Jahia Solutions Group Terms &amp; Conditions as well as
 *     the Jahia Sustainable Enterprise License (JSEL).
 *
 *     For questions regarding licensing, support, production usage...
 *     please contact our team at sales@jahia.com or go to http://www.jahia.com/license.
 *
 * ==========================================================================================
 */
package org.jahia.modules.ckeditor.ai;

import org.jahia.modules.ckeditor.config.ConfigUtil;
import org.json.JSONArray;
import org.json.JSONObject;
import org.osgi.service.component.ComponentContext;
import org.osgi.service.component.annotations.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import software.amazon.awssdk.auth.credentials.AwsBasicCredentials;
import software.amazon.awssdk.auth.credentials.StaticCredentialsProvider;
import software.amazon.awssdk.core.SdkBytes;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.bedrockruntime.BedrockRuntimeAsyncClient;
import software.amazon.awssdk.services.bedrockruntime.model.InvokeModelWithResponseStreamRequest;
import software.amazon.awssdk.services.bedrockruntime.model.InvokeModelWithResponseStreamResponseHandler;

import javax.ws.rs.core.Response;
import javax.ws.rs.core.StreamingOutput;
import java.io.IOException;
import java.util.Dictionary;
import java.util.Map;

@Component(
        service = {AIProxyService.class},
        configurationPolicy = ConfigurationPolicy.REQUIRE,
        configurationPid = AIProxyService.PARENT_PID + "." + AwsProxyServiceImpl.API_TYPE,
        property = {"aiType=" + AwsProxyServiceImpl.API_TYPE}
)
public class AwsProxyServiceImpl implements AIProxyService {

    private static final Logger logger = LoggerFactory.getLogger(AwsProxyServiceImpl.class);

    public static final String API_TYPE = "aws";

    private boolean isEnabled;

    private String accessKeyId;
    private String secretAccessKey;
    private String modelId;
    private String region;

    @Override public boolean isEnabled() {
        return isEnabled;
    }

    @Override
    public Response handleResponse(String data) throws IOException {
        logger.info("AWS Bedrock request received");
        logger.debug("Request data: {}", data);

        if (!isEnabled) {
            logger.error("AWS Bedrock service is not enabled");
            return Response.status(Response.Status.SERVICE_UNAVAILABLE)
                    .entity("{\"error\": \"AWS Bedrock service is not enabled\"}")
                    .build();
        }

        try {
            // Validate AWS credentials configuration
            if (accessKeyId == null || accessKeyId.trim().isEmpty()) {
                logger.error("AWS Access Key ID is not configured");
                return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                        .entity("{\"error\": \"AWS Access Key ID is not configured\"}")
                        .build();
            }

            if (secretAccessKey == null || secretAccessKey.trim().isEmpty()) {
                logger.error("AWS Secret Access Key is not configured");
                return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                        .entity("{\"error\": \"AWS Secret Access Key is not configured\"}")
                        .build();
            }

            if (modelId == null || modelId.trim().isEmpty()) {
                logger.error("AWS Bedrock Model ID is not configured");
                return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                        .entity("{\"error\": \"AWS Bedrock Model ID is not configured\"}")
                        .build();
            }

            // Parse the incoming request data
            JSONObject requestJson = new JSONObject(data);

            // Extract Messages API parameters
            JSONArray messages = requestJson.optJSONArray("messages");
            String systemPrompt = requestJson.optString("system", "");
            int maxTokens = requestJson.optInt("max_tokens", 2000);
            double temperature = requestJson.optDouble("temperature", 1.0);
            double topP = requestJson.optDouble("top_p", 1.0);
            int topK = requestJson.optInt("top_k", 250);
            boolean stream = requestJson.optBoolean("stream", true);

            // If messages not provided, convert legacy prompt format to messages format
            if (messages == null || messages.length() == 0) {
                String prompt = requestJson.optString("prompt", "");
                if (!prompt.isEmpty()) {
                    // Legacy format: extract content from prompt
                    messages = new JSONArray();
                    JSONObject message = new JSONObject();
                    message.put("role", "user");

                    // Remove "Human:" and "Assistant:" markers if present
                    String cleanPrompt = prompt.replaceFirst("^Human:\\s*", "")
                                               .replaceFirst("\\s*Assistant:\\s*$", "");
                    message.put("content", cleanPrompt);
                    messages.put(message);
                } else {
                    logger.error("No messages or prompt provided in request");
                    return Response.status(Response.Status.BAD_REQUEST)
                            .entity("{\"error\": \"No messages or prompt provided\"}")
                            .build();
                }
            }

            logger.debug("Parsed request - messages count: {}, maxTokens: {}, temperature: {}, topP: {}, topK: {}, stream: {}",
                    messages.length(), maxTokens, temperature, topP, topK, stream);

            // Build the Messages API payload for AWS Bedrock
            JSONObject bedrockPayload = new JSONObject();
            bedrockPayload.put("anthropic_version", "bedrock-2023-05-31");
            bedrockPayload.put("max_tokens", maxTokens);
            bedrockPayload.put("messages", messages);

            // Add optional parameters
            if (!systemPrompt.isEmpty()) {
                bedrockPayload.put("system", systemPrompt);
            }
            if (temperature > 0) {
                bedrockPayload.put("temperature", temperature);
            }
            if (topP < 1.0) {
                bedrockPayload.put("top_p", topP);
            }
            if (topK > 0) {
                bedrockPayload.put("top_k", topK);
            }

            String payloadString = bedrockPayload.toString();
//            String payloadString = new JSONObject().put("prompt", requestJson.getString("prompt")).toString(4);
            logger.debug("AWS Bedrock Messages API payload: {}", payloadString);

            // Build AWS credentials
            AwsBasicCredentials awsCredentials = AwsBasicCredentials.create(accessKeyId, secretAccessKey);

            // Create the Bedrock Runtime async client
            BedrockRuntimeAsyncClient bedrockClient = BedrockRuntimeAsyncClient.builder()
                    .region(Region.of(region))
                    .credentialsProvider(StaticCredentialsProvider.create(awsCredentials))
                    .build();

            if (stream) {
                // Handle streaming response with Messages API
                return handleMessageResponse(bedrockClient, modelId, payloadString);
            } else {
                // Handle non-streaming response (if needed in the future)
                logger.warn("Non-streaming mode not yet implemented for AWS Bedrock");
                return Response.status(Response.Status.NOT_IMPLEMENTED)
                        .entity("{\"error\": \"Non-streaming mode not yet implemented\"}")
                        .build();
            }


        } catch (Exception e) {
            logger.error("Error processing AWS Bedrock request", e);
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                    .entity("{\"error\": \"" + e.getMessage() + "\"}")
                    .build();
        }
    }

    private Response handleStreamingResponse(BedrockRuntimeAsyncClient client, String modelId, String payload) {
        StreamingOutput streamingOutput = outputStream -> {
            try {
                InvokeModelWithResponseStreamRequest request = InvokeModelWithResponseStreamRequest.builder()
                        .modelId(modelId)
                        .body(SdkBytes.fromUtf8String(payload))
                        .contentType("application/json")
                        .accept("application/json")
                        .build();

                // Create the response handler - use subscriber only (not onEventStream)
                var handler = InvokeModelWithResponseStreamResponseHandler.builder()
                        .onComplete(() -> {
                            try {
                                logger.info("Stream completed");
                                outputStream.write("data: [DONE]\n\n".getBytes());
                                outputStream.flush();
                            } catch (Exception e) {
                                logger.error("Error completing stream", e);
                            }
                        })
                        .onError(throwable -> {
                            logger.error("Error in stream", throwable);
                            try {
                                outputStream.write(("data: {\"error\": \"" + throwable.getMessage() + "\"}\n\n").getBytes());
                                outputStream.flush();
                            } catch (Exception e) {
                                logger.error("Error writing error to stream", e);
                            }
                        })
                        .subscriber(InvokeModelWithResponseStreamResponseHandler.Visitor.builder()
                                .onChunk(chunk -> {
                                    try {
                                        byte[] bytes = chunk.bytes().asByteArray();
                                        String chunkData = new String(bytes);
                                        logger.debug("Received chunk: {}", chunkData);

                                        // Parse the chunk and extract the text
                                        JSONObject chunkJson = new JSONObject(chunkData);

                                        // Format as Server-Sent Events (SSE)
                                        String sseData = "data: " + chunkJson + "\n\n";
                                        outputStream.write(sseData.getBytes());
                                        outputStream.flush();
                                    } catch (Exception e) {
                                        logger.error("Error processing chunk", e);
                                    }
                                })
                                .onDefault(e -> {
                                    logger.debug("Received default event: {}", e);
                                })
                                .build())
                        .build();

                // Invoke the model and wait for completion
                var responseFuture = client.invokeModelWithResponseStream(request, handler);
                responseFuture.join();

            } catch (Exception e) {
                logger.error("Error invoking AWS Bedrock model", e);
                throw new IOException("Error invoking AWS Bedrock model", e);
            } finally {
                client.close();
            }
        };

        return Response.ok(streamingOutput)
                .type("text/event-stream")
                .header("Cache-Control", "no-cache")
                .header("Connection", "keep-alive")
                .build();
    }

    private Response handleMessageResponse(BedrockRuntimeAsyncClient client, String modelId, String payload) {
        StreamingOutput streamingOutput = outputStream -> {
            try {
                InvokeModelWithResponseStreamRequest request = InvokeModelWithResponseStreamRequest.builder()
                        .modelId(modelId)
                        .body(SdkBytes.fromUtf8String(payload))
                        .contentType("application/json")
                        .accept("application/json")
                        .build();

                // Create the response handler for Messages API streaming
                var handler = InvokeModelWithResponseStreamResponseHandler.builder()
                        .onComplete(() -> {
                            try {
                                logger.info("Messages API stream completed");
                                outputStream.write("data: [DONE]\n\n".getBytes());
                                outputStream.flush();
                            } catch (Exception e) {
                                logger.error("Error completing stream", e);
                            }
                        })
                        .onError(throwable -> {
                            logger.error("Error in Messages API stream", throwable);
                            try {
                                JSONObject errorJson = new JSONObject();
                                errorJson.put("error", throwable.getMessage());
                                outputStream.write(("data: " + errorJson + "\n\n").getBytes());
                                outputStream.flush();
                            } catch (Exception e) {
                                logger.error("Error writing error to stream", e);
                            }
                        })
                        .subscriber(InvokeModelWithResponseStreamResponseHandler.Visitor.builder()
                                .onChunk(chunk -> {
                                    try {
                                        byte[] bytes = chunk.bytes().asByteArray();
                                        String chunkData = new String(bytes);
                                        logger.debug("Received Messages API chunk: {}", chunkData);

                                        // Parse the Messages API chunk
                                        JSONObject chunkJson = new JSONObject(chunkData);
                                        String type = chunkJson.optString("type");

                                        // Llama: handle generation
                                        if (chunkJson.has("generation") && chunkJson.optString("generation") != null) {
                                            String text = chunkJson.optString("generation");

                                            // Format as SSE for CKEditor (matching OpenAI format)
                                            JSONObject ssePayload = new JSONObject();
                                            ssePayload.put("completion", text);
                                            ssePayload.put("stop_reason", JSONObject.NULL);

                                            String sseData = ssePayload.toString() + "\n";
                                            outputStream.write(sseData.getBytes());
                                            outputStream.flush();
                                        }

                                        // Anthropic: Handle different event types from Messages API
                                        if ("message_start".equals(type)) {
                                            logger.debug("Message started");
                                        } else if ("content_block_start".equals(type)) {
                                            logger.debug("Content block started");
                                        } else if ("content_block_delta".equals(type)) {
                                            // This is where the actual text content comes from
                                            JSONObject delta = chunkJson.optJSONObject("delta");
                                            if (delta != null && delta.has("text")) {
                                                String text = delta.getString("text");

                                                // Format as SSE for CKEditor (matching OpenAI format)
                                                JSONObject ssePayload = new JSONObject();
                                                ssePayload.put("completion", text);
                                                ssePayload.put("stop_reason", JSONObject.NULL);

//                                                String sseData = "data: " + ssePayload + "\n\n";
                                                String sseData = ssePayload.toString() + "\n";
                                                outputStream.write(sseData.getBytes());
                                                outputStream.flush();
                                            }
                                        } else if ("content_block_stop".equals(type)) {
                                            logger.debug("Content block stopped");
                                        } else if ("message_delta".equals(type)) {
                                            // Contains stop_reason and usage information
                                            JSONObject delta = chunkJson.optJSONObject("delta");
                                            if (delta != null && delta.has("stop_reason")) {
                                                String stopReason = delta.getString("stop_reason");
                                                logger.debug("Message delta with stop_reason: {}", stopReason);
                                            }
                                        } else if ("message_stop".equals(type)) {
                                            logger.debug("Message stopped");
                                        } else {
                                            logger.debug("Unknown event type: {}", type);
                                        }

                                    } catch (Exception e) {
                                        logger.error("Error processing chunk", e);
                                        try {
                                            outputStream.write(("data: {\"error\":\"" + e.getMessage() + "\"}\n\n").getBytes());
                                            outputStream.flush();
                                        } catch (Exception ex) {
                                            logger.error("Error writing error message", ex);
                                        }
                                    }
                                })
                                .onDefault(e -> {
                                    logger.info("Received default event: {}", e);
                                })
                                .build())
                        .build();

                // Invoke the model and wait for completion
                var responseFuture = client.invokeModelWithResponseStream(request, handler);
                responseFuture.join();

            } catch (Exception e) {
                logger.error("Error invoking AWS Bedrock model with Messages API", e);
                throw new IOException("Error invoking AWS Bedrock model with Messages API", e);
            } finally {
                client.close();
            }
        };

        return Response.ok(streamingOutput)
                .type("text/event-stream")
                .header("Cache-Control", "no-cache")
                .header("Connection", "keep-alive")
                .build();
    }

    @Activate
    @Modified
    public void activate(ComponentContext context) {
        Dictionary<String, Object> dict = context.getProperties();
        Map<String, ?> props = ConfigUtil.getMap(dict);


        if (!API_TYPE.equals(props.get("aiType"))) {
            logger.debug("Skipping activation - aiType mismatch: expected '{}', got '{}'", API_TYPE, props.get("aiType"));
            return;
        }
        logger.info("Configuring AWS Proxy Service activated with PID: {}", API_TYPE);
        logger.debug("Configuration properties: {}", props);

        // Basic settings
        isEnabled = ConfigUtil.getBoolean(props, "ai.enabled", false);

        accessKeyId = ConfigUtil.getString(props, "ai.accessKeyId", "");
        secretAccessKey = ConfigUtil.getString(props, "ai.secretAccessKey", "");
        modelId = ConfigUtil.getString(props, "ai.modelId", "");
        region = ConfigUtil.getString(props, "ai.region", "us-east-1");

        // Log configuration status with detailed info
        logger.info("AWS Bedrock Service Configuration:");
        logger.info("  - Enabled: {}", isEnabled);
        logger.info("  - Access Key ID configured: {}", (accessKeyId != null && !accessKeyId.isEmpty()));
        logger.info("  - Secret Access Key configured: {}", (secretAccessKey != null && !secretAccessKey.isEmpty()));
        logger.info("  - Model ID: {}", (modelId != null && !modelId.isEmpty()) ? modelId : "NOT CONFIGURED");
        logger.info("  - Region: {}", region);

        // Warn if credentials are missing
        if (isEnabled) {
            if (accessKeyId == null || accessKeyId.trim().isEmpty()) {
                logger.warn("AWS Access Key ID is not configured! Service will not work until configured.");
            }
            if (secretAccessKey == null || secretAccessKey.trim().isEmpty()) {
                logger.warn("AWS Secret Access Key is not configured! Service will not work until configured.");
            }
            if (modelId == null || modelId.trim().isEmpty()) {
                logger.warn("AWS Bedrock Model ID is not configured! Service will not work until configured.");
            }
        }
    }

    @Deactivate
    public void deactivate(Map<String, String> props) {
        String pid = props.get("aiType");
        logger.info("AWS Proxy Service deactivated: {}", pid);
    }
}
