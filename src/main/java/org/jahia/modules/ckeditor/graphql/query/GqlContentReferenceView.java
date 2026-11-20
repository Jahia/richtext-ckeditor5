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

@GraphQLName("RichTextContentReferenceView")
@GraphQLDescription("A view that a referenced content can be rendered with inside a rich text")
public class GqlContentReferenceView {
    private final String key;
    private final String displayName;

    public GqlContentReferenceView(String key, String displayName) {
        this.key = key;
        this.displayName = displayName;
    }

    @GraphQLField
    @GraphQLNonNull
    @GraphQLName("key")
    @GraphQLDescription("Key of the view, stored in the data-jahia-view attribute")
    public String getKey() {
        return key;
    }

    @GraphQLField
    @GraphQLNonNull
    @GraphQLName("displayName")
    @GraphQLDescription("Display name of the view, or its key when it has none")
    public String getDisplayName() {
        return displayName;
    }
}
