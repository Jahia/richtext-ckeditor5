import React, {useEffect, useRef} from 'react';
import * as PropTypes from 'prop-types';
import {CKEditor} from '@ckeditor/ckeditor5-react';
import {JahiaClassicEditor} from '../CKEditor/JahiaClassicEditor';
import styles from './RichTextCKEditor5.scss';
import {useContentEditorConfigContext, useContentEditorContext} from '@jahia/jcontent';
import {useApolloClient, useQuery} from '@apollo/client';
import {getCKEditorConfigurationPath} from '~/RichTextCKEditor5/RichTextCKEditor5.gql-queries';
import {useStore} from 'react-redux';
import {set} from '~/RichTextCKEditor5/RichTextCKEditor5.utils';

export const RichTextCKEditor5 = ({field, id, value, onChange, onBlur}) => {
    const editorRef = useRef();
    const client = useApolloClient();
    const store = useStore();
    const {lang, uilang} = useContentEditorConfigContext();
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

