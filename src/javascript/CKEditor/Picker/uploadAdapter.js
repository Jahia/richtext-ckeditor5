import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import FileRepository from '@ckeditor/ckeditor5-upload/src/filerepository';
import {v4} from 'uuid';

/* global jahia */

export class PickerUploadAdapter extends Plugin {
    static get requires() {
        return [FileRepository];
    }

    static get pluginName() {
        return 'PickerUploadAdapter';
    }

    init() {
        // Register CKFinderAdapter
        this.editor.plugins.get(FileRepository).createUploadAdapter = loader => new UploadAdapter(loader);
    }
}

class UploadAdapter {
    constructor(loader) {
        this.loader = loader;
    }

    upload() {
        console.log('Upload');
        return this.loader.file.then(file => new Promise((resolve, reject) => {
            const store = jahia.reduxStore;
            const path = '/sites/digitall/files';
            const id = v4();
            const unsubscribe = store.subscribe(() => {
                const uploads = store.getState().jcontent?.fileUpload?.uploads;
                const matchingUpload = uploads?.find(v => v.id === id);
                if (matchingUpload && matchingUpload.status === 'UPLOADED') {
                    unsubscribe();
                    console.log('Uploaded node', matchingUpload.uuid);
                    // Todo should get path from uuid
                    resolve({default: '/files/default' + path + '/' + file.name});
                } else if (!matchingUpload) {
                    unsubscribe();
                    reject();
                }
            });

            store.dispatch({
                type: 'FILEUPLOAD_ADD_UPLOADS',
                payload: [{error: null, status: 'QUEUED', path, file, id, type: 'upload'}]
            });

            store.dispatch({
                type: 'FILEUPLOAD_TAKE_FROM_QUEUE',
                payload: 1
            });
        }));
    }

    abort() {
        console.log('abort');
    }
}
