import {FileRepository, Plugin} from 'ckeditor5';
import {JahiaUploadAdapter} from './JahiaUploadAdapter';

export class JahiaUpload extends Plugin {
    static get requires() {
        return [FileRepository];
    }

    static get pluginName() {
        return 'JahiaUpload';
    }

    init() {
        // Register CKFinderAdapter
        this.editor.plugins.get(FileRepository).createUploadAdapter = loader => new JahiaUploadAdapter(loader, this.editor);

        // Disable drag and drop upload in editor
        const stopUpload = (evt, data) => {
            if (data.dataTransfer?.files?.length > 0) {
                console.warn('Drag and drop upload is disabled in the editor. Please use the picker to upload files.');
                evt.stop();
                data.preventDefault();
            }
        };

        this.editor.editing.view.document.on('drop', stopUpload, {priority: 'high'});
        this.editor.editing.view.document.on('paste', stopUpload, {priority: 'high'});
    }
}
