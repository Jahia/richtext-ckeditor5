import gql from 'graphql-tag';

export const getCKEditorConfiguration = gql`
    query getCKEditorConfiguration($nodePath: String!) {
        jcontent {
            richtext {
                config(path: $nodePath) {
                    configName
                    excludeToolbarItems
                    styleTemplates {
                        stylesheet
                        definitions {
                            name
                            element
                            classes
                        }
                    }
                }
            }
        }
    }
`;
