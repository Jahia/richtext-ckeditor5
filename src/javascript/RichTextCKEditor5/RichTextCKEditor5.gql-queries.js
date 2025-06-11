import gql from 'graphql-tag';

export const getCKEditorConfiguration = gql`
    query getCKEditorConfiguration($nodePath: String!) {
        richtext {
            config(path: $nodePath)
        }
    }
`;
