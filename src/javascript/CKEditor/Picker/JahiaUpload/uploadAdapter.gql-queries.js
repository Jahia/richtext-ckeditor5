import gql from 'graphql-tag';

export const getNode = gql`
    query getNode($uuid: String!) {
        jcr {
            nodeById(uuid: $uuid) {
                workspace
                name
                path
                uuid
            }
        }
    }
`;
