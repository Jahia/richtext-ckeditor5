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
            label: t(JahiaLinkProvider.prefixedTranslationKey('link')),
            type: 'jahiaEditorialLink',
            getListItems() {
                return [];
            }
        });

        linkUI.registerLinksListProvider({
            label: t(JahiaLinkProvider.prefixedTranslationKey('file')),
            type: 'jahiaFileLink',
            getListItems() {
                return [];
            }
        });

        // Monkey patch the LinkUI._createLinksListProviderButton method to add our custom behavior
        const originalCreateLinksListProviderButton = linkUI._createLinksListProviderButton;
        const onOpenLinkPicker = this.openLinkPicker.bind(this);
        const onOpenFilePicker = this.openFilePicker.bind(this);

        linkUI._createLinksListProviderButton = function (linkProvider) {
            let button = originalCreateLinksListProviderButton.call(this, linkProvider);

            if (linkProvider.type === 'jahiaEditorialLink') {
                // Override the execute event
                button.off('execute');
                button.on('execute', () => {
                    linkUI._hideUI();
                    onOpenLinkPicker();
                });
            }

            if (linkProvider.type === 'jahiaFileLink') {
                // Override the execute event
                button.off('execute');
                button.on('execute', () => {
                    linkUI._hideUI();
                    onOpenFilePicker();
                });
            }

            return button;
        };
    }
}
