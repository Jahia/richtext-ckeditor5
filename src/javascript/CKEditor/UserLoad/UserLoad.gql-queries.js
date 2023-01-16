import gql from 'graphql-tag';

export const getCurrentUser = gql`
    query getCurrentUser {
        currentUser {
            name: displayName,
            id: username
        }
    }
`;
