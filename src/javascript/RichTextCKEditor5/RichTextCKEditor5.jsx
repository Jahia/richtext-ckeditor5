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
import {set} from '~/RichTextCKEditor5/RichTextCKEditor5.utils';

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

    const parsedOptions = {};
    field.selectorOptions.forEach(option => {
        set(parsedOptions, option.name, option.value || option.values);
    });

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

    const customConfig = {
        ...parsedOptions.ckEditorConfig,
        language: uilang,
        picker: {
            site: editorContext.site,
            lang,
            uilang,
            client,
            store
        }
    };

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

