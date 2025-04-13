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

import { updateSyntaxHighlighting } from "../core/highlighting.js";
import { languages } from "./languages.js";

let selectedIndex = -1;
const definedVariables = new Set();  // To store defined variables
const definedObjects = new Set();    // To store defined objects

// Function to extract variables and objects from the code
export function extractDefinedVarsAndObjects(code) {
    const varRegex = /\b(let|const|var|function)\s+(\w+)/g;
    const objRegex = /(\w+)\s*=\s*{/g;

    let match;
    
    // Clear the existing sets
    definedVariables.clear();
    definedObjects.clear();

    // Add defined variables
    while ((match = varRegex.exec(code)) !== null) {
        definedVariables.add(match[2]);
    }

    // Add defined objects
    while ((match = objRegex.exec(code)) !== null) {
        definedObjects.add(match[1]);
    }
}

// Function to handle arrow key navigation in the suggestion dropdown
function handleArrowDown(event, editor, suggestionDropdown, insertSuggestion, highlighter) {
    const items = suggestionDropdown.querySelectorAll('.suggestion-item');
    
    if (suggestionDropdown.style.display !== 'none' && items.length > 0) {
        if (event.key === 'ArrowDown') {
            event.preventDefault();
            selectedIndex = (selectedIndex + 1) % items.length;
            highlightSelected(items);
        } else if (event.key === 'ArrowUp') {
            event.preventDefault();
            selectedIndex = (selectedIndex - 1 + items.length) % items.length;
            highlightSelected(items);
        } else if (event.key === 'Enter' && selectedIndex >= 0) {
            event.preventDefault();
            insertSuggestion(items[selectedIndex].innerText, editor, suggestionDropdown, highlighter);
        }
    }
}

// Function to highlight the currently selected suggestion item
function highlightSelected(items) {
    items.forEach((item, index) => {
        if (index === selectedIndex) {
            item.classList.add('selected');
        } else {
            item.classList.remove('selected');
        }
    });
}

// Function to show the suggestions dropdown
function showSuggestionsDropdown(suggestions, cursorPosition, editor, suggestionDropdown, insertSuggestion, highlighter) {
    const { top, left } = getCaretCoordinates(editor, cursorPosition);
    suggestionDropdown.style.left = `${left}px`;
    suggestionDropdown.style.top = `${top + 20}px`; // Position slightly below the caret
    suggestionDropdown.innerHTML = suggestions.map(s => `<div class="suggestion-item">${s}</div>`).join('');
    suggestionDropdown.style.display = 'block';

    // Add event listeners to each suggestion item
    suggestionDropdown.querySelectorAll('.suggestion-item').forEach(item => {
        item.addEventListener('click', function() {
            insertSuggestion(this.innerText, editor, suggestionDropdown, highlighter);
        });
    });

    // Add the ArrowDown listener
    editor.addEventListener('keydown', (e) => handleArrowDown(e, editor, suggestionDropdown, insertSuggestion, highlighter));
}

// Function to hide the suggestions dropdown
function hideSuggestionsDropdown(editor, suggestionDropdown) {
    suggestionDropdown.style.display = 'none';
    editor.removeEventListener('keydown', handleArrowDown);
}

// Function to insert the selected suggestion into the editor
function insertSuggestion(suggestion, editor, suggestionDropdown, highlighter) {
    const cursorPosition = editor.selectionStart;
    const currentValue = editor.value;
    const lastWord = currentValue.substring(0, cursorPosition).split(/\s/).pop();

    // Replace the last word with the selected suggestion
    const newValue = currentValue.substring(0, cursorPosition - lastWord.length) + suggestion + currentValue.substring(cursorPosition);
    editor.value = newValue;
    
    hideSuggestionsDropdown(editor, suggestionDropdown);

    // Set the cursor position after the inserted word
    const newCursorPosition = cursorPosition - lastWord.length + suggestion.length;
    editor.setSelectionRange(newCursorPosition, newCursorPosition);

    // Update syntax highlighting
    // const highlight = null;
    updateSyntaxHighlighting(editor, highlighter);
}

// Function to get the caret (cursor) position in terms of pixel coordinates
function getCaretCoordinates(editor, position) {
    const div = document.createElement('div');
    const span = document.createElement('span');
    const copyStyle = getComputedStyle(editor);

    for (let prop of copyStyle) {
        div.style[prop] = copyStyle[prop];
    }

    div.textContent = editor.value.substring(0, position);
    span.textContent = editor.value.substring(position) || '.';

    div.appendChild(span);
    document.body.appendChild(div);

    const { offsetTop: top, offsetLeft: left } = span;
    document.body.removeChild(div);

    return { top, left };
}

// Main function to handle suggestions
export function handleSuggestions(editor, suggestionDropdown, languageSelector, highlighter) {
    // const lang = languageSelector.value;
    const lang = 'javascript';
    const cursorPosition = editor.selectionStart;
    const currentValue = editor.value.substring(0, cursorPosition);
    const lastWord = currentValue.split(/\s/).pop();
    
    if (lastWord.trim()) {
        // Combine reserved words and defined variables/objects for suggestions
        const suggestions = [
            ...languages[lang].reservedWords.filter(word => word.startsWith(lastWord)),
            ...Array.from(definedVariables).filter(varName => varName.startsWith(lastWord)),
            ...Array.from(definedObjects).filter(objName => objName.startsWith(lastWord))
        ];

        if (suggestions.length > 0) {
            showSuggestionsDropdown(suggestions, cursorPosition, editor, suggestionDropdown, insertSuggestion, highlighter);
        } else {
            hideSuggestionsDropdown(editor, suggestionDropdown);
        }
    }
}
