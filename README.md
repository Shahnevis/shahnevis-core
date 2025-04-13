
### 📜 Shahnevis Core  

**Shahnevis Core** is a lightweight and flexible library for building custom code editors. It provides essential features like syntax highlighting, a minimap, multi-cursor support, line numbering, and plugin management. This library is framework-agnostic, meaning you can use it in React, Vue, or any other JavaScript environment.  

---

## 🚀 Features  

✅ Syntax highlighting  
✅ Minimap rendering  
✅ Multi-cursor support  
✅ Code folding  
✅ Plugin system for extensions  
✅ Language support for syntax parsing  

---

## 📦 Installation  

You can install `shahnevis-core` via npm:  

```sh
npm install shahnevis-core
```

or using yarn:  

```sh
yarn add shahnevis-core
```

---

## 🛠️ Usage  

### Example: Using Shahnevis Core in React  

```js
import { 
  languages, highlightHandler, updateSyntaxHighlighting, minimapHandler, updateMinimapContent,
  featureHandler, updateIndentationGuides, handleSuggestions, pluginManager, loadExternalPlugins,
  globalState, cleanForFolded, detectChange, generateFullCode, updateFoldingState
} from "shahnevis-core";

// Example usage
highlightHandler("your-code-here");
updateSyntaxHighlighting();
```

For more advanced usage, refer to the documentation.

---

## 🔌 Plugin System  

Shahnevis Core supports a **plugin system** that allows developers to extend functionality dynamically.

### 📥 Creating a Plugin  

Here's an example of a **Preview Plugin** that updates an iframe when the user writes HTML code:  

```js
export default {
  init() {
    console.log("Preview Plugin Loaded!");
  },

  onLanguageChange(language) {
    if (language === "html") {
      console.log("HTML selected!");
    }
  },

  onInput() {
    const languageSelector = document.getElementById("language-selector");
    const previewFrame = document.getElementById("preview-frame");
    const editor = document.getElementById("editor");

    if (!languageSelector || !previewFrame || !editor) {
      console.warn("Preview Plugin: Missing required DOM elements.");
      return;
    }

    const language = languageSelector.value;
    if (language === "html") {
      previewFrame.srcdoc = editor.value;
    }
  }
};
```

### 🛠️ Registering the Plugin  

To register this plugin, use:  

```js
const pluginURLs = [
    'path to plugin'
]

const loadPlugins = async () => {
    await loadExternalPlugins(pluginURLs);
    console.log("Plugins loaded.");
};
loadPlugins();
```

---

## 🌍 Supported Languages  

Shahnevis Core comes with built-in support for multiple programming languages via the `languages` module. You can extend this list with additional parsers.

---

## 🤝 Contributing  

We welcome contributions! To contribute:  

1. Fork the repository  
2. Create a feature branch (`git checkout -b feature-new`)  
3. Commit your changes (`git commit -m "Add new feature"`)  
4. Push to the branch (`git push origin feature-new`)  
5. Open a pull request  

---

## License

This project is licensed under the GNU General Public License v3.0 (GPLv3).  
See the LICENSE file for details.


