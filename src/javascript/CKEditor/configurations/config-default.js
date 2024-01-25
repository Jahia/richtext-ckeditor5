import {plugins} from './plugins-default';

export const config = {
    plugins,
    toolbar: {
        items: [
            'undo',
            'redo',
            'findAndReplace',
            '|',
            'heading',
            '|',
            'bold',
            'italic',
            'removeFormat',
            '|',
            'alignment',
            '|',
            'jahiaInsertImage',
            'jahiaLink',
            '|',
            'bulletedList',
            'numberedList',
            '|',
            'outdent',
            'indent',
            '|',
            'sourceEditing'
        ],
        shouldNotGroupWhenFull: true
    },
    heading: {
        options: [
            {model: 'paragraph', title: 'Paragraph', class: 'ck-heading_paragraph'},
            {model: 'heading2', view: 'h2', title: 'Heading 2', class: 'ck-heading_heading2'},
            {model: 'heading3', view: 'h3', title: 'Heading 3', class: 'ck-heading_heading3'},
            {model: 'heading4', view: 'h4', title: 'Heading 4', class: 'ck-heading_heading4'}
        ]
    },
    style: {
        definitions: [
            // Inline styles
            {name: 'Paragraph lead', element: 'p', classes: ['lead']},
            {name: 'Drop cap', element: 'span', classes: ['dropcap']},
            {name: 'Drop cap inverse', element: 'span', classes: ['dropcap-bg']},
            {name: 'Drop cap rounded', element: 'span', classes: ['dropcap-bg', 'rounded-x']},
            {name: 'Drop cap dark', element: 'span', classes: ['dropcap', 'dropcap-bg', 'bg-color-dark']},
            {name: 'Dotted divider', element: 'hr', classes: ['devider', 'deviser-dotted']},
            {name: 'Dashed divider', element: 'hr', classes: ['devider', 'deviser-dashed']},

            // Block styles
            {name: 'Headline div', element: 'div', classes: ['headline']},
            {name: 'Text right', element: 'span', classes: ['text-right']},
            {name: 'Text center', element: 'span', classes: ['text-center']},
            {name: 'Blockquote', element: 'blockquote', classes: []},
            {name: 'Blockquote color border', element: 'blockquote', classes: ['bq-green']},
            {name: 'Blockquote color border text right', element: 'blockquote', classes: ['text-right', 'bq-green']},
            {name: 'Blockquote hero', element: 'blockquote', classes: ['hero']},
            {name: 'Blockquote hero dark bg', element: 'blockquote', classes: ['hero', 'hero-dark']},
            {name: 'Blockquote hero color bg', element: 'blockquote', classes: ['hero', 'hero-default']},
            {name: 'Blockquote text right', element: 'blockquote', classes: ['text-right']},
            {name: 'Tag box light border', element: 'div', classes: ['tag-box', 'tag-box-v3']},
            {name: 'Tag box left border', element: 'div', classes: ['tag-box', 'tag-box-v2']},
            {name: 'Tag box top border', element: 'div', classes: ['tag-box', 'tag-box-v1']},
            {name: 'Paragraph BG primary', element: 'p', classes: ['bg-primary']},
            {name: 'Paragraph BG success', element: 'p', classes: ['bg-success']},
            {name: 'Paragraph BG info', element: 'p', classes: ['bg-info']},
            {name: 'Paragraph BG warning', element: 'p', classes: ['bg-warning']},
            {name: 'Paragraph BG danger', element: 'p', classes: ['bg-danger']},
            {name: 'Heading Double Strip Style', element: 'div', classes: ['heading', 'heading-v1']},
            {name: 'Heading Double Dashed Style', element: 'div', classes: ['heading', 'heading-v2']},
            {name: 'Heading Double Dotted Style', element: 'div', classes: ['heading', 'heading-v3']},
            {name: 'Heading Strip Style', element: 'div', classes: ['heading', 'heading-v4']},
            {name: 'Heading Dashed Style', element: 'div', classes: ['heading', 'heading-v5']},
            {name: 'Heading Dotted Style', element: 'div', classes: ['heading', 'heading-v6']},

            // Shadow effects
            {name: 'Shadow effect 1', element: 'div', classes: ['tag-box', 'tag-box-v3', 'box-shadow', 'shadow-effect-1']},
            {name: 'Shadow effect 2', element: 'div', classes: ['tag-box', 'tag-box-v3', 'box-shadow', 'shadow-effect-2']},
            {name: 'Shadow effect 3', element: 'div', classes: ['tag-box', 'tag-box-v3', 'box-shadow', 'shadow-effect-3']},
            {name: 'Shadow effect 4', element: 'div', classes: ['tag-box', 'tag-box-v3', 'box-shadow', 'shadow-effect-4']}
        ]
    },
    language: 'en',
    image: {
        toolbar: [
            'imageTextAlternative',
            'toggleImageCaption',
            'imageStyle:inline',
            'imageStyle:block',
            'imageStyle:side'
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
            styles: false,
            startIndex: true,
            reversed: false
        }
    }
};
