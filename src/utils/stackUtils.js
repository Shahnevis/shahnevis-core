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
// utils/stackUtils.js

// 1) Save a snapshot immediately
export function saveSnapshot(manager, editor, foldingUtils) {
  if (manager.isUndoRedo) return;
  const snap = {
    text: editor.value,
    foldedBlocks: JSON.parse(
      JSON.stringify(foldingUtils.getFoldedBlocksById())
    ),
    cursorStart: editor.selectionStart,
    cursorEnd:   editor.selectionEnd
  };
  manager.undoStack.push(snap);
  manager.redoStack = [];
  if (manager.undoStack.length > manager.maxHistory) {
    manager.undoStack.shift();
  }
}

// 2) Debounced save
export function debounceSnapshot(manager, editor, foldingUtils, onChange) {
  clearTimeout(manager.debounceId);
  manager.debounceId = setTimeout(() => {
    saveSnapshot(manager, editor, foldingUtils);
    onChange((prevState) => ({
      ...prevState,
      undoStack: [...manager.undoStack],
      redoStack: [...manager.redoStack],
    }));
  }, 300);
}


/**
 * Undo the last snapshot: restore text + foldedBlocks, and push current state into redoStack.
 */
function undo(manager, editor, foldingUtils, onChange) {
  if (!manager.undoStack.length) return;


   // Decide whether to pop or just peek
   let prev;
   if (manager.undoStack.length < 2) {
     // Only one snapshot: peek at it but don't remove
     prev = manager.undoStack[0];
   } else {
     // More than one: pop the top snapshot
     prev = manager.undoStack.pop();

    // Push current state into redoStack
    manager.redoStack.push({
      text: editor.value,
      foldedBlocks: JSON.parse(
        JSON.stringify(foldingUtils.getFoldedBlocksById())
      ),
      cursorStart: editor.selectionStart,
      cursorEnd:   editor.selectionEnd
    });

   }
  manager.isUndoingOrRedoing = true;

  editor.value = prev.text;
  editor.selectionStart = prev.cursorStart;
  editor.selectionEnd   = prev.cursorEnd;
  foldingUtils.updateFoldedBlocks(prev.foldedBlocks);

  // Notify React state if provided
  if (typeof onChange === 'function') {
    onChange((prevState) => ({
      ...prevState,
      undoStack: [...manager.undoStack],
      redoStack: [...manager.redoStack],
    }));
  }

  manager.isUndoingOrRedoing = false;
}

/**
 * Redo the last undone snapshot: restore text + foldedBlocks, and push current state into undoStack.
 */
function redo(manager, editor, foldingUtils, onChange) {
  if (!manager.redoStack.length) return;

  // Push current state into undoStack
  manager.undoStack.push({
    text: editor.value,
    foldedBlocks: JSON.parse(
      JSON.stringify(foldingUtils.getFoldedBlocksById())
    ),
    cursorStart: editor.selectionStart,
    cursorEnd:   editor.selectionEnd
  });

  // Pop the last redo snapshot and restore
  const next = manager.redoStack.pop();
  manager.isUndoingOrRedoing = true;

  editor.value = next.text;
  editor.selectionStart = next.cursorStart;
  editor.selectionEnd   = next.cursorEnd;
  foldingUtils.updateFoldedBlocks(next.foldedBlocks);

  // Notify React state if provided
  if (typeof onChange === 'function') {
    onChange((prevState) => ({
      ...prevState,
      undoStack: [...manager.undoStack],
      redoStack: [...manager.redoStack],
    }));
  }

  manager.isUndoingOrRedoing = false;
}

/**
 * Keydown handler for undo/redo shortcuts.
 */
// Keydown handler
export function handleUndoRedo(e, stateManager, editor, foldingUtils, onChange) {
    
  const mod = e.ctrlKey || e.metaKey;
  if (!mod) return;

  // Ctrl+Z / Cmd+Z without Shift => undo
  if (e.key === "z" && !e.shiftKey) {
    e.preventDefault();
    undo(stateManager, editor, foldingUtils, onChange);
  }
  // Ctrl+Y or Cmd+Shift+Z => redo
  else if (e.key === "y" || (e.key === "z" && e.shiftKey)) {
    e.preventDefault();
    redo(stateManager, editor, foldingUtils, onChange);
  }
}
