import {JahiaBalloonEditor} from '~/CKEditor/JahiaBalloonEditor';

export const inlineEdit = (element, saveCallback) => {
    console.log('editing element', element, saveCallback);
    JahiaBalloonEditor.create(element, {
    }).then(editor => {
        console.log('Editor was initialized', editor);
    }).catch(err => {
        console.error(err.stack);
    });
};
