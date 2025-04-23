import React, {useEffect, useRef, useState} from 'react';
import * as PropTypes from 'prop-types';
import {CKEditor} from '@ckeditor/ckeditor5-react';
import {JahiaClassicEditor} from '~/CKEditor/JahiaClassicEditor';
import styles from './RichTextCKEditor5.scss';
import {useContentEditorConfigContext, useContentEditorContext} from '@jahia/jcontent';
import {useApolloClient, useQuery} from '@apollo/client';
import {getCKEditorConfigurationPath} from '~/RichTextCKEditor5/RichTextCKEditor5.gql-queries';
import {useStore} from 'react-redux';
import {set} from '~/RichTextCKEditor5/RichTextCKEditor5.utils';
import {isProductivityMode} from "./RichTextCKEditor5.utils";

const useTranslation = (lang) => {
    const [translations, setTranslations] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (lang && lang !== '') {
            setLoading(true);

            import(`ckeditor5/translations/${lang}.js`)
                .then(module => {
                    const trans = [module.default];

                    if (isProductivityMode()) {
                        import(`ckeditor5-premium-features/translations/${lang}.js`)
                            .then(module => {
                                trans.push(module.default);
                            })
                            .catch(e => {
                                console.debug(`Did not find premium translations for CK5 in language: ${lang}. Will used default translations.`);
                            }).finally(() => {
                                setTranslations(trans);
                                setLoading(false);
                            });
                    } else {
                        setTranslations(trans);
                        setLoading(false);
                    }
                })
                .catch(e => {
                    console.debug(`Did not find translations for CK5 in language: ${lang}. Will use default translations.`);
                    setTranslations([])
                    setLoading(false);
                });
        }
    }, [lang]);

    return {loading, translations};
}

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

    if (loading || translationsLoading || !data || !data.forms) {
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

