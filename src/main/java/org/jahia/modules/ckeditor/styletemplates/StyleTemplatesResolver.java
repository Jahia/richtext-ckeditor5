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
package org.jahia.modules.ckeditor.styletemplates;

import org.apache.commons.io.IOUtils;
import org.jahia.data.templates.JahiaTemplatesPackage;
import org.jahia.modules.ckeditor.graphql.query.GqlRichTextStyleDefinition;
import org.jahia.modules.ckeditor.graphql.query.GqlRichTextStyleTemplates;
import org.jahia.registries.ServicesRegistry;
import org.jahia.services.content.JCRNodeWrapper;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;
import org.osgi.framework.Bundle;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import javax.jcr.PathNotFoundException;
import javax.jcr.RepositoryException;

import java.io.IOException;
import java.io.InputStream;
import java.net.URL;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

/**
 * Resolves the style-template configuration shipped in the current site's
 * templates-set module. See docs/style-templates.md for the JSON shape.
 */
public final class StyleTemplatesResolver {

    static final String CONFIG_FILE = "/ckeditor_styles.json";
    static final String FIELD_STYLESHEET = "templateStylesheet";
    static final String FIELD_TEMPLATES = "templates";
    static final String FIELD_NAME = "name";
    static final String FIELD_ELEMENT = "element";
    static final String FIELD_CLASSES = "classes";

    private static final Logger logger = LoggerFactory.getLogger(StyleTemplatesResolver.class);

    private StyleTemplatesResolver() {
    }

    /**
     * Returns the resolved style templates for the given node, or {@code null}
     * if the templates-set ships no {@code ckeditor_styles.json}, the file is
     * unreadable, or the JSON is structurally invalid.
     */
    public static GqlRichTextStyleTemplates resolve(JCRNodeWrapper node) {
        if (node == null) {
            return null;
        }
        String templatesSet = resolveTemplatesSet(node);
        if (templatesSet == null) {
            return null;
        }
        JahiaTemplatesPackage pkg = ServicesRegistry.getInstance()
                .getJahiaTemplateManagerService()
                .getTemplatePackageById(templatesSet);
        if (pkg == null || pkg.getBundle() == null) {
            return null;
        }
        Bundle bundle = pkg.getBundle();
        URL res = bundle.getResource(CONFIG_FILE);
        if (res == null) {
            return null;
        }
        String json;
        try (InputStream in = res.openStream()) {
            json = IOUtils.toString(in, StandardCharsets.UTF_8);
        } catch (IOException e) {
            logger.warn("Failed to read {} from templates-set {}: {}", CONFIG_FILE, templatesSet, e.getMessage());
            return null;
        }
        ParsedTemplates parsed = parseDefinitions(json);
        if (parsed == null) {
            logger.warn("Invalid {} in templates-set {} - style templates will not be loaded", CONFIG_FILE, templatesSet);
            return null;
        }
        String stylesheetUrl = null;
        if (parsed.stylesheet != null) {
            String relPath = parsed.stylesheet.startsWith("/") ? parsed.stylesheet : "/" + parsed.stylesheet;
            if (bundle.getResource(relPath) != null) {
                stylesheetUrl = "/modules/" + pkg.getId() + relPath;
            } else {
                logger.warn("templateStylesheet '{}' declared in {} does not exist in bundle - skipping stylesheet",
                        parsed.stylesheet, templatesSet);
            }
        }
        return new GqlRichTextStyleTemplates(stylesheetUrl, parsed.definitions);
    }

    private static String resolveTemplatesSet(JCRNodeWrapper node) {
        try {
            return node.getResolveSite().getPropertyAsString("j:templatesSet");
        } catch (PathNotFoundException e) {
            return null;
        } catch (RepositoryException e) {
            logger.warn("Failed to resolve j:templatesSet for node {}: {}", safePath(node), e.getMessage());
            return null;
        }
    }

    private static String safePath(JCRNodeWrapper node) {
        return node.getPath();
    }

    /**
     * Pure JSON parser, separated from OSGi/JCR concerns so it can be unit-tested.
     * Returns null on any structural or parse failure.
     */
    public static ParsedTemplates parseDefinitions(String json) {
        if (json == null || json.trim().isEmpty()) {
            return null;
        }
        JSONObject root;
        try {
            root = new JSONObject(json);
        } catch (JSONException e) {
            logger.warn("ckeditor_styles.json is not valid JSON: {}", e.getMessage());
            return null;
        }
        String stylesheet = null;
        if (root.has(FIELD_STYLESHEET) && !root.isNull(FIELD_STYLESHEET)) {
            Object value = root.opt(FIELD_STYLESHEET);
            if (!(value instanceof String) || ((String) value).isEmpty()) {
                logger.warn("ckeditor_styles.json: '{}' must be a non-empty string", FIELD_STYLESHEET);
                return null;
            }
            stylesheet = (String) value;
        }
        List<GqlRichTextStyleDefinition> definitions = new ArrayList<>();
        if (root.has(FIELD_TEMPLATES) && !root.isNull(FIELD_TEMPLATES)) {
            Object templates = root.opt(FIELD_TEMPLATES);
            if (!(templates instanceof JSONArray)) {
                logger.warn("ckeditor_styles.json: '{}' must be an array", FIELD_TEMPLATES);
                return null;
            }
            JSONArray array = (JSONArray) templates;
            for (int i = 0; i < array.length(); i++) {
                Object entry = array.opt(i);
                if (!(entry instanceof JSONObject)) {
                    logger.warn("ckeditor_styles.json: templates[{}] must be an object", i);
                    return null;
                }
                GqlRichTextStyleDefinition def = parseDefinition((JSONObject) entry, i);
                if (def == null) {
                    return null;
                }
                definitions.add(def);
            }
        }
        return new ParsedTemplates(stylesheet, definitions);
    }

    private static GqlRichTextStyleDefinition parseDefinition(JSONObject obj, int index) {
        String name = obj.optString(FIELD_NAME, null);
        String element = obj.optString(FIELD_ELEMENT, null);
        if (name == null || name.isEmpty()) {
            logger.warn("ckeditor_styles.json: templates[{}].name is missing or empty", index);
            return null;
        }
        if (element == null || element.isEmpty()) {
            logger.warn("ckeditor_styles.json: templates[{}].element is missing or empty", index);
            return null;
        }
        Object classesObj = obj.opt(FIELD_CLASSES);
        if (!(classesObj instanceof JSONArray)) {
            logger.warn("ckeditor_styles.json: templates[{}].classes must be an array of strings", index);
            return null;
        }
        JSONArray classesArr = (JSONArray) classesObj;
        List<String> classes = new ArrayList<>(classesArr.length());
        for (int i = 0; i < classesArr.length(); i++) {
            Object c = classesArr.opt(i);
            if (!(c instanceof String) || ((String) c).isEmpty()) {
                logger.warn("ckeditor_styles.json: templates[{}].classes[{}] must be a non-empty string", index, i);
                return null;
            }
            classes.add((String) c);
        }
        return new GqlRichTextStyleDefinition(name, element, classes);
    }

    public static final class ParsedTemplates {
        public final String stylesheet;
        public final List<GqlRichTextStyleDefinition> definitions;

        public ParsedTemplates(String stylesheet, List<GqlRichTextStyleDefinition> definitions) {
            this.stylesheet = stylesheet;
            this.definitions = definitions == null ? Collections.emptyList() : definitions;
        }
    }
}
