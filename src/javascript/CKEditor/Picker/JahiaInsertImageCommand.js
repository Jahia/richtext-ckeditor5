import {Command} from 'ckeditor5';

export class JahiaInsertImageCommand extends Command {
    constructor(editor, type) {
        super(editor);
        this.type = type;

        this.isEnabled = true;

        // // Remove default document listener to lower its priority.
        // this.stopListening(this.editor.model.document, 'change');
        //
        // // Lower this command listener priority to be sure that refresh() will be called after link & image refresh.
        // this.listenTo(this.editor.model.document, 'change', () => this.refresh(), {priority: 'low'});
    }

    refresh() {
        //
    }

    execute() {
        const editor = this.editor;

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

                    editor.execute('imageInsert', {source: `${contentPicker ? contentPrefix : filePrefix}${pickerResult.path}${contentPicker ? '.html' : ''}`});
                });
            },
            ...pickerConfig
        });
    }
}

