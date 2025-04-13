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

const editor = document.getElementById('editor');


let cursors = [{ start: editor.selectionStart, end: editor.selectionEnd }];  // Store positions of all cursors

// Utility function to render multiple cursors in the editor
function renderCursors() {
    const text = editor.value;
    let highlightedText = '';
    let lastIndex = 0;

    // Render each cursor
    cursors.forEach((cursor) => {
        highlightedText += text.substring(lastIndex, cursor.start) + 
            `<span class="multi-cursor">|</span>` + 
            text.substring(cursor.start, cursor.end);
        lastIndex = cursor.end;
    });

    // Add remaining text after the last cursor
    highlightedText += text.substring(lastIndex);
    editor.innerHTML = highlightedText;  // Replace with innerHTML to show cursors
}




function getCursorPositionAbove(cursor) {
    const lines = editor.value.split('\n');
    const currentLineIndex = editor.value.substring(0, cursor.start).split('\n').length - 1;

    // Prevent cursor movement beyond the top of the document
    if (currentLineIndex === 0) {
        return null;
    }

    const newLineIndex = currentLineIndex - 1;
    const newLineLength = lines[newLineIndex].length;
    const newCursorPosition = Math.min(newLineLength, cursor.start - lines.slice(0, currentLineIndex).join('\n').length - 1);
    
    return {
        start: newCursorPosition + lines.slice(0, newLineIndex).join('\n').length + (newLineIndex > 0 ? 1 : 0),
        end: newCursorPosition + lines.slice(0, newLineIndex).join('\n').length + (newLineIndex > 0 ? 1 : 0)
    };
}

function getCursorPositionBelow(cursor) {
    const lines = editor.value.split('\n');
    const currentLineIndex = editor.value.substring(0, cursor.start).split('\n').length - 1;

    // Prevent cursor movement beyond the bottom of the document
    if (currentLineIndex === lines.length - 1) {
        return null;
    }

    const newLineIndex = currentLineIndex + 1;
    const newLineLength = lines[newLineIndex].length;
    const newCursorPosition = Math.min(newLineLength, cursor.start - lines.slice(0, currentLineIndex).join('\n').length - 1);

    return {
        start: newCursorPosition + lines.slice(0, newLineIndex).join('\n').length + (newLineIndex > 0 ? 1 : 0),
        end: newCursorPosition + lines.slice(0, newLineIndex).join('\n').length + (newLineIndex > 0 ? 1 : 0)
    };
}


function applyInputToAllCursors(input) {
    const text = editor.value;
    const newText = [];
    let offset = 0;

    cursors.forEach((cursor) => {
        const beforeCursor = text.substring(0, cursor.start + offset);
        const afterCursor = text.substring(cursor.end + offset);
        newText.push(beforeCursor + input + afterCursor);

        offset += input.length;  // Adjust the offset based on input length
    });

    editor.value = newText.join('');  // Update the editor with new text
    renderCursors();  // Rerender cursors after update
}


function clearAllCursorsExceptPrimary() {
    cursors = [cursors[0]];  // Retain only the first cursor (primary one)
    renderCursors();
}

// Add multi-cursor with Ctrl + Alt + Arrow keys
export function handleMultiCursor(event) {
    const cursor = { start: editor.selectionStart, end: editor.selectionEnd };

    // Ctrl + Alt + Down Arrow - Add a new cursor on the line below
    if (event.ctrlKey && event.key === 'ArrowDown') {
        event.preventDefault();
        const newCursorPosition = getCursorPositionBelow(cursor);
        if (newCursorPosition) {
            cursors.push(newCursorPosition);  // Add new cursor
            renderCursors();
        }
    }

    // Ctrl + Alt + Up Arrow - Add a new cursor on the line above
    if (event.ctrlKey && event.key === 'ArrowUp') {
        event.preventDefault();
        const newCursorPosition = getCursorPositionAbove(cursor);
        if (newCursorPosition) {
            cursors.push(newCursorPosition);  // Add new cursor
            renderCursors();
        }
    }

    // Any other key event - apply the input to all cursors
    if (!event.ctrlKey) {
        applyInputToAllCursors(event.key);
    }
}
// Clear all cursors when clicking elsewhere in the editor
// editor.addEventListener('click', clearAllCursorsExceptPrimary);
