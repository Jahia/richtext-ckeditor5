package org.jahia.modules.ckeditor.graphql.query.ai;

import graphql.annotations.annotationTypes.*;
import org.jahia.modules.ckeditor.ai.AIProxyService;
import org.jahia.modules.ckeditor.ai.AIServiceLookupUtil;
import org.jahia.modules.graphql.provider.dxm.DataFetchingException;
import org.jahia.modules.graphql.provider.dxm.osgi.annotations.GraphQLOsgiService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import javax.inject.Inject;

/**
 * Minimal GraphQL endpoint for AI proxy
 */
@GraphQLName("AIProxy")
@GraphQLDescription("AI Assistant proxy endpoint")
public class GqlAIProxy {

    private static final Logger logger = LoggerFactory.getLogger(GqlAIProxy.class);

    @Inject
    @GraphQLOsgiService
    private AIServiceLookupUtil lookupUtil;

    @GraphQLField
    @GraphQLName("sendRequest")
    @GraphQLDescription("Forward AI request to OpenAI")
    public String sendRequest(
            @GraphQLName("request") @GraphQLNonNull String request
    ) {
        // TODO needs to be parameterized, maybe front-end configurable ?
        String apiType = "openai";

        try {
            logger.debug("Received AI proxy request - redirecting to servlet endpoint");
            // This GraphQL endpoint is deprecated but kept for backwards compatibility
            throw new DataFetchingException("AI proxy should be called via servlet endpoint: /cms/ai/proxy");
        } catch (Exception e) {
            logger.error("AI proxy request failed", e);
            throw new DataFetchingException(e.getMessage());
        }
    }
}
