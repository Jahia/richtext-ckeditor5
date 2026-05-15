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

import java.util.Collections;
import java.util.List;

@GraphQLName("RichTextStyleDefinition")
@GraphQLDescription("Single style template definition for the CKEditor 5 style dropdown")
public class GqlRichTextStyleDefinition {
    private final String name;
    private final String element;
    private final List<String> classes;

    public GqlRichTextStyleDefinition(String name, String element, List<String> classes) {
        this.name = name;
        this.element = element;
        this.classes = classes == null ? Collections.emptyList() : classes;
    }

    @GraphQLField
    @GraphQLNonNull
    @GraphQLName("name")
    @GraphQLDescription("Display name shown in the style dropdown")
    public String getName() {
        return name;
    }

    @GraphQLField
    @GraphQLNonNull
    @GraphQLName("element")
    @GraphQLDescription("HTML element the style applies to (e.g. p, h1, div)")
    public String getElement() {
        return element;
    }

    @GraphQLField
    @GraphQLNonNull
    @GraphQLName("classes")
    @GraphQLDescription("CSS classes applied when the style is selected")
    public List<String> getClasses() {
        return classes;
    }
}
