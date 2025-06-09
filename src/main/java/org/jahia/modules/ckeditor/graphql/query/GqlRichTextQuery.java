/*
 * Copyright (C) 2002-2025 Jahia Solutions Group SA. All rights reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
package org.jahia.modules.ckeditor.graphql.query;

import graphql.annotations.annotationTypes.GraphQLDescription;
import graphql.annotations.annotationTypes.GraphQLField;
import graphql.annotations.annotationTypes.GraphQLName;
import graphql.annotations.annotationTypes.GraphQLNonNull;
import org.jahia.modules.ckeditor.config.CKEditorConfiguration;
import org.jahia.modules.ckeditor.config.RichTextConfig;
import org.jahia.modules.graphql.provider.dxm.DataFetchingException;
import org.jahia.modules.graphql.provider.dxm.osgi.annotations.GraphQLOsgiService;
import org.jahia.services.content.JCRNodeWrapper;
import org.jahia.services.content.JCRSessionFactory;
import org.jahia.services.content.JCRSessionWrapper;

import javax.inject.Inject;
import javax.jcr.RepositoryException;
import java.util.List;
import java.util.stream.Collectors;

@GraphQLName("RichTextQuery")
@GraphQLDescription("Provides functionality necessary for operation of richtext ckeditor5")
public class GqlRichTextQuery {

    private RichTextConfig config;

    @Inject
    @GraphQLOsgiService
    public void setRichTextConfig(RichTextConfig config) {
        this.config = config;
    }

    @GraphQLField
    @GraphQLName("config")
    @GraphQLDescription("Returns appropriate configuration name for richtext ckeditor5")
    public String validate(@GraphQLName("path") @GraphQLNonNull String path) {

        if (config == null) {
            return "default";
        }

        try {
            JCRSessionWrapper session = JCRSessionFactory.getInstance().getCurrentUserSession();
            JCRNodeWrapper node = session.getNode(path);
            String siteKey = node.getResolveSite().getSiteKey();

            // Find all available configs for this siteKey and see if any of them can be used
            String configForSite = getConfigForSite(node, siteKey);

            if (configForSite != null) {
                return configForSite;
            }

            // Find all available default configs (configs without siteKeys) and see if any of them can be used
            String defaultConfig = getDefaultConfig(node);

            if (defaultConfig != null) {
                return defaultConfig;
            }

            // If no config is defined by the user return default config name based on permission level
            if (node.hasPermission("view-full-wysiwyg-editor")) {
                return "default";
            } else if (node.hasPermission("view-basic-wysiwyg-editor")) {
                return "advanced";
            } else if (node.hasPermission("view-light-wysiwyg-editor")) {
                return "light";
            }

            return "minimal";

        } catch (RepositoryException e) {
            throw new DataFetchingException(e);
        }
    }

    private String getConfigForSite(JCRNodeWrapper node, String siteKey) {
        List<CKEditorConfiguration> configsForSite = config.getConfigs().stream().filter(c -> c.getSiteKeys().contains(siteKey)).collect(Collectors.toList());

        // Return first available permitted config name
        return getFirstPermittedConfig(node, configsForSite);
    }

    private String getDefaultConfig(JCRNodeWrapper node) {
        List<CKEditorConfiguration> defaultConfig = config.getConfigs().stream().filter(c -> c.getSiteKeys().isEmpty()).collect(Collectors.toList());

        // Return first available permitted config name
        return getFirstPermittedConfig(node, defaultConfig);
    }

    private static String getFirstPermittedConfig(JCRNodeWrapper node, List<CKEditorConfiguration> configs) {
        for (CKEditorConfiguration cfg : configs) {
            String permission = cfg.getPermission();

            if (permission != null && node.hasPermission(permission)) {
                return cfg.getName();
            } else if (permission == null) {
                return cfg.getName();
            }
        }

        return null;
    }
}

