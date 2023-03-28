import LinkCommand from '@ckeditor/ckeditor5-link/src/linkcommand';

export class JahiaLinkCommand extends LinkCommand {
    constructor(editor, type) {
        super(editor);
        this.type = type;

        // Remove default document listener to lower its priority.
        this.stopListening(this.editor.model.document, 'change');

        // Lower this command listener priority to be sure that refresh() will be called after link & image refresh.
        this.listenTo(this.editor.model.document, 'change', () => this.refresh(), {priority: 'low'});
    }

    refresh() {
        super.refresh();
    }

    execute() {
        const editor = this.editor;

        const contextPath = (window.contextJsParameters && window.contextJsParameters.contextPath) || '';
        const contentPrefix = `${contextPath}/cms/{mode}/{lang}`;
        const filePrefix = `${contextPath}/files/{workspace}`;

        const pickerConfig = editor.config.get('picker');

        let path;
        if (this.value && this.value.startsWith(contentPrefix)) {
            path = (this.value.substring(contentPrefix.length, this.value.lastIndexOf('.html')));
        }

        window.CE_API.openPicker({
            type: this.type,
            value: path,
            setValue: pickerResults => {
                const contentPicker = true;
                super.execute(`${contentPicker ? contentPrefix : filePrefix}${pickerResults[0].path}${contentPicker ? '.html' : ''}`);
            },
            ...pickerConfig
        });
    }
}

