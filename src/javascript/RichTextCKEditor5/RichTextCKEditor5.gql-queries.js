import gql from 'graphql-tag';

export const getCKEditorConfigurationPath = gql`
    query getCKEditorConfiguration($nodePath: String!) {
        richtext {
            config(path: $nodePath)
        }
    }
`;
