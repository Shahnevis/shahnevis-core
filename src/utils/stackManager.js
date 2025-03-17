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


