import {FileRepository, Plugin} from 'ckeditor5';
import {v4} from 'uuid';
import {getNode} from '~/CKEditor/Picker/uploadAdapter.gql-queries';

export class PickerUploadAdapter extends Plugin {
    static get requires() {
        return [FileRepository];
    }

    static get pluginName() {
        return 'PickerUploadAdapter';
    }

    init() {
        // Register CKFinderAdapter
        this.editor.plugins.get(FileRepository).createUploadAdapter = loader => new UploadAdapter(loader, this.editor);

        // Disable drag and drop in editor
        const stopEvent = (evt, data) => {
            evt.stop();
            data.preventDefault();
        };

        this.editor.editing.view.document.on('dragover', stopEvent, {priority: 'high'});
        this.editor.editing.view.document.on('dragstart', stopEvent, {priority: 'high'});
        this.editor.editing.view.document.on('drop', stopEvent, {priority: 'high'});
    }
}

class UploadAdapter {
    constructor(loader, editor) {
        this.loader = loader;
        this.editor = editor;
    }

    upload() {
        console.log('Upload');
        return this.loader.file.then(file => new Promise((resolve, reject) => {
            const pickerConfig = this.editor.config.get('picker');
            const store = pickerConfig.store;
            const path = '/sites/' + pickerConfig.site + '/files';
            const id = v4();
            const unsubscribe = store.subscribe(() => {
                const uploads = store.getState().jcontent?.fileUpload?.uploads;
                const matchingUpload = uploads?.find(v => v.id === id);
                if (matchingUpload && matchingUpload.status === 'UPLOADED') {
                    unsubscribe();
                    console.log('Uploaded node', matchingUpload.uuid);
                    pickerConfig.client.query({query: getNode, variables: {uuid: matchingUpload.uuid}}).then(({data}) => {
                        resolve({default: '/files/{workspace}' + data.jcr.nodeById.path});
                    });
                    // eslint-disable-next-line no-warning-comments
                    // Todo should get path from uuid
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
