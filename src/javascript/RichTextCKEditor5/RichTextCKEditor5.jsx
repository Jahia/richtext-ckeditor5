import React, {useEffect, useRef, useState} from 'react';
import * as PropTypes from 'prop-types';
import {CKEditor} from '@ckeditor/ckeditor5-react';
import {JahiaClassicEditor} from '../CKEditor/JahiaClassicEditor';
import styles from './RichTextCKEditor5.scss';
import {useContentEditorConfigContext, useContentEditorContext} from '@jahia/jcontent';
import {useApolloClient, useQuery} from 'react-apollo';
import {getCKEditorConfigurationPath} from '~/RichTextCKEditor5/RichTextCKEditor5.gql-queries';
import {useStore} from 'react-redux';
import scopeCss from 'scope-css';

function loadOption(selectorOptions, name) {
    return selectorOptions && selectorOptions.find(option => option.name === name);
}

export const RichTextCKEditor5 = ({field, id, value, onChange, onBlur}) => {
    const editorRef = useRef();
    const client = useApolloClient();
    const store = useStore();
    const {lang, uilang} = useContentEditorConfigContext();
    const [style, setStyle] = useState();
    const toolbarContainer = useRef();

    useEffect(() => {
        if (editorRef.current) {
            const editor = editorRef.current;
            const data = editor.getData();
            if (value !== data) {
                editor.setData(value);
            }
        }
    }, [value]);

    // Todo : load from config
    const contentCss = '/modules/dx-base-demo-templates/css/app.css';

    useEffect(() => {
        fetch(contentCss).then(css => css.text()).then(css => {
            const scoped = scopeCss(css, '.ck-content');
            const style = document.createElement('style');
            style.textContent = scoped;
            setStyle(style);
        });
    }, [contentCss]);

    useEffect(() => {
        if (style) {
            document.head.append(style);

            return () => {
                style.remove();
            };
        }
    }, [style]);

    const editorContext = useContentEditorContext();
    const {data, error, loading} = useQuery(
        getCKEditorConfigurationPath,
        {
            variables: {
                nodePath: editorContext.path
            }
        }
    );

    if (error) {
        return <span>error</span>;
    }

    if (loading || !data || !data.forms) {
        return <span>loading...</span>;
    }

    // Const fieldCustomConfig = loadOption(field.selectorOptions, 'ckeditor.customConfig');
    //
    // let ckeditorCustomConfig = '';
    // if (fieldCustomConfig && fieldCustomConfig.value) {
    //     // Custom config from CND
    //     ckeditorCustomConfig = fieldCustomConfig.value.replace('$context', window.contextJsParameters.contextPath);
    // } else if (data.forms.ckeditorConfigPath) {
    //     ckeditorCustomConfig = data.forms.ckeditorConfigPath.replace('$context', window.contextJsParameters.contextPath);
    // }

    const customConfig = {
        picker: {
            site: editorContext.site,
            lang,
            uilang,
            client,
            store
        },
        style: {
            definitions: [
                // Todo : load from config

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
        }
    };

    const toolbar = loadOption(field.selectorOptions, 'ckeditor.toolbar');
    if (toolbar) {
        customConfig.toolbar = toolbar;
    }

    return (
        <>
            <div ref={toolbarContainer} className={styles.toolbar}/>
            <div className={styles.unreset}>
                <CKEditor
                id={id}
                editor={JahiaClassicEditor}
                config={customConfig}
                disabled={field.readOnly}
                data={value}
                onReady={editor => {
                    editorRef.current = editor;
                    toolbarContainer.current.appendChild(editor.ui.view.toolbar.element);
                    toolbarContainer.current.appendChild(editor.ui.view.body._bodyCollectionContainer);
                }}
                onChange={(event, editor) => {
                    onChange(editor.getData());
                }}
                onBlur={() => {
                    onBlur();
                }}
            />
            </div>
        </>
    );
};

RichTextCKEditor5.propTypes = {
    id: PropTypes.string.isRequired,
    value: PropTypes.string,
    field: PropTypes.object,
    onChange: PropTypes.func.isRequired,
    onBlur: PropTypes.func.isRequired
};

