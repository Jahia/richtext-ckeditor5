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
