/* 
This file is part of Shahnevis Core.

Copyright (C) 2024 shahrooz saneidarani (github.com/shahroozD)

Shahnevis Core is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

Shahnevis Core is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program.  If not, see <https://www.gnu.org/licenses/>.
*/

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
