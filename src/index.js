// core exports
export { default as highlightHandler, updateSyntaxHighlighting } from './core/highlighting';
export { default as minimapHandler, updateMinimapContent } from './core/minimap';
export { default as featureHandler } from './core/feature';
export { default as pluginManager, loadExternalPlugins } from './core/pluginManager';

// utils exports
export { languages } from './utils/languages';
export { updateIndentationGuides } from './utils/lineNumbers';
export { handleSuggestions } from './utils/suggestions';
export { globalState } from './utils/global';
export { cleanForFolded, detectChange, generateFullCode } from './utils/codeChange';
export { updateFoldingState } from './utils/folding';
