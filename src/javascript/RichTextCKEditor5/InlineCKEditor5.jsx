import {JahiaBalloonEditor} from '~/CKEditor/JahiaBalloonEditor';

export const inlineEdit = (element, saveCallback) => {
    console.log('editing element', element, saveCallback);
    const dirty = {
        current: false
    };
    JahiaBalloonEditor.create(element, {}).then(editor => {
        editor.model.document.on('change:data', () => {
            console.log('The data has changed!');
            dirty.current = true;
        });

        editor.ui.focusTracker.on('change:isFocused', (evt, name, isFocused) => {
            if (!isFocused && dirty.current) {
                console.log('ft blur', evt, name, isFocused);
                saveCallback(editor.getData());
                dirty.current = false;
            }
        });

        console.log('Editor was initialized', editor);
    }).catch(err => {
        console.error(err.stack);
    });
};
