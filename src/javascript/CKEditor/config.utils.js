export function removeToolbarItems(config, items) {
    const itemsToRemove = new Set(Array.isArray(items) ? items : [items]);

    const filterToolbar = toolbar => {
        return toolbar.filter(toolbarItem => !itemsToRemove.has(toolbarItem));
    };

    if (Array.isArray(config.toolbar)) {
        config.toolbar = filterToolbar(config.toolbar);
    } else if (Array.isArray(config.toolbar?.items)) {
        config.toolbar.items = filterToolbar(config.toolbar.items);
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
