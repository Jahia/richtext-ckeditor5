import {Command} from 'ckeditor5';
import {encodePath} from '../../../RichTextCKEditor5/RichTextCKEditor5.utils';

export class InsertJahiaImageCommand extends Command {
    constructor(editor, type) {
        super(editor);
        this.type = type;
    }

    refresh() {
        const imageInsertCommand = this.editor.commands.get('imageInsert');
        this.isEnabled = imageInsertCommand ? imageInsertCommand.isEnabled : false;
    }

    execute() {
        const editor = this.editor;

        if (!this.isEnabled) {
            return;
        }

        const pickerConfig = editor.config.get('picker');

        window.CE_API.openPicker({
            type: this.type,
            value: null,
            setValue: pickerResults => {
                const contextPath = (window.contextJsParameters && window.contextJsParameters.contextPath) || '';

                const contentPrefix = `${contextPath}/cms/{mode}/{lang}`;
                const filePrefix = `${contextPath}/files/{workspace}`;
                pickerResults.forEach(pickerResult => {
                    const contentPicker = false;
                    const imageCommand = editor.commands.get('imageInsert');

                    // Check if inserting an image is actually possible - it might be possible to only insert a link.
                    if (!imageCommand.isEnabled) {
                        const notification = editor.plugins.get('Notification');
                        const t = editor.locale.t;

                        notification.showWarning(t('Could not insert image at the current position.'), {
                            title: t('Inserting image failed'),
                            namespace: 'ckfinder'
                        });
                    }

                    editor.execute('imageInsert', {source: `${contentPicker ? contentPrefix : filePrefix}${encodePath(pickerResult.path)}${contentPicker ? '.html' : ''}`});
                });
            },
            ...pickerConfig
        });
    }
}

