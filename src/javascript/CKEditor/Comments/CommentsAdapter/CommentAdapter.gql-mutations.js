import gql from 'graphql-tag';

export const addThreadAndComment = gql`
    mutation addThreadAndComment($path: String!, $threadId: String!, $comment: String!, $commentId: String!, $userName: String!, $userId: String!) {
        jcr {
            addNode(parentPathOrId: $path, name: $threadId, primaryNodeType:"jnt:commentThread") {
                mutateProperty(name:"threadId") {
                    setValue(value:$threadId)
                }
                addChild(primaryNodeType:"jnt:bigTextComment", name: $commentId) {
                    commentAdded: mutateProperty(name:"comment") {
                        setValue(value:$comment)
                    }
                    commentId: mutateProperty(name:"commentId") {
                        setValue(value:$commentId)
                    }
                    userId: mutateProperty(name:"userId") {
                        setValue(value:$userId)
                    }
                    userName: mutateProperty(name:"userName") {
                        setValue(value:$userName)
                    }
                    comment: node {
                        created:property(name:"jcr:lastModified") {
                            value
                        }
                    }
                }
            }
        }
    }
`;

export const addCommentToThread = gql`
    mutation addCommentToThread($path: String!, $comment: String!, $commentId: String!, $userName: String!, $userId: String!) {
        jcr {
            mutateNode(pathOrId: $path) {
                addChild(primaryNodeType:"jnt:bigTextComment", name: $commentId) {
                    commentAdded: mutateProperty(name:"comment") {
                        setValue(value:$comment)
                    }
                    commentId: mutateProperty(name:"commentId") {
                        setValue(value:$commentId)
                    }
                    userId: mutateProperty(name:"userId") {
                        setValue(value:$userId)
                    }
                    userName: mutateProperty(name:"userName") {
                        setValue(value:$userName)
                    }
                    comment: node {
                        created:property(name:"jcr:lastModified") {
                            value
                        }
                    }
                }
            }
        }
    }
`;

export const updateCommentInThread = gql`
    mutation updateCommentInThread($path: String!, $comment: String!) {
        jcr {
            mutateNode(pathOrId: $path) {
                content: mutateProperty(name:"comment") {
                    setValue(value:$comment)
                }
                comment: node {
                    created:property(name:"jcr:lastModified") {
                        value
                    }
                }
            }
        }
    }
`;

export const removeNode = gql`
    mutation removeNode($path: String!) {
        jcr {
            deleteNode(pathOrId: $path)
        }
    }
`;
