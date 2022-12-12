import React, {useContext, useEffect, useRef} from 'react';
import * as PropTypes from 'prop-types';
import {CKEditor} from '@ckeditor/ckeditor5-react';
import Editor from '../CKEditor/ckeditor';
import styles from './RichTextCKEditor5.scss';
import {ContentEditorContext} from '@jahia/content-editor';
import {useQuery} from 'react-apollo';
import {getCKEditorConfigurationPath} from '~/RichTextCKEditor5/RichTextCKEditor5.gql-queries';
function loadOption(selectorOptions, name) {
    return selectorOptions && selectorOptions.find(option => option.name === name);
}

export const RichTextCKEditor5 = ({field, id, value, onChange, onBlur}) => {
    console.log(id);

    const editorRef = useRef();

    useEffect(() => {
        if (editorRef.current) {
            const editor = editorRef.current;
            const data = editor.getData();
            if (value !== data) {
                editor.setData(value);
            }
        }
    }, [value]);

    const editorContext = useContext(ContentEditorContext);
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

    const toolbar = loadOption(field.selectorOptions, 'ckeditor.toolbar');
    const fieldCustomConfig = loadOption(field.selectorOptions, 'ckeditor.customConfig');

    let ckeditorCustomConfig = '';
    if (fieldCustomConfig && fieldCustomConfig.value) {
        // Custom config from CND
        ckeditorCustomConfig = fieldCustomConfig.value.replace('$context', window.contextJsParameters.contextPath);
    } else if (data.forms.ckeditorConfigPath) {
        ckeditorCustomConfig = data.forms.ckeditorConfigPath.replace('$context', window.contextJsParameters.contextPath);
    }

    console.log('config', ckeditorCustomConfig);
    console.log('toolbar', toolbar);

    const customConfig = {};

    return (
        <div className={styles.unreset}>
            <CKEditor
                id={id}
                editor={Editor}
                config={customConfig}
                disabled={field.readOnly}
                data={value}
                onReady={editor => {
                    editorRef.current = editor;
                }}
                onChange={(event, editor) => {
                    onChange(editor.getData());
                }}
                onBlur={() => {
                    onBlur();
                }}
            />
        </div>
    );
};

RichTextCKEditor5.propTypes = {
    id: PropTypes.string.isRequired,
    value: PropTypes.string,
    field: PropTypes.object,
    onChange: PropTypes.func.isRequired,
    onBlur: PropTypes.func.isRequired
};

