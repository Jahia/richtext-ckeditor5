/* eslint-disable */
import {addCommentToThread, addThreadAndComment, updateCommentInThread, removeNode} from './CommentAdapter.gql-mutations';
import {getNode, getThread} from './CommentAdapter.gql-queries';

class CommentsAdapter {
    constructor(editor) {
        this.editor = editor;
        this.config = null;
        console.log('Init adapter');
    }

    static get requires() {
        return ['CommentsRepository'];
    }

    init() {
        const usersPlugin = this.editor.plugins.get('Users');
        const commentsRepositoryPlugin = this.editor.plugins.get('CommentsRepository');
        const userLoad = this.editor.plugins.get('JahiaUserLoad');
        this.config = this.editor.config.get('userload');
        let config = this.config;

        // Load the users data.
        for (const user of userLoad.getUsers()) {
            usersPlugin.addUser(user);
        }

        // Set the current user.
        usersPlugin.defineMe(userLoad.getCurrentUser().id);

        // Set the adapter on the `CommentsRepository#adapter` property.
        commentsRepositoryPlugin.adapter = {
            addComment(data) {
                console.log('Comment added', data);

                // Write a request to your database here. The returned `Promise`
                // should be resolved when the request has finished.
                // When the promise resolves with the comment data object, it
                // will update the editor comment using the provided data.
                return new Promise(async resolve => {
                    const threadExists = await CommentsAdapter.threadExists(config, data.threadId);

                    console.log('Exists', threadExists);

                    if (threadExists) {
                        const resp = await config.client.mutate({mutation: addCommentToThread, variables: {
                            path: config.editorContext.path + '/' + data.threadId,
                            comment: data.content,
                            commentId: data.commentId,
                            userId: userLoad.getCurrentUser().id,
                            userName: userLoad.getCurrentUser().name
                        }});
                        resolve({
                            createdAt: new Date(resp.data?.jcr?.mutateNode?.addChild?.comment?.created?.value)
                        });
                    } else {
                        const resp = await config.client.mutate({mutation: addThreadAndComment, variables: {
                            path: config.editorContext.path,
                            threadId: data.threadId,
                            comment: data.content,
                            commentId: data.commentId,
                            userId: userLoad.getCurrentUser().id,
                            userName: userLoad.getCurrentUser().name
                        }});
                        resolve({
                            createdAt: new Date(resp.data?.jcr?.addNode?.addChild?.comment?.created?.value)
                        });
                    }
                });
            },

            updateComment(data) {
                console.log('Comment updated', data);

                return new Promise(async resolve => {
                    await config.client.mutate({mutation: updateCommentInThread, variables: {
                        path: config.editorContext.path + '/' + data.threadId + '/' + data.commentId,
                        comment: data.content
                    }});
                    resolve();
                });
            },

            removeComment(data) {
                console.log('Comment removed', data);

                return new Promise(async resolve => {
                    await config.client.mutate({mutation: removeNode, variables: {
                        path: config.editorContext.path + '/' + data.threadId + '/' + data.commentId
                    }});
                    resolve();
                });
            },

            getCommentThread(data) {
                console.log('Getting comment thread', data);
                return new Promise(async resolve => {
                    const resp = await config.client.query({query: getThread, variables: {
                        path: config.editorContext.path + '/' + data.threadId
                    }});

                    resolve({
                        threadId: data.threadId,
                        isFromAdapter: true,
                        comments: resp.data.jcr.nodeByPath.children.nodes.map(n => ({
                            commentId: n.commentId.value,
                            authorId: n.authorId.value,
                            content: n.content.value,
                            createdAt: new Date(n.createdAt.value)
                        }))
                    });
                });
            }
        };
    }

    static threadExists(config, threadId) {
        return new Promise(async resolve => {
            await config.client.query({query: getNode, variables: {
                path: config.editorContext.path + '/' + threadId
            }}).then(({data}) => {
                console.log(data);
                if (data?.jcr?.nodeByPath?.uuid) {
                    resolve(true);
                } else {
                    resolve(false);
                }
            }).catch(e => {
                console.info(e);
                resolve(false);
            });
        });
    }
}

export default CommentsAdapter;
