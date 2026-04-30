import {plugins} from './plugins-complete';
import {mentionConfig} from './mention/mentionConfig';

export const completeConfig = {
    plugins,
    toolbar: {
        items: [
            'aiCommands',
            'aiAssistant',
            '|',
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
        ],
        htmlIframeSandbox: false
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
    },
    ...mentionConfig,
    ai: {
        assistant: {
            adapter: {
                openAI: {
                    apiUrl: '/modules/ckeditor5/ai-proxy'
                    // requestHeaders: {
                    //     // Paste your OpenAI API key in place of YOUR_OPENAI_API_KEY:
                    //     Authorization: 'Bearer YOUR_OPENAI_API_KEY'
                    // }
                },
                aws: {
                    apiUrl: '/modules/ckeditor5/ai-proxy'
                    // bedrockClientConfig: {
                    //     // Fill in your service region, for example, 'us-west-2'.
                    //     region: 'eu-west-1',
                    //     credentials: {
                    //         // Paste your credentials in place of YOUR_ACCESS_KEY_ID and YOUR_SECRET_ACCESS_KEY.
                    //         accessKeyId: 'YOUR_ACCESS_KEY_ID',
                    //         secretAccessKey: 'YOUR_SECRET_ACCESS_KEY'
                    //     }
                    // },
                    // requestParameters: {
                    //     // model: 'arn:aws:bedrock:eu-west-1:602599330770:inference-profile/eu.anthropic.claude-3-5-sonnet-20240620-v1:0',
                    //     model: 'eu.anthropic.claude-sonnet-4-5-20250929-v1:0',
                    //     max_tokens_to_sample: 500,
                    //     temperature: 1,
                    //     top_k: 250,
                    //     top_p: 1,
                    //     anthropic_version: 'bedrock-2023-05-31',
                    //     stream: true
                    // }
                }
            }
        }
    }
};
