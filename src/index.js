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
