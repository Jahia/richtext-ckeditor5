import {Plugin, LinkUI} from 'ckeditor5';
import {loadTranslations} from '../../RichTextCKEditor5/RichTextCKEditor5.utils';

export class JahiaLinkProvider extends Plugin {
    static get requires() {
        return [LinkUI];
    }

    static get pluginName() {
        return 'JahiaLinkProvider';
    }

    static prefixedTranslationKey(key) {
        return `${JahiaLinkProvider.pluginName}:${key}`;
    }

    static get translations() {
        const link = JahiaLinkProvider.prefixedTranslationKey('link');
        const file = JahiaLinkProvider.prefixedTranslationKey('file');

        return {
            fr: {
                [link]: 'Liens internes Jahia',
                [file]: 'Fichiers internes Jahia'
            },
            de: {
                [link]: 'Jahia interne links',
                [file]: 'Jahia interne dateien'
            },
            en: {
                [link]: 'Jahia internal links',
                [file]: 'Jahia internal files'
            }
        };
    }

    openLinkPicker() {
        const editor = this.editor;
        const contextPath = (window.contextJsParameters && window.contextJsParameters.contextPath) || '';
        const contentPrefix = `${contextPath}/cms/{mode}/{lang}`;

        const pickerConfig = editor.config.get('picker');

        // Editorial link picker config
        window.CE_API.openPicker({
            setValue: pickerResults => {
                const url = `${contentPrefix}${pickerResults[0].path}.html`;
                editor.execute('link', url);
            },
            type: 'editoriallink',
            ...pickerConfig
        });
    }

    openFilePicker() {
        const editor = this.editor;
        const contextPath = (window.contextJsParameters && window.contextJsParameters.contextPath) || '';
        const filePrefix = `${contextPath}/files/{workspace}`;

        const pickerConfig = editor.config.get('picker');

        // File picker config
        window.CE_API.openPicker({
            setValue: pickerResults => {
                const url = `${filePrefix}${pickerResults[0].path}`;
                editor.execute('link', url);
            },
            type: 'file',
            ...pickerConfig
        });
    }

    init() {
        const {t} = this.editor.locale;
        const ts = JahiaLinkProvider.translations;
        loadTranslations(this.editor, ts);
        // Get access to the original LinkUI plugin
        const linkUI = this.editor.plugins.get('LinkUI');

        linkUI.registerLinksListProvider({
            label: 'Jahia',
            type: 'jahia',
            getListItems() {
                return [
                    // Editorial link picker button
                    {
                        label: t(JahiaLinkProvider.prefixedTranslationKey('link'))
                    },
                    // File picker button
                    {
                        label: t(JahiaLinkProvider.prefixedTranslationKey('file'))
                    }
                ];
            }
        });

        // Monkey patch the LinkUI._createLinkProviderListView method to add our custom behavior
        const originalCreateLinkProviderListView = linkUI._createLinkProviderListView;
        const onOpenLinkPicker = this.openLinkPicker.bind(this);
        const onOpenFilePicker = this.openFilePicker.bind(this);

        // Reset execute listeners for Jahia menu buttons to have custom functionality to open pickers
        linkUI._createLinkProviderListView = function (linkProvider) {
            const buttonViews = originalCreateLinkProviderListView.call(this, linkProvider);

            // Set up link and file picker buttons, see linkUI.registerLinksListProvider for button definition
            if (linkProvider.type === 'jahia') {
                // Editorial link picker button
                buttonViews[0].off('execute');
                buttonViews[0].on('execute', () => {
                    linkUI._hideUI();
                    onOpenLinkPicker();
                });

                // File picker button
                buttonViews[1].off('execute');
                buttonViews[1].on('execute', () => {
                    linkUI._hideUI();
                    onOpenFilePicker();
                });
            }

            return buttonViews;
        };
    }
}
