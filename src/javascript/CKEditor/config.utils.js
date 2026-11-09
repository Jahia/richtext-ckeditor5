import {OpenAITextAdapter} from 'ckeditor5-premium-features';
import {JahiaGenAITextAdapter} from '~/CKEditor/plugins/JahiaGenAITextAdapter';

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

const GENAI_AI_TYPE = 'genai';
const AI_PROXY_PATH = '/modules/ckeditor5/ai-proxy';

const isGenAI = () => window?.contextJsParameters?.config?.ckeditor5?.aiType === GENAI_AI_TYPE;

/**
 * Returns a custom proxy configuration for the AI assistant based on the provided node path and CKEditor configuration.
 * The adapter namespace follows the aiType of the richtextCKEditor5 OSGi configuration: openAI, or jahiaGenAI for genai.
 * This also removes the AI-related toolbar items from the CKEditor configuration if the AI integration is disabled.
 *
 * @param nodePath
 * @param config
 * @returns AI assistant proxy configuration
 */
export function getAIConfig(nodePath, config) {
    const isAIEnabled = Boolean(window?.contextJsParameters?.config?.ckeditor5?.aiEnabled);
    if (!isAIEnabled) {
        removeToolbarItems(config, ['aiCommands', 'aiAssistant']);
        if (config.menuBar) {
            config.menuBar.removeItems = [
                ...(config.menuBar.removeItems ?? []),
                'menuBar:aiCommands',
                'menuBar:aiAssistant'
            ];
        }

        return {};
    }

    const proxy = {
        apiUrl: `${window?.contextJsParameters?.contextPath || ''}${AI_PROXY_PATH}`,
        requestHeaders: async () => ({
            'X-Jahia-Path': nodePath
        })
    };

    return {
        ai: {
            assistant: {
                adapter: isGenAI() ? {jahiaGenAI: proxy} : {openAI: proxy}
            }
        }
    };
}

/**
 * Swaps the OpenAI adapter for the GenAI connector adapter when the aiType is genai.
 * Builds a new plugin array, so the configuration in the registry stays unchanged.
 *
 * @param config the CKEditor configuration of one editor
 */
export function applyAIAdapter(config) {
    if (isGenAI() && Array.isArray(config.plugins)) {
        config.plugins = config.plugins.map(plugin => (
            plugin.pluginName === OpenAITextAdapter.pluginName ? JahiaGenAITextAdapter : plugin
        ));
    }
}
