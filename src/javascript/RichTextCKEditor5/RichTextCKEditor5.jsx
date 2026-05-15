import React, {useEffect, useRef, useState} from 'react';
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
import {REGISTRY_KEY} from '~/RichTextCKEditor5.constants';
import {getAIConfig, removeToolbarItems} from '~/CKEditor/config.utils';
import scopeCss from 'scope-css';

export const RichTextCKEditor5 = ({field, id, value, onChange, onBlur}) => {
    const editorRef = useRef();
    const client = useApolloClient();
    const store = useStore();
    const {lang, uilang} = useContentEditorConfigContext();
    const {loading: translationsLoading, translations} = useTranslation(uilang);

    // Ensure value is never null or undefined to prevent CKEditor errors
    const safeValue = value ?? '';

    useEffect(() => {
        if (editorRef.current) {
            const editor = editorRef.current;
            const data = editor.getData();
            if (safeValue !== data) {
                editor.setData(safeValue);
            }
        }
    }, [safeValue]);

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

    const styleTemplates = data?.jcontent?.richtext?.config?.styleTemplates;
    const stylesheetUrl = styleTemplates?.stylesheet || null;
    const [stylesheetEl, setStylesheetEl] = useState(null);

    useEffect(() => {
        if (!stylesheetUrl) {
            setStylesheetEl(null);
            return undefined;
        }

        let cancelled = false;
        fetch(stylesheetUrl)
            .then(res => {
                if (!res.ok) {
                    throw new Error(`HTTP ${res.status}`);
                }

                return res.text();
            })
            .then(css => {
                if (cancelled) {
                    return;
                }

                const scoped = scopeCss(css, '.ck-content');
                const el = document.createElement('style');
                el.textContent = scoped;
                el.setAttribute('data-jahia-ck5-styles', stylesheetUrl);
                setStylesheetEl(el);
            })
            .catch(err => {
                console.warn(`Failed to load CK5 template stylesheet ${stylesheetUrl}:`, err);
            });
        return () => {
            cancelled = true;
        };
    }, [stylesheetUrl]);

    useEffect(() => {
        if (!stylesheetEl) {
            return undefined;
        }

        document.head.append(stylesheetEl);
        return () => {
            stylesheetEl.remove();
        };
    }, [stylesheetEl]);

    if (error) {
        return <span>error</span>;
    }

    if (loading || translationsLoading || !data || !data.jcontent.richtext) {
        return <span>loading...</span>;
    }

    // Prioritize cnd/selector defined configuration: - field (string, richtext[ckeditor.customConfig='customConfig25'])
    // if no such configuration defined or present registry, using the fallback mechanism
    let resolvedConfigName;
    const excludeToolbarItems = data.jcontent.richtext.config.excludeToolbarItems;
    if (parsedOptions.ckeditor?.customConfig === undefined || registry.get(REGISTRY_KEY, parsedOptions.ckeditor?.customConfig) === undefined) {
        resolvedConfigName = data.jcontent.richtext.config.configName;
    } else {
        resolvedConfigName = parsedOptions.ckeditor.customConfig;
    }

    const registryConfig = registry.get(REGISTRY_KEY, resolvedConfigName);
    const customConfig = {
        ...getAIConfig(editorContext.path, registryConfig),
        ...registryConfig,
        language: uilang,
        picker: {
            site: editorContext.site,
            lang,
            uilang,
            client,
            store
        }
    };

    if (excludeToolbarItems.length > 0) {
        removeToolbarItems(customConfig, excludeToolbarItems);
    }

    if (styleTemplates?.definitions?.length > 0) {
        customConfig.style = {
            ...(customConfig.style || {}),
            definitions: styleTemplates.definitions.map(d => ({
                name: d.name,
                element: d.element,
                classes: d.classes
            }))
        };
    }

    if (translations.length > 0) {
        customConfig.translations = translations.slice();
    }

    const richtextMaxHeight = window?.contextJsParameters?.config?.ckeditor5?.richtextMaxHeight;
    return (
        <div className={styles.unreset} style={richtextMaxHeight ? {'--ck-editor-max-height': `${richtextMaxHeight}px`} : undefined}>
            <CKEditor
                id={id}
                editor={JahiaClassicEditor}
                config={customConfig}
                disabled={field.readOnly}
                data={safeValue}
                onReady={editor => {
                    editorRef.current = editor;
                    editor.editing.view.change(writer => {
                        // Applied to [contenteditable="true"] element, which is the main editing area of CKEditor
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

