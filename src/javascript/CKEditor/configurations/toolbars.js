export const advancedToolbar = {
    toolbar: [
        'undo',
        'redo',
        'sourceEditing',
        'showBlocks',
        'fullScreen',
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
    ],
    menuBar: {
        isVisible: false
    }
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
    ],
    menuBar: {
        isVisible: false
    }
};

export const minimalToolbar = {
    toolbar: [
        'bold',
        'italic',
        'underline',
        'removeFormat',
        'alignment:left',
        'alignment:center',
        'alignment:right'
    ],
    menuBar: {
        isVisible: false
    }
};

export const resolveToolbar = () => {
    const ck5config = contextJsParameters.config.ckeditor5;
    switch (ck5config?.configType) {
        case 'advanced':
            return advancedToolbar;
        case 'light':
            return lightToolbar;
        case 'minimal':
            return minimalToolbar;
        default:
            return {}; // Return empty object to default to complete toolbar (default)
    }
};
