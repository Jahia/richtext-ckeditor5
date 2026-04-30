package org.jahia.modules.ckeditor.graphql.query.ai;

import graphql.annotations.annotationTypes.GraphQLDescription;
import graphql.annotations.annotationTypes.GraphQLField;
import graphql.annotations.annotationTypes.GraphQLName;
import graphql.annotations.annotationTypes.GraphQLTypeExtension;
import org.jahia.modules.ckeditor.graphql.query.GqlRichTextQuery;

/**
 * Extends RichTextQuery with AI proxy
 */
@GraphQLTypeExtension(GqlRichTextQuery.class)
public class GqlRichTextAIExtension {

    @GraphQLField
    @GraphQLName("ai")
    @GraphQLDescription("AI Assistant proxy")
    public static GqlAIProxy getAI() {
        return new GqlAIProxy();
    }
}
