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
package org.jahia.modules.ckeditor.ai.service.impl;

import org.jahia.modules.ckeditor.ai.service.AIProxyService;
import org.json.JSONObject;
import org.osgi.service.component.annotations.*;
import org.osgi.service.metatype.annotations.Designate;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import javax.ws.rs.core.HttpHeaders;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;
import java.io.*;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.time.Duration;

@Component(
        service = {AIProxyService.class},
        configurationPolicy = ConfigurationPolicy.REQUIRE,
        configurationPid = AIProxyService.PARENT_PID + "." + OpenAIProxyServiceImpl.API_TYPE,
        property = {"aiType=" + OpenAIProxyServiceImpl.API_TYPE}
)
@Designate(ocd = OpenAIConfigMetatype.class)
public class OpenAIProxyServiceImpl implements AIProxyService {

    private static final Logger logger = LoggerFactory.getLogger(OpenAIProxyServiceImpl.class);

    public static final String API_TYPE = "openai";

    private boolean isEnabled;
    private String apiKey;
    private String apiUrl;
    private JSONObject requestParams;
    private Duration requestTimeout;
    private Duration streamingTimeout;
    private HttpClient httpClient;

    @Override
    public boolean isEnabled() {
        return isEnabled;
    }

    public String getApiKey() {
        return apiKey;
    }

    @Activate
    @Modified
    public void activate(OpenAIConfigMetatype config) {
        logger.info("Configuring OpenAI Proxy Service activated with PID: {}", API_TYPE);

        isEnabled = config.ai_enabled();
        apiKey = config.ai_apiKey();
        apiUrl = config.ai_apiUrl();
        requestTimeout = Duration.ofSeconds(config.ai_requestTimeout());
        streamingTimeout = Duration.ofSeconds(config.ai_streamingTimeout());

        String requestParamsStr = config.ai_requestParams();
        if (requestParamsStr != null && !requestParamsStr.trim().isEmpty()) {
            try {
                requestParams = new JSONObject(requestParamsStr);
            } catch (org.json.JSONException e) {
                logger.warn("Failed to parse ai.requestParams, using empty defaults: {}", e.getMessage());
                requestParams = new JSONObject();
            }
        } else {
            requestParams = new JSONObject();
        }

        // Single HttpClient instance reuses connections (HTTP keep-alive / HTTP/2 multiplexing)
        httpClient = HttpClient.newBuilder()
                .connectTimeout(Duration.ofSeconds(config.ai_connectTimeout()))
                .build();

        logger.info("OpenAI service enabled: {}, API key configured: {}", isEnabled, (apiKey != null && !apiKey.isEmpty()));
        logger.debug("API URL: {}", apiUrl);
    }

    @Deactivate
    public void deactivate() {
        logger.info("OpenAI Proxy Service deactivated: {}", API_TYPE);
        httpClient = null;
    }

    @Override
    public Response handleRequest(String requestData) throws InterruptedException, IOException {
        JSONObject requestJson = new JSONObject(requestData);

        // Override request params from configuration
        for (String key : requestParams.keySet()) {
            requestJson.put(key, requestParams.get(key));
        }

        boolean isStreamingReq = requestJson.optBoolean("stream", false);
        HttpRequest request = getHttpRequest(requestJson, isStreamingReq);
        HttpResponse<InputStream> response = httpClient.send(request, HttpResponse.BodyHandlers.ofInputStream());
        int statusCode = response.statusCode();

        if (statusCode >= 200 && statusCode < 300) {
            return isStreamingReq ? handleStreamingResponse(response) : handleJsonResponse(response);
        }

        // Read and forward the error body from OpenAI
        try (InputStream errorStream = response.body()) {
            String errorBody = new String(errorStream.readAllBytes(), StandardCharsets.UTF_8);
            logger.warn("OpenAI API returned status {}: {}", statusCode, errorBody);
            return Response.status(statusCode).entity(errorBody).build();
        }
    }

    public HttpRequest getHttpRequest(JSONObject requestJson, boolean isStreaming) {
        return HttpRequest.newBuilder()
                .uri(URI.create(apiUrl))
                .timeout(isStreaming ? streamingTimeout : requestTimeout)
                .header(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON)
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + apiKey)
                .POST(HttpRequest.BodyPublishers.ofString(requestJson.toString(), StandardCharsets.UTF_8))
                .build();
    }

    private Response handleJsonResponse(HttpResponse<InputStream> response) {
        return Response.ok(response.body()).build();
    }

    private Response handleStreamingResponse(HttpResponse<InputStream> response) {
        return Response.ok(response.body())
                .type("text/event-stream")
                .header("Cache-Control", "no-cache")
                .header("Connection", "keep-alive")
                .build();
    }

}
