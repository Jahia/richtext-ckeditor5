export function removeToolbarItem(config, item) {
    const removeItem = (toolbar, itemName) => {
        const index = toolbar.findIndex(toolbarItem => toolbarItem === itemName);
        if (index !== -1) {
            toolbar.splice(index, 1);
        }
    }

    if (Array.isArray(config.toolbar)) {
        removeItem(config.toolbar, item);
    } else if (Array.isArray(config.toolbar?.items)) {
        removeItem(config.toolbar.items, item);
    }
}

export function removePlugin(config, pluginName) {
    const pluginIndex = config.plugins?.findIndex(plugin => plugin.pluginName === pluginName) ?? -1;
    if (pluginIndex !== -1) {
        config.plugins.splice(pluginIndex, 1);
    }
}
