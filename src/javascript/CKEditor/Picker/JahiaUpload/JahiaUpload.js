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

        const clipboardPipeline = this.editor.plugins.get('ClipboardPipeline');
        const dragDropPlugin = this.editor.plugins.get('DragDrop');

        // Disable pasting of image by removing any img element in the data content
        this.listenTo(clipboardPipeline, 'inputTransformation', (evt, data) => {
            if (data.method === 'paste') {
                this._removeImages(data.content);
            }
        });

        /**
         * Cancel drag-drop event when leaving the CKEditor 5 area
         * to prevent CK5 from handling drop event and removing the dragged items from the editor.
         */
        this.listenTo(this.editor.editing.view.document, 'dragend', (evt, data) => {
            const {domEvent} = data;
            const ckEditorArea = document.querySelector('.ck-editor__editable');
            const dragOverElem = document.elementFromPoint(domEvent.clientX, domEvent.clientY);

            const isOutsideCK5 = !ckEditorArea.contains(dragOverElem);
            if (isOutsideCK5) {
                console.debug('We are leaving ckeditor 5 editor area, canceling CK5 drag-and-drop');
                dragDropPlugin._draggedRange.detach();
                dragDropPlugin._draggedRange = null;
                evt.stop();
                data.preventDefault();
            }
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

    /** @param {import('ckeditor5').ViewDocumentFragment | import('ckeditor5').ViewElement} viewElementOrFragment */
    _removeImages(viewElementOrFragment) {
        const viewChildren = Array.from(viewElementOrFragment.getChildren());
        for (const child of viewChildren) {
            if (child.is('element', 'img') && !child.getAttribute('src')?.match(/\/files\/(\{|%7[bB])workspace(\{|%7[dD])/)) {
                child._remove();
            } else if (child.is('element')) {
                this._removeImages(child);
            }
        }
    }
}
