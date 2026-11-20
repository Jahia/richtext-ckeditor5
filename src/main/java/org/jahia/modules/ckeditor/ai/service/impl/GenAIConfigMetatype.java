package org.jahia.modules.ckeditor.ai.service.impl;

import org.osgi.service.metatype.annotations.AttributeDefinition;
import org.osgi.service.metatype.annotations.ObjectClassDefinition;
import org.osgi.service.metatype.annotations.Option;

@ObjectClassDefinition(
        name = "CKEditor5 GenAI Connector Configuration",
        description = "Configuration of the CKEditor 5 AI assistant when it calls the Jahia GenAI connector. "
                + "The provider, the key and the model are set in the configuration of the GenAI connector.")
public @interface GenAIConfigMetatype {
    @AttributeDefinition(
            name = "Enable CK5 AI Assistant",
            description = "Enable or disable the AI assistant. The AI toolbar items show only when the GenAI connector can serve the tier.")
    boolean ai_enabled() default true;

    @AttributeDefinition(
            name = "Model tier",
            description = "The tier of the GenAI connector that answers the AI assistant.",
            options = {
                    @Option(label = "Advanced", value = "advanced"),
                    @Option(label = "Balanced", value = "balanced"),
                    @Option(label = "Lite", value = "lite")
            })
    String ai_tier() default "balanced";

    @AttributeDefinition(
            name = "Max output tokens",
            description = "The most tokens of one answer. Zero or a negative value uses the default of the GenAI connector.")
    int ai_maxOutputTokens() default 2048;
}
