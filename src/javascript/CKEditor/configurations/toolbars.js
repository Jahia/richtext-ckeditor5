export const advancedToolbar = {
    toolbar: {
        items: [
            'undo',
            'redo',
            'sourceEditingEnhanced',
            'showBlocks',
            'fullScreen',
            '|',
            'heading',
            'style',
            '|',
            'bold',
            'italic',
            'removeFormat',
            '|',
            'alignment',
            '|',
            'insertJahiaImage',
            'link',
            'insertTable',
            '|',
            'bulletedList',
            'numberedList',
            'indent',
            'outdent'
        ],
        shouldNotGroupWhenFull: true
    },
    menuBar: {
        isVisible: false
    }
};

export const lightToolbar = {
    toolbar: {
        items: [
            'undo',
            'redo',
            'heading',
            'bold',
            'italic',
            'removeFormat',
            '|',
            'alignment',
            '|',
            'insertJahiaImage',
            'link',
            'insertTable',
            '|',
            'bulletedList',
            'numberedList',
            'indent',
            'outdent'
        ],
        shouldNotGroupWhenFull: true
    },
    menuBar: {
        isVisible: false
    }
};

export const minimalToolbar = {
    toolbar: {
        items: [
            'bold',
            'italic',
            'underline',
            'removeFormat',
            'alignment:left',
            'alignment:center',
            'alignment:right'
        ],
        shouldNotGroupWhenFull: true
    },
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
