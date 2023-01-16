import gql from 'graphql-tag';

export const getNode = gql`
    query getNode($path: String!) {
        jcr {
            nodeByPath(path: $path) {
                uuid,
                workspace
            }
        }
    }
`;

export const getThread = gql`
    query getThread($path: String!) {
        jcr {
            nodeByPath(path:$path) {
                threadId: property(name:"threadId") {
                    value
                }
                children(fieldSorter:{sortType:ASC, fieldName:"jcr:created"}) {
                    nodes {
                        commentId:property(name:"commentId") {
                            value
                        }
                        authorId: property(name:"userId") {
                            value
                        }
                        content: property(name:"comment") {
                            value
                        }
                        createdAt: property(name:"jcr:created") {
                            value
                        }
                    }
                }
            }
        }
    }
`;
