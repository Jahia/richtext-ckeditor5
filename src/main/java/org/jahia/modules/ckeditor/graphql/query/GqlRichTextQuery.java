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
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import javax.inject.Inject;
import javax.jcr.RepositoryException;
import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

@GraphQLName("RichTextQuery")
@GraphQLDescription("Provides functionality necessary for operation of richtext ckeditor5")
public class GqlRichTextQuery {
    private static final Logger logger = LoggerFactory.getLogger(GqlRichTextQuery.class);
    private RichTextConfig config;

    @Inject
    @GraphQLOsgiService
    public void setRichTextConfig(RichTextConfig config) {
        this.config = config;
    }

    @GraphQLField
    @GraphQLName("config")
    @GraphQLDescription("Returns appropriate configuration for richtext ckeditor5")
    public GqlRichTextConfigResult validate(@GraphQLName("path") @GraphQLNonNull String path) {
        try {

            JCRSessionWrapper session = JCRSessionFactory.getInstance().getCurrentUserSession();
            JCRNodeWrapper node = session.getNode(path);
            String siteKey = node.getResolveSite().getSiteKey();

            // Global excludeToolbarItems will be used if no specific config has them defined
            List<String> globalExcludeItems = config.getExcludeToolbarItems();

            // Find all available configs for this siteKey and see if any of them can be used
            CKEditorConfiguration configForSite = getConfigForSite(node, siteKey);

            if (configForSite != null) {
                logger.debug("config for site found for sitekey {}", siteKey);
                return new GqlRichTextConfigResult(configForSite.getName(), configForSite.getExcludeToolbarItems().isEmpty() ? globalExcludeItems :  configForSite.getExcludeToolbarItems());
            }

            // Find all available default configs (configs without siteKeys) and see if any of them can be used
            CKEditorConfiguration defaultConfig = getDefaultConfig(node);

            if (defaultConfig != null) {
                logger.debug("default config found for {}", node.getPath());
                return new GqlRichTextConfigResult(defaultConfig.getName(), defaultConfig.getExcludeToolbarItems().isEmpty() ? globalExcludeItems :  defaultConfig.getExcludeToolbarItems());
            }

            // If no config is defined by the user return default config name based on permission level
            if (node.hasPermission("view-full-wysiwyg-editor")) {
                logger.debug("complete config found for {}", node.getPath());
                return new GqlRichTextConfigResult("complete", globalExcludeItems);
            } else if (node.hasPermission("view-basic-wysiwyg-editor")) {
                logger.debug("advanced config found for {}", node.getPath());
                return new GqlRichTextConfigResult("advanced", globalExcludeItems);
            } else if (node.hasPermission("view-light-wysiwyg-editor")) {
                logger.debug("light config found for {}", node.getPath());
                return new GqlRichTextConfigResult("light", globalExcludeItems);
            }
            logger.debug("minimal config found for {}", node.getPath());
            return new GqlRichTextConfigResult("minimal", globalExcludeItems);

        } catch (RepositoryException e) {
            throw new DataFetchingException(e);
        }
    }

    private CKEditorConfiguration getConfigForSite(JCRNodeWrapper node, String siteKey) {
        List<CKEditorConfiguration> configsForSite = config.getConfigs().stream()
                .filter(c -> c.getSiteKeys().contains(siteKey))
                .collect(Collectors.toList());
        return getFirstPermittedConfig(node, configsForSite);
    }

    private CKEditorConfiguration getDefaultConfig(JCRNodeWrapper node) {
        List<CKEditorConfiguration> defaultConfigs = config.getConfigs().stream()
                .filter(c -> c.getSiteKeys().isEmpty())
                .collect(Collectors.toList());
        return getFirstPermittedConfig(node, defaultConfigs);
    }

    private static CKEditorConfiguration getFirstPermittedConfig(JCRNodeWrapper node, List<CKEditorConfiguration> configs) {
        for (CKEditorConfiguration cfg : configs) {
            String permission = cfg.getPermission();
            if (permission == null || node.hasPermission(permission)) {
                return cfg;
            }
        }
        return null;
    }
}

