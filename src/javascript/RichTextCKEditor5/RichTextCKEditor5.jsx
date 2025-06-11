import React, {useEffect, useRef} from 'react';
import * as PropTypes from 'prop-types';
import {CKEditor} from '@ckeditor/ckeditor5-react';
import {JahiaClassicEditor} from '~/CKEditor/JahiaClassicEditor';
import styles from './RichTextCKEditor5.scss';
import {useContentEditorConfigContext, useContentEditorContext} from '@jahia/jcontent';
import {useApolloClient, useQuery} from '@apollo/client';
import {getCKEditorConfiguration} from '~/RichTextCKEditor5/RichTextCKEditor5.gql-queries';
import {useStore} from 'react-redux';
import {set} from '~/RichTextCKEditor5/RichTextCKEditor5.utils';
import {useTranslation} from './RichTextCKEditor5.hooks';
import './RichTextCKEditor5-overrides.css';
import {registry} from '@jahia/ui-extender';
import Constants from '../RichTextCKEditor5.constants';

const {
    CONFIG_KEY,
    PLUGINS_KEY
} = Constants.registry;

export const RichTextCKEditor5 = ({field, id, value, onChange, onBlur}) => {
    const editorRef = useRef();
    const client = useApolloClient();
    const store = useStore();
    const {lang, uilang} = useContentEditorConfigContext();
    const {loading: translationsLoading, translations} = useTranslation(uilang);

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
        getCKEditorConfiguration,
        {
            variables: {
                nodePath: editorContext.path
            }
        }
    );

    if (error) {
        return <span>error</span>;
    }

    if (loading || translationsLoading || !data || !data.richtext) {
        return <span>loading...</span>;
    }

    // Prioritize cnd/selector defined configuration: - field (string, richtext[ckeditor.customConfig='customConfig25'])
    const resolvedConfigName = parsedOptions.ckeditor?.customConfig ? parsedOptions.ckeditor.customConfig : data.richtext.config;

    const cfg = {
        ...registry.get(CONFIG_KEY, resolvedConfigName),
        plugins: registry.get(PLUGINS_KEY, resolvedConfigName)?.plugins
    };

    const customConfig = {
        ...cfg,
        language: uilang,
        picker: {
            site: editorContext.site,
            lang,
            uilang,
            client,
            store
        }
    };

    if (translations.length > 0) {
        customConfig.translations = translations.slice();
    }

    return (
        <div className={styles.unreset}>
            <CKEditor
                id={id}
                editor={JahiaClassicEditor}
                config={customConfig}
                disabled={field.readOnly}
                data={value}
                onReady={editor => {
                    editorRef.current = editor;
                    editor.editing.view.change(writer => {
                        writer.addClass(styles.wrapper, editor.editing.view.document.getRoot());
                    });
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

