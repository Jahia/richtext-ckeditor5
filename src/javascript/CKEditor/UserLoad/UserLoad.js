import Plugin from '@ckeditor/ckeditor5-core/src/plugin';

import {getCurrentUser} from './UserLoad.gql-queries';

export default class UserLoad extends Plugin {
    constructor(editor) {
        super(editor);
        this.editor = editor;
        console.log('User load', editor);
        this.users = [];
        this.currentUser = null;
    }

    static get pluginName() {
        return 'JahiaUserLoad';
    }

    static get requires() {
        return [];
    }

    init() {
        return new Promise((resolve, reject) => {
            console.log('Loading users');
            const config = this.editor.config.get('userload');
            config.client.query({query: getCurrentUser}).then(({data}) => {
                this.currentUser = data.currentUser;
                console.log('Set current user', this.currentUser);
                resolve(true);
            }).catch(e => {
                console.error(e);
                reject();
            });
        });
    }

    getCurrentUser() {
        return this.currentUser;
    }

    getUsers() {
        return this.users.concat(this.currentUser);
    }
}
