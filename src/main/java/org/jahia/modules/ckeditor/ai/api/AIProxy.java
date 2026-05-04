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
package org.jahia.modules.ckeditor.ai.api;

import org.jahia.modules.ckeditor.ai.AIProxyService;
import org.jahia.modules.ckeditor.ai.AIServiceLookupUtil;
import org.jahia.osgi.BundleUtils;
import org.json.JSONObject;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import javax.ws.rs.*;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;

@Produces(MediaType.APPLICATION_JSON)
public class AIProxy {

    public static final String MAPPING = "/ai-proxy";

    private final Logger logger = LoggerFactory.getLogger(AIProxy.class);

    @POST
    @Consumes(MediaType.APPLICATION_JSON)
    public Response forwardRequest(String data) {
        String apiType = "openai"; // TODO to be fetched from config

        AIServiceLookupUtil lookupUtil = BundleUtils.getOsgiService(AIServiceLookupUtil.class, null);
        AIProxyService aiService = lookupUtil.getAIProxyService(apiType);
        Response errorResponse = validateAIService(aiService, apiType);
        if (errorResponse != null) {
            return errorResponse;
        }

        try {
            return aiService.handleResponse(data);
        } catch (Exception e) {
            logger.error("Error processing AI request", e);
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                    .entity(new JSONObject().put("error", e.getMessage()).toString())
                    .build();
        }
    }

    /**
     * Validates the AI service and returns an error response if validation fails
     * @param aiService the AI service to validate
     * @param apiType the API type being requested
     * @return Response with error if validation fails, null if validation passes
     */
    private Response validateAIService(AIProxyService aiService, String apiType) {
        String error = null;
        if (aiService == null) {
            error = "AI service not found for type: " + apiType;
        } else if (!aiService.isEnabled()) {
            error = "AI service is disabled";
        }

        if (error != null) {
            logger.error(error);
            return Response.status(Response.Status.SERVICE_UNAVAILABLE)
                    .type(MediaType.APPLICATION_JSON)
                    .entity(new JSONObject().put("error", error).toString())
                    .build();
        }
        return null;
    }
}
