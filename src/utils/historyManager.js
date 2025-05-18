import { globalState } from "./global";
import {
    saveSnapshot,
    debounceSnapshot,
    handleUndoRedo as handleUndoRedoAction
  } from "./stackUtils";
  
  /**
   * Factory to create an isolated history manager for each editor instance.
   * @param {number} maxSize - Maximum number of history entries to keep.
   */
  export function createHistoryManager(onChange, initialState = {...globalState}, maxSize = 100) {


    // console.log("---------------------");
    // console.log(initialState);
    

    const manager = {
      undoStack: [...initialState.undoStack],
      redoStack: [...initialState.redoStack],
      isUndoRedo: false,
      maxHistory: maxSize,
      debounceId: null
    };
  
    return {
      saveState: (editor, foldingManager) => {
        saveSnapshot(manager, editor, foldingManager);
        onChange((prevState) => ({
          ...prevState,
          undoStack: [...manager.undoStack],
          redoStack: [...manager.redoStack]
        }));
      },
      debounceSaveState: (editor, foldingManager) => {
        debounceSnapshot(manager, editor, foldingManager, onChange);
      },
  
      /** Keydown handler for undo/redo */
      handleUndoRedo: (e, editor, foldingManager) =>
        handleUndoRedoAction(e, manager, editor, foldingManager, onChange),

      getStack: ()=>(manager)
    };
  }
  