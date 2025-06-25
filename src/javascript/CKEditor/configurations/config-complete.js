import {plugins} from './plugins-complete';

export const completeConfig = {
    plugins,
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
            'bookmark',
            'insertTable',
            '|',
            'bulletedList',
            'numberedList',
            'indent',
            'outdent'
        ],
        // Set to true to wrap the toolbar items
        // Set to false if we want to group items
        shouldNotGroupWhenFull: true
    },
    menuBar: {
        isVisible: true
    },
    heading: {
        options: [
            {model: 'paragraph', title: 'Paragraph', class: 'ck-heading_paragraph'},
            {model: 'heading2', view: 'h2', title: 'Heading 2', class: 'ck-heading_heading2'},
            {model: 'heading3', view: 'h3', title: 'Heading 3', class: 'ck-heading_heading3'},
            {model: 'heading4', view: 'h4', title: 'Heading 4', class: 'ck-heading_heading4'}
        ]
    },
    language: 'en',
    image: {
        resizeUnit: 'px',
        toolbar: [
            'linkImage',
            '|',
            'toggleImageCaption',
            'imageTextAlternative',
            '|',
            'imageStyle:inline',
            'imageStyle:alignCenter',
            'imageStyle:wrapText',
            '|',
            'resizeImage:original',
            'resizeImage:custom'
        ]
    },
    table: {
        contentToolbar: [
            'tableColumn',
            'tableRow',
            'mergeTableCells',
            'tableCellProperties',
            'tableProperties'
        ]
    },
    htmlSupport: {
        allow: [
            {
                name: /.*/,
                attributes: true,
                classes: true,
                styles: true
            }
        ]
    },
    list: {
        properties: {
            styles: true,
            startIndex: true,
            reversed: false
        }
    },
    link: {
        toolbar: ['editLink', 'linkProperties', 'unlink'],
        defaultProtocol: 'https://',
        decorators: {
            openInNewTab: {
                mode: 'manual',
                label: 'Open in a new tab',
                defaultValue: false,
                attributes: {
                    target: '_blank',
                    rel: 'noopener noreferrer'
                }
            }
        }
    }
};
