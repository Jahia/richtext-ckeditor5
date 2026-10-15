import gql from 'graphql-tag';

export const richTextCreatableTypes = gql`
    query richTextCreatableTypes($uuid: String!, $uilang: String!, $excludedNodeTypes: [String]) {
        forms {
            contentTypesAsTree(uuidOrPath: $uuid, uiLocale: $uilang, includeSubTypes: true, excludedNodeTypes: $excludedNodeTypes) {
                id
                name
                label
                iconURL
                nodeType {
                    name
                    mixin
                }
                children {
                    id
                    name
                    label
                    iconURL
                    nodeType {
                        name
                        mixin
                    }
                    parent {
                        id
                        name
                    }
                }
            }
        }
    }
`;
