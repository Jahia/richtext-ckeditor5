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
import org.osgi.service.component.annotations.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import javax.ws.rs.core.Response;
import java.io.*;
import java.net.HttpURLConnection;
import java.net.URL;
import java.nio.charset.StandardCharsets;
import java.util.Map;
import java.util.Scanner;

@Component(
        service = {AIProxyService.class},
        configurationPolicy = ConfigurationPolicy.REQUIRE,
        configurationPid = AIProxyService.PARENT_PID + "." + OpenAIProxyServiceImpl.API_TYPE,
        property = {"aiType=" + OpenAIProxyServiceImpl.API_TYPE}
)
public class OpenAIProxyServiceImpl implements AIProxyService {

    private static final Logger logger = LoggerFactory.getLogger(OpenAIProxyServiceImpl.class);

    public static final String API_TYPE = "openai";

    private boolean isEnabled;
    private String apiKey;
    private String apiUrl;

    @Override
    public boolean isEnabled() {
        return isEnabled;
    }

    public String getApiKey() {
        return apiKey;
    }

    @Activate
    @Modified
    public void activate(Map<String, String> props) {
        if (!API_TYPE.equals(props.get("aiType"))) {
            return;
        }
        logger.info("Configuring OpenAI Proxy Service activated with PID: {}", API_TYPE);
        logger.debug("Configuration properties: {}", props);

        // Basic settings
        isEnabled = ConfigUtil.getBoolean(props, "ai.enabled", false);
        apiKey = ConfigUtil.getString(props, "ai.apiKey", "");
        apiUrl = ConfigUtil.getString(props, "ai.apiUrl", "https://api.openai.com/v1/chat/completions");

        logger.info("OpenAI service enabled: {}, API key configured: {}", isEnabled, (apiKey != null && !apiKey.isEmpty()));
        logger.debug("API URL: {}", apiUrl);
    }

    @Deactivate
    public void deactivate(Map<String, String> props) {
        String pid = props.get("aiType");
        logger.info("OpenAI Proxy Service deactivated: {}", pid);
    }

    @Override
    public Response handleResponse(String data) throws IOException {
        JSONObject requestJson = new JSONObject(data);
        HttpURLConnection conn = getURLConnection();
        conn.getOutputStream().write(data.getBytes(StandardCharsets.UTF_8));
        boolean isStreamingReq = requestJson.getBoolean("stream");
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
