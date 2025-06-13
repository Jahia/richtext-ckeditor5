import {FileRepository, Plugin} from 'ckeditor5';
import {JahiaUploadAdapter} from './JahiaUploadAdapter';

/**
 * Responsible for handling file uploads in the CK5 editor through events like drag-and-drop and paste.
 * This plugin integrates with the CKEditor FileRepository to manage file uploads.
 *
 * Note: Uploads to Jahia have been disabled in the editor for now until we find a way to automatically organize uploads into folders.
 * Instead, this plugin disables any drag-and-drop or paste upload functionality and removes any image elements from the content.
 */
export class JahiaUpload extends Plugin {
    static get requires() {
        return [FileRepository];
    }

    static get pluginName() {
        return 'JahiaUpload';
    }

    init() {
        // To be re-enabled
        // this.createUploadAdapter();

        // Disable pasting of image by removing any img element in the data content
        const clipboardPipeline = this.editor.plugins.get('ClipboardPipeline');
        this.listenTo(clipboardPipeline, 'inputTransformation', (evt, data) => {
            this._removeImages(data.content);
        });
    }

    createUploadAdapter() {
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

    _removeImages(viewElementOrFragment) {
        const viewChildren = Array.from(viewElementOrFragment.getChildren());
        for (const child of viewChildren) {
            if (child.is('element', 'img')) {
                child._remove();
            } else if (child.is('element')) {
                this._removeImages(child);
            }
        }
    }
}
