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

import org.jahia.api.Constants;
import org.jahia.modules.ckeditor.ai.service.AIProxyService;
import org.jahia.modules.ckeditor.ai.service.AIServiceLookupUtil;
import org.jahia.modules.ckeditor.config.RichTextConfig;
import org.jahia.osgi.BundleUtils;
import org.jahia.services.content.JCRNodeWrapper;
import org.jahia.services.content.JCRSessionFactory;
import org.jahia.services.content.JCRSessionWrapper;
import org.json.JSONObject;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import javax.jcr.RepositoryException;
import javax.ws.rs.*;
import javax.ws.rs.core.Context;
import javax.ws.rs.core.HttpHeaders;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;

@Produces(MediaType.APPLICATION_JSON)
public class AIProxy {

    public static final String MAPPING = "/ai-proxy";
    private static final String PERMISSION = "wysiwyg-editor-toolbar";

    private final Logger logger = LoggerFactory.getLogger(AIProxy.class);

    @POST
    @Consumes(MediaType.APPLICATION_JSON)
    public Response forwardRequest(String data, @Context HttpHeaders headers) {
        String nodePath = headers.getHeaderString("X-Jahia-Path");
        if (!hasPermission(nodePath)) {
            return Response.status(Response.Status.UNAUTHORIZED)
                    .entity(new JSONObject().put("error", "Unauthorized").toString())
                    .build();
        }

        try {
            RichTextConfig richTextConfig = getRequiredService(RichTextConfig.class);
            String apiType = richTextConfig.getAiType();

            AIServiceLookupUtil lookupUtil = getRequiredService(AIServiceLookupUtil.class);
            AIProxyService aiService = lookupUtil.getAIProxyService(apiType);
            validateAIService(aiService, apiType);

            return aiService.handleRequest(data);
        } catch (Exception e) {
            if (e instanceof InterruptedException) {
                Thread.currentThread().interrupt();
            }
            logger.error("Error processing AI request", e);
            return Response.status(Response.Status.SERVICE_UNAVAILABLE)
                    .entity(new JSONObject().put("error", e.getMessage()).toString())
                    .build();
        }
    }

    /**
     * Checks if the current user has permission to use the AI proxy.
     * Uses the edit workspace session (ensures user is an editor) and
     * verifies the wysiwyg-editor-toolbar permission on the given node.
     */
    private boolean hasPermission(String nodePath) {
        if (nodePath == null || nodePath.trim().isEmpty()) {
            return false;
        }

        try {
            JCRSessionWrapper session = JCRSessionFactory.getInstance().getCurrentUserSession(Constants.EDIT_WORKSPACE);
            JCRNodeWrapper node = session.getNode(nodePath);
            return node.hasPermission(PERMISSION);
        } catch (RepositoryException e) {
            logger.error("Error checking permission for path: {}", nodePath, e);
            return false;
        }
    }

    /**
     * Validates the AI service and returns an error response if validation fails
     * @param aiService the AI service to validate
     * @param apiType the API type being requested
     * @return Response with error if validation fails, null if validation passes
     */
    private void validateAIService(AIProxyService aiService, String apiType) {
        if (aiService == null) {
            throw new ServiceUnavailableException("AI service not found for type: " + apiType);
        }
        if (!aiService.isEnabled()) {
            throw new ServiceUnavailableException("AI service is disabled");
        }
    }

    private <T> T getRequiredService(Class<T> serviceClass) {
        T service = BundleUtils.getOsgiService(serviceClass, null);
        if (service == null) {
            throw new ServiceUnavailableException(serviceClass.getSimpleName() + " service not available");
        }

        return service;
    }
}
