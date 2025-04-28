export const advancedToolbar = {
    toolbar: [
        'undo',
        'redo',
        'sourceEditing',
        'showBlocks',
        'fullPage',
        '|',
        'heading',
        'style',
        'bold',
        'italic',
        'removeFormat',
        '|',
        'alignment',
        '|',
        'jahiaInsertImage',
        'jahiaLink',
        'insertTable',
        '|',
        'bulletedList',
        'numberedList',
        'indent',
        'outdent'
    ]
};

export const lightToolbar = {
    toolbar: [
        'undo',
        'redo',
        'heading',
        'bold',
        'italic',
        'removeFormat',
        '|',
        'alignment',
        '|',
        'jahiaInsertImage',
        'jahiaLink',
        'insertTable',
        '|',
        'bulletedList',
        'numberedList',
        'indent',
        'outdent'
    ]
};

export const minimalToolbar = {
    toolbar: [
        'bold',
        'italic',
        'underline',
        'removeFormat',
        'alignment:left',
        'alignment:center',
        'alignment:right',
    ]
};

export const resolveToolbar = type => {
    if (type === 'Full') {
        return advancedToolbar;
    }

    if (type === 'Basic') {
        return lightToolbar;
    }

    return minimalToolbar;
};
