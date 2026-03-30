package org.jahia.modules.ckeditor.graphql.query;

import graphql.annotations.annotationTypes.GraphQLDescription;
import graphql.annotations.annotationTypes.GraphQLField;
import graphql.annotations.annotationTypes.GraphQLName;

import java.util.List;

@GraphQLName("RichTextConfigResult")
@GraphQLDescription("Result containing config name and excluded toolbar items")
public class GqlRichTextConfigResult {
    private String configName;
    private List<String> excludeToolbarItems;

    public GqlRichTextConfigResult(String configName, List<String> excludeToolbarItems) {
        this.configName = configName;
        this.excludeToolbarItems = excludeToolbarItems;
    }

    @GraphQLField
    @GraphQLName("configName")
    @GraphQLDescription("Name of the applicable CKEditor configuration")
    public String getConfigName() {
        return configName;
    }

    @GraphQLField
    @GraphQLName("excludeToolbarItems")
    @GraphQLDescription("List of toolbar items to exclude")
    public List<String> getExcludeToolbarItems() {
        return excludeToolbarItems;
    }
}
