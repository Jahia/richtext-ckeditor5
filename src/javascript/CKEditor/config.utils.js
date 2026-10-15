import {JahiaCreateContent} from '~/CKEditor/Picker/JahiaCreateContent';

const CONTENT_REFERENCE_ITEM = 'jahiaContentReference';
const CREATE_CONTENT_ITEM = 'jahiaCreateContent';

export function removeToolbarItems(config, items) {
    const itemsToRemove = new Set(Array.isArray(items) ? items : [items]);

    const filterToolbar = toolbar => {
        return toolbar.filter(toolbarItem => !itemsToRemove.has(toolbarItem));
    };

    if (Array.isArray(config.toolbar)) {
        config.toolbar = filterToolbar(config.toolbar);
    } else if (Array.isArray(config.toolbar?.items)) {
        config.toolbar = {...config.toolbar, items: filterToolbar(config.toolbar.items)};
    }

    if (config.menuBar) {
        // CKEditor applies addItems after removeItems, so an added item must leave addItems as well.
        const menuBarItems = new Set([...itemsToRemove].map(item => `menuBar:${item}`));
        config.menuBar = {
            ...config.menuBar,
            addItems: (config.menuBar.addItems ?? []).filter(added => !menuBarItems.has(added.item)),
            removeItems: [...new Set([...(config.menuBar.removeItems ?? []), ...menuBarItems])]
        };
    }
}

export function addCreateContent(config) {
    if (!config.plugins?.some(plugin => plugin.pluginName === JahiaCreateContent.pluginName)) {
        config.plugins = [...(config.plugins || []), JahiaCreateContent];
    }

    const insertItem = toolbar => {
        if (toolbar.includes(CREATE_CONTENT_ITEM)) {
            return toolbar;
        }

        const index = toolbar.indexOf(CONTENT_REFERENCE_ITEM);
        return index === -1 ?
            [...toolbar, CREATE_CONTENT_ITEM] :
            [...toolbar.slice(0, index + 1), CREATE_CONTENT_ITEM, ...toolbar.slice(index + 1)];
    };

    if (Array.isArray(config.toolbar)) {
        config.toolbar = insertItem(config.toolbar);
    } else if (Array.isArray(config.toolbar?.items)) {
        config.toolbar = {...config.toolbar, items: insertItem(config.toolbar.items)};
    }

    const addItems = config.menuBar?.addItems ?? [];
    if (addItems.some(added => added.item === `menuBar:${CONTENT_REFERENCE_ITEM}`) &&
        !addItems.some(added => added.item === `menuBar:${CREATE_CONTENT_ITEM}`)) {
        config.menuBar = {
            ...config.menuBar,
            addItems: [...addItems, {item: `menuBar:${CREATE_CONTENT_ITEM}`, position: `after:menuBar:${CONTENT_REFERENCE_ITEM}`}]
        };
    }
}

export function removePlugin(config, pluginName) {
    const pluginIndex = config.plugins?.findIndex(plugin => plugin.pluginName === pluginName) ?? -1;
    if (pluginIndex !== -1) {
        config.plugins.splice(pluginIndex, 1);
    }
}

/**
 * Returns a custom proxy configuration for OpenAI assistant integration based on the provided node path and CKEditor configuration.
 * This also removes the AI-related toolbar items from the CKEditor configuration if the AI integration is disabled in the openai OSGi configuration.
 *
 * @param nodePath
 * @param config
 * @returns OpenAI assistant proxy configuration
 */
export function getAIConfig(nodePath, config) {
    const isAIEnabled = Boolean(window?.contextJsParameters?.config?.ckeditor5?.aiEnabled);
    if (!isAIEnabled) {
        removeToolbarItems(config, ['aiCommands', 'aiAssistant']);
        return {};
    }

    return {
        ai: {
            assistant: {
                adapter: {
                    openAI: {
                        apiUrl: '/modules/ckeditor5/ai-proxy',
                        requestHeaders: async () => ({
                            'X-Jahia-Path': nodePath
                        })
                    }
                }
            }
        }
    };
}
