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

import org.osgi.service.metatype.annotations.AttributeDefinition;
import org.osgi.service.metatype.annotations.ObjectClassDefinition;

@ObjectClassDefinition(
        name = "CKEditor5 OpenAI Proxy Configuration",
        description = "Configuration for the OpenAI proxy service used by the CKEditor 5 AI assistant")
public @interface OpenAIConfigMetatype {
    @AttributeDefinition(
            name = "Enable CK5 AI Assistant",
            description = "Enable or disable this AI configuration. Hides AI-related toolbars.")
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

    @AttributeDefinition(
            name = "Connect Timeout",
            description = "TCP connection timeout in seconds. Zero or negative values disable the timeout.")
    int ai_connectTimeout() default 10;

    @AttributeDefinition(
            name = "Request Timeout",
            description = "Request timeout in seconds for non-streaming calls. Zero or negative values disables timeout.")
    int ai_requestTimeout() default 30;

    @AttributeDefinition(
            name = "Streaming Timeout",
            description = "Request timeout in seconds for streaming calls. Zero or negative values disables timeout.")
    int ai_streamingTimeout() default 120;
}
