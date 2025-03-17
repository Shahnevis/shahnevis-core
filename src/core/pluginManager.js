// PluginManager.js

// PluginManager class to manage plugins
class PluginManager {
    constructor() {
        this.plugins = [];
    }

    // Register a new plugin
    registerPlugin(plugin) {
        if (typeof plugin.init === 'function') {
            plugin.init(); // Call the initialization function of the plugin
        }
        this.plugins.push(plugin);
    }

    // Execute a hook for all plugins
    runHook(hookName, ...args) {
        for (const plugin of this.plugins) {
            if (typeof plugin[hookName] === 'function') {
                plugin[hookName](...args);
            }
        }
    }
}

// Create an instance of the PluginManager
const pluginManager = new PluginManager();

// Function to load external plugins dynamically
export async function loadExternalPlugins(pluginURLs) {
    for (const url of pluginURLs) {
        try {
            const pluginModule = await import(url);
            pluginManager.registerPlugin(pluginModule.default);
        } catch (e) {
            console.error(`Failed to load plugin from ${url}:`, e);
        }
    }
}

export default pluginManager;
