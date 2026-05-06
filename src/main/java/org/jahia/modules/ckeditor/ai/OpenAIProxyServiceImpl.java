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

import org.json.JSONObject;
import org.osgi.service.component.annotations.*;
import org.osgi.service.metatype.annotations.AttributeDefinition;
import org.osgi.service.metatype.annotations.Designate;
import org.osgi.service.metatype.annotations.ObjectClassDefinition;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import javax.ws.rs.core.Response;
import java.io.*;
import java.net.HttpURLConnection;
import java.net.URL;
import java.nio.charset.StandardCharsets;
import java.util.Scanner;

@Component(
        service = {AIProxyService.class},
        configurationPolicy = ConfigurationPolicy.REQUIRE,
        configurationPid = AIProxyService.PARENT_PID + "." + OpenAIProxyServiceImpl.API_TYPE,
        property = {"aiType=" + OpenAIProxyServiceImpl.API_TYPE}
)
@Designate(ocd = OpenAIProxyServiceImpl.OpenAIConfig.class)
public class OpenAIProxyServiceImpl implements AIProxyService {

    private static final Logger logger = LoggerFactory.getLogger(OpenAIProxyServiceImpl.class);

    public static final String API_TYPE = "openai";

    @ObjectClassDefinition(
            name = "CKEditor5 OpenAI Proxy Configuration",
            description = "Configuration for the OpenAI proxy service used by the CKEditor 5 AI assistant")
    public @interface OpenAIConfig {
        @AttributeDefinition(name = "Enabled", description = "Enable or disable this AI configuration. Hides AI-related toolbars.")
        boolean ai_enabled() default false;

        // From https://platform.openai.com/api-keys
        @AttributeDefinition(name = "API Key", description = "OpenAI API Key")
        String ai_apiKey() default "YOUR_OPEN_API_KEY_HERE";

        @AttributeDefinition(name = "API URL", description = "OpenAI API endpoint URL")
        String ai_apiUrl() default "https://api.openai.com/v1/chat/completions";

        @AttributeDefinition(
                name = "Request Parameters",
                description = "Additional override request parameters as a JSON string (optional)")
        String ai_requestParams() default "";
    }

    private boolean isEnabled;
    private String apiKey;
    private String apiUrl;
    private JSONObject requestParams;

    @Override
    public boolean isEnabled() {
        return isEnabled;
    }

    public String getApiKey() {
        return apiKey;
    }

    @Activate
    @Modified
    public void activate(OpenAIConfig config) {
        logger.info("Configuring OpenAI Proxy Service activated with PID: {}", API_TYPE);

        isEnabled = config.ai_enabled();
        apiKey = config.ai_apiKey();
        apiUrl = config.ai_apiUrl();

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

        logger.info("OpenAI service enabled: {}, API key configured: {}", isEnabled, (apiKey != null && !apiKey.isEmpty()));
        logger.debug("API URL: {}", apiUrl);
    }

    @Deactivate
    public void deactivate() {
        logger.info("OpenAI Proxy Service deactivated: {}", API_TYPE);
    }

    @Override
    public Response handleResponse(String data) throws IOException {
        JSONObject requestJson = new JSONObject(data);

        // Override request params from configuration
        for (String key : requestParams.keySet()) {
            requestJson.put(key, requestParams.get(key));
        }

        HttpURLConnection conn = getURLConnection();
        conn.getOutputStream().write(requestJson.toString().getBytes(StandardCharsets.UTF_8));
        boolean isStreamingReq = requestJson.optBoolean("stream", false);
        return isStreamingReq ? handleStreamingResponse(conn) : handleJsonResponse(conn);
    }

    public HttpURLConnection getURLConnection() throws IOException {
        URL url = new URL(apiUrl);
        HttpURLConnection conn = (HttpURLConnection) url.openConnection();
        conn.setRequestMethod("POST");
        conn.setRequestProperty("Content-Type", "application/json");
        conn.setRequestProperty("Authorization", "Bearer " + getApiKey());
        conn.setDoOutput(true);
        return conn;
    }

    private Response handleJsonResponse(HttpURLConnection conn) throws IOException {
        InputStream responseStream = conn.getInputStream();
        Scanner s = new Scanner(responseStream).useDelimiter("\\A");
        String responseBody = s.hasNext() ? s.next() : "";
        return Response.ok(responseBody).build();
    }

    private Response handleStreamingResponse(HttpURLConnection conn) throws IOException {
        InputStream responseStream = conn.getInputStream();
        return Response.ok(responseStream)
                .type("text/event-stream")
                .header("Cache-Control", "no-cache")
                .header("Connection", "keep-alive")
                .build();
    }

}
