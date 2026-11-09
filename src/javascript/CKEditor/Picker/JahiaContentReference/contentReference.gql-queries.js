import gql from 'graphql-tag';

export const richTextContentReferenceCard = gql`
    query richTextContentReferenceCard($uuid: String!, $language: String!, $uilang: String!, $refusedTypes: [String]!) {
        jcr {
            nodeById(uuid: $uuid) {
                uuid
                workspace
                path
                name
                displayName(language: $language)
                primaryNodeType {
                    name
                    displayName(language: $uilang)
                    icon
                }
                refused: isNodeType(type: {types: $refusedTypes})
            }
        }
    }
`;

export const richTextContentReferenceCardByPath = gql`
    query richTextContentReferenceCardByPath($path: String!, $language: String!, $uilang: String!, $refusedTypes: [String]!) {
        jcr {
            nodeByPath(path: $path) {
                uuid
                workspace
                path
                name
                displayName(language: $language)
                primaryNodeType {
                    name
                    displayName(language: $uilang)
                    icon
                }
                refused: isNodeType(type: {types: $refusedTypes})
            }
        }
    }
`;

export const richTextContentReferenceViews = gql`
    query richTextContentReferenceViews($uuid: String!, $path: String!) {
        jcontent {
            richtext {
                referenceViews(uuid: $uuid, path: $path) {
                    key
                    displayName
                }
            }
        }
    }
`;
