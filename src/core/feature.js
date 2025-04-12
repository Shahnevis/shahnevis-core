// import { updateSyntaxHighlighting } from "./highlighting.js";
// import { updateLineNumbers } from "../utils/lineNumbers.js";
import { handleMoveLine } from "../utils/handleLine.js";
import { updateIndentationGuides } from "../utils/lineNumbers.js";
import { debounceSaveState, handleUndoRedo, saveState } from "../utils/stackManager.js";
import { extractDefinedVarsAndObjects, handleSuggestions } from "../utils/suggestions.js";
// import { handleMultiCursor } from "../utils/multiCursors.js";

import { updateSyntaxHighlighting } from "./highlighting";

const tabSpaces = '    ';  // Number of spaces per tab (use '\t' for an actual tab character)

// Function to handle normal Tab (Indent)
function handleIndentation(editor, start, end) {
  editor.setRangeText(tabSpaces, start, start, 'end');
  editor.selectionStart = editor.selectionEnd = start + tabSpaces.length;
}

// Function to handle Shift+Tab (Outdent)
function handleOutdentation(editor, start, end) {
  const lines = editor.value.split('\n');
  let cursorLine = lines.findIndex(line => editor.value.indexOf(line) <= start && editor.value.indexOf(line) + line.length >= end);

  if (lines[cursorLine].startsWith(tabSpaces)) {
    lines[cursorLine] = lines[cursorLine].replace(tabSpaces, '');
    editor.value = lines.join('\n');
    editor.selectionStart = editor.selectionEnd = start - tabSpaces.length;
  }
}

// Function to handle Tab and Shift+Tab
function handleTabs(event, editor) {
  const start = editor.selectionStart;
  const end = editor.selectionEnd;
  
  if (event.key === 'Tab') {
    event.preventDefault();
    if (event.shiftKey) {
      handleOutdentation(editor, start, end);
    } else {
      handleIndentation(editor, start, end);
    }
    // updateLineNumbers();
    // const highlight = null;
    // updateSyntaxHighlighting(editor, highlight);
  }
}

// Function to handle auto-closing characters and wrapping selected text
function autoCloseOrWrap(event, editor, highlighter) {
  const char = event.key;
  const start = editor.selectionStart;
  const end = editor.selectionEnd;
  const selectedText = editor.value.substring(start, end);

  const closingChar = { '(': ')', '{': '}', '"': '"', "'": "'", "`": "`" };

  if (char === '(' || char === '{' || char === '"' || char === "'" || char === "`") {
    event.preventDefault();
    if (selectedText.length > 0) {
      const wrappedText = char + selectedText + closingChar[char];
      editor.setRangeText(wrappedText, start, end, 'end');
    } else {
      const insertText = char + closingChar[char];
      editor.setRangeText(insertText, start, start, 'end');
      editor.selectionStart = editor.selectionEnd = start + 1;
    }
  } else if (char === ')' || char === '}' || char === '"' || char === "'" || char === "`") {
    const cursorPosition = editor.selectionStart;
    if (editor.value[cursorPosition] === char) {
      event.preventDefault();
      editor.setSelectionRange(cursorPosition + 1, cursorPosition + 1);
    }
  }
  // updateLineNumbers();
  updateSyntaxHighlighting(editor, highlighter);
}

// Main feature handler
export default function featureHandler(
  editor, 
  minimapContent, 
  suggestionDropdown, 
  lineNumbers, 
  foldingUtils,
  languageSelector,
  highlighter
) {

  const onKeydown = (event) => {
    
    handleUndoRedo(event, editor)
    handleTabs(event, editor);
    handleMoveLine(event, editor);
    // handleMultiCursor(event, editor);  // Uncomment if needed
    autoCloseOrWrap(event, editor, highlighter);
    
    updateIndentationGuides(editor, minimapContent, lineNumbers, foldingUtils);  // Ensure indentation guides are updated properly
  };


  const onInput = () => {
    handleSuggestions(editor, suggestionDropdown, languageSelector, highlighter);
    extractDefinedVarsAndObjects(editor.value);
    updateIndentationGuides(editor, minimapContent, lineNumbers, foldingUtils);  // Ensure indentation guides are updated properly
    // updateSyntaxHighlighting(editor, languageSelector);
    debounceSaveState(editor);
  };

  // Add event listeners (only once)
  editor.addEventListener('keydown', onKeydown);
  editor.addEventListener('input', onInput);

  // Initialize the Features
  saveState(editor);  // Save initial state

  // Cleanup function to remove event listeners if needed (for React or other environments)
  return () => {
    editor.removeEventListener('keydown', onKeydown);
    editor.removeEventListener('input', onInput);
  };
}
