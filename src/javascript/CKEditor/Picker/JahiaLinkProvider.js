import {Plugin, LinkUI} from 'ckeditor5';
import {loadTranslations} from '../../RichTextCKEditor5/RichTextCKEditor5.utils';

export default class JahiaLinkProvider extends Plugin {
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
        const label = JahiaLinkProvider.prefixedTranslationKey('label');

        return {
            fr: {
                [label]: 'Liens internes Jahia'
            },
            de: {
                [label]: 'Jahia interne links'
            },
            en: {
                [label]: 'Jahia internal links'
            }
        };
    }

    openPicker() {
        const editor = this.editor;
        const contextPath = (window.contextJsParameters && window.contextJsParameters.contextPath) || '';
        const contentPrefix = `${contextPath}/cms/{mode}/{lang}`;

        const pickerConfig = editor.config.get('picker');

        window.CE_API.openPicker({
            setValue: pickerResults => {
                const url = `${contentPrefix}${pickerResults[0].path}.html`;
                editor.execute('link', url);
            },
            ...pickerConfig
        });
    }

    init() {
        const {t} = this.editor.locale;
        const ts = JahiaLinkProvider.translations;
        loadTranslations(this.editor, ts);
        // Get access to the original LinkUI plugin
        const linkUI = this.editor.plugins.get('LinkUI');

        // Create a custom link provider that will directly open your modal
        linkUI.registerLinksListProvider({
            label: t(JahiaLinkProvider.prefixedTranslationKey('label')),
            type: 'jahiaLinks',
            getListItems() {
                return [];
            }
        });

        // Monkey patch the LinkUI._createLinksListProviderButton method to add our custom behavior
        const originalCreateLinksListProviderButton = linkUI._createLinksListProviderButton;
        const onOpenPicker = this.openPicker.bind(this);

        linkUI._createLinksListProviderButton = function (linkProvider) {
            const button = originalCreateLinksListProviderButton.call(this, linkProvider);

            if (linkProvider.type === 'jahiaLinks') {
                // Override the execute event
                button.off('execute');
                button.on('execute', () => {
                    linkUI._hideUI();
                    onOpenPicker();
                });
            }

            return button;
        };
    }
}
