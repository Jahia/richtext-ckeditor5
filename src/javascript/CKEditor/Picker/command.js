import Command from '@ckeditor/ckeditor5-core/src/command';

export class PickerCommand extends Command {
    constructor(editor) {
        super(editor);

        // Remove default document listener to lower its priority.
        this.stopListening(this.editor.model.document, 'change');

        // Lower this command listener priority to be sure that refresh() will be called after link & image refresh.
        this.listenTo(this.editor.model.document, 'change', () => this.refresh(), {priority: 'low'});
    }

    refresh() {
        const imageCommand = this.editor.commands.get('imageInsert');
        const linkCommand = this.editor.commands.get('link');

        // The CKFinder command is enabled when one of image or link command is enabled.
        this.isEnabled = imageCommand.isEnabled || linkCommand.isEnabled;
    }

    execute() {
        const editor = this.editor;

        const pickerConfig = editor.config.get('picker');
        const contentPicker = false;

        console.log('execute picker',pickerConfig);

        window.CE_API.openPicker({
            type: 'image',
            value: null,
            setValue: pickerResults => {
                const contextPath = (window.contextJsParameters && window.contextJsParameters.contextPath) || '';

                const contentPrefix = `${contextPath}/cms/{mode}/{lang}`;
                const filePrefix = `${contextPath}/files/{workspace}`;
                console.log(pickerResults);
                pickerResults.forEach(pickerResult => {
                    insertImages(editor, `${contentPicker ? contentPrefix : filePrefix}${pickerResult.path}${contentPicker ? '.html' : ''}`, {});
                })
            },
            ...pickerConfig
        });
    }
}

function insertImages(editor, urls) {
    const imageCommand = editor.commands.get('imageInsert');

    // Check if inserting an image is actually possible - it might be possible to only insert a link.
    if (!imageCommand.isEnabled) {
        const notification = editor.plugins.get('Notification');
        const t = editor.locale.t;

        notification.showWarning(t('Could not insert image at the current position.'), {
            title: t('Inserting image failed'),
            namespace: 'ckfinder'
        });

        return;
    }

    editor.execute('imageInsert', {source: urls});
}
