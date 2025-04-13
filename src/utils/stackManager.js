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

import { configs, globalState } from "./global";


let isUndoingOrRedoing = false;
let debounceTimeout;

export function debounceSaveState(editor) {
    clearTimeout(debounceTimeout);
    debounceTimeout = setTimeout(saveState(editor), 300);  // Save state after 300ms of inactivity
}

// Save the initial state of the editor
export function saveState(editor) {
    if (isUndoingOrRedoing) return;
    globalState.undoStack.push(editor.value);
    globalState.redoStack = [];
    if (globalState.undoStack.length > configs.MAX_HISTORY_SIZE) {
        globalState.undoStack.shift(); // Remove the oldest state if max size is exceeded
    }
}

// Handle Undo action
function undo(editor) {
    if (globalState.undoStack.length > 0) {
        globalState.redoStack.push(editor.value); // Save the current state in the redo stack
        const previousState = globalState.undoStack.pop(); // Restore the previous state
        isUndoingOrRedoing = true;
        editor.value = previousState;
        isUndoingOrRedoing = false;
    }
}

// Handle Redo action
function redo(editor) {
    if (globalState.redoStack.length > 0) {
        globalState.undoStack.push(editor.value); // Save the current state in the undo stack
        const nextState = globalState.redoStack.pop(); // Restore the next state
        isUndoingOrRedoing = true;
        editor.value = nextState;
        isUndoingOrRedoing = false;
    }
}


// // Event listener for tracking changes in the editor
// // editor.addEventListener("input", saveState);
// editor.addEventListener("input", debounceSaveState);



export function handleUndoRedo(e, editor) {
    // Undo with Ctrl+Z or Cmd+Z
    if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
        e.preventDefault();
        undo(editor);
    }
    // Redo with Ctrl+Y or Cmd+Shift+Z
    if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) {
        e.preventDefault();
        redo(editor);
    }
}


