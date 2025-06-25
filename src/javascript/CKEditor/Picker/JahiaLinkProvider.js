import {Plugin, LinkUI} from 'ckeditor5';
import {loadTranslations} from '../../RichTextCKEditor5/RichTextCKEditor5.utils';

export class JahiaLinkProvider extends Plugin {
    static contextPath = (window.contextJsParameters && window.contextJsParameters.contextPath) || '';
    static contentPrefix = `${JahiaLinkProvider.contextPath}/cms/{mode}/{lang}`;
    static filePrefix = `${JahiaLinkProvider.contextPath}/files/{workspace}`;

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
                [link]: 'Jahia interne Links',
                [file]: 'Jahia interne Dateien'
            },
            en: {
                [link]: 'Jahia internal links',
                [file]: 'Jahia internal files'
            }
        };
    }

    static canParse(val) {
        try {
            return Boolean(new URL(val));
        } catch {
            return false;
        }
    }

    static getPickerValue(url) {
        const hasContentPrefix = url.startsWith(JahiaLinkProvider.contentPrefix);
        const hasFilePrefix = url.startsWith(JahiaLinkProvider.filePrefix);

        if (JahiaLinkProvider.canParse(url)) {
            return new URL(url).toString();
        }

        if (hasContentPrefix) {
            return decodeURIComponent(url.substring(JahiaLinkProvider.contentPrefix.length).slice(0, -('.html').length));
        }

        if (hasFilePrefix) {
            return decodeURIComponent(url.substring(JahiaLinkProvider.filePrefix.length));
        }

        return decodeURIComponent(url);
    }

    openLinkPicker() {
        const editor = this.editor;
        const currentLink = editor.commands.get('link').value;

        const pickerConfig = editor.config.get('picker');

        // Editorial link picker config
        window.CE_API.openPicker({
            setValue: pickerResults => {
                const url = `${JahiaLinkProvider.contentPrefix}${pickerResults[0].path}.html`;
                editor.execute('link', url);
            },
            type: 'editoriallink',
            value: currentLink ? JahiaLinkProvider.getPickerValue(currentLink) : undefined,
            ...pickerConfig
        });
    }

    openFilePicker() {
        const editor = this.editor;
        const currentLink = editor.commands.get('link').value;

        const pickerConfig = editor.config.get('picker');

        // File picker config
        window.CE_API.openPicker({
            setValue: pickerResults => {
                const url = `${JahiaLinkProvider.filePrefix}${pickerResults[0].path}`;
                editor.execute('link', url);
            },
            type: 'file',
            value: currentLink ? JahiaLinkProvider.getPickerValue(currentLink) : undefined,
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
