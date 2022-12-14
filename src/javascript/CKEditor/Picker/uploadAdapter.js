import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import FileRepository from '@ckeditor/ckeditor5-upload/src/filerepository'

export class PickerUploadAdapter extends Plugin {
    static get requires() {
        return [ FileRepository ];
    }

    static get pluginName() {
        return 'PickerUploadAdapter';
    }

    init() {
        // Register CKFinderAdapter
        this.editor.plugins.get( FileRepository ).createUploadAdapter = loader => new UploadAdapter(loader);
    }
}

class UploadAdapter {
    constructor(loader) {
        this.loader = loader;
    }

    upload() {
        console.log('upload')
        return this.loader.file
            .then( file => new Promise( ( resolve, reject ) => {
                console.log('upload', file);
                jahia.reduxStore.dispatch({
                    type:"FILEUPLOAD_ADD_UPLOADS",
                    payload: [{
                        error: null,
                        status: "QUEUED",
                        path: "/sites/digitall/files",
                        file: file,
                        id: '971620cb-6500-4797-bdab-53444e950132',
                        type: 'upload'
                    }]
                });

                jahia.reduxStore.dispatch({
                    type: "FILEUPLOAD_TAKE_FROM_QUEUE",
                    payload: 1
                });

                resolve({default:"/files/default/sites/digitall/files/" + file.name});
            }
        ));
    }

    abort() {
        console.log('abort')
    }

}
