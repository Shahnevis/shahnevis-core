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

import { expandViewToFull } from "./folding";

/**
 * Detects changes made in the editor and returns detailed change information.
 * This includes detecting insertion, deletion, or modification of code, handling folded blocks.
 *
 * @param {Event} event - The event object from the editor change.
 * @param {string} newCode - The code after the change.
 * @param {string} oldCode - The code before the change.
 * @param {Object} foldedBlocks - Information about folded blocks in the editor.
 * @returns {Object} changeInfo - Information about the detected change.
**/
export function detectChange(e, editor, foldedBlocksMap) {
  const key        = e.key || "";
  const viewBefore = editor.value;
  let startPos     = editor.selectionStart;
  let endPos       = editor.selectionEnd;

  // figure out exactly what was removed or inserted
  let insertText  = "";
  let removedText = viewBefore.slice(startPos, endPos);

  if (key.length === 1 || key === "Enter") {
    insertText = key === "Enter" ? "\n" : key;
  } else if (key === "Backspace" || key === "Delete") {
    if (startPos === endPos) {
      if (key === "Backspace" && startPos > 0) {
        startPos -= 1;
        removedText = viewBefore.charAt(startPos);
      } else if (key === "Delete" && endPos < viewBefore.length) {
        removedText = viewBefore.charAt(endPos);
        endPos += 1;
      } else {
        return null;
      }
    }
  }

  // Count how many view‐lines the edit touched
  const removedViewLines  = (removedText.match(/\n/g) || []).length;
  const insertedViewLines = (insertText.match(/\n/g)  || []).length;

  // Build the “after” view so we can expand it
  const viewAfter = viewBefore.slice(0, startPos)
                 + insertText
                 + viewBefore.slice(endPos);

  // Expand both to full text & grab the mapping
  const beforeExp = expandViewToFull(viewBefore, foldedBlocksMap);
  
  const afterExp  = expandViewToFull(viewAfter,  foldedBlocksMap);

  const fullBefore = beforeExp.fullText;
  const fullAfter  = afterExp.fullText;
  const { viewToFull } = beforeExp;

  // Compute the view→full start line
  const viewStartLine = viewBefore.slice(0, startPos).split("\n").length - 1;
  const fullStartLine = viewToFull[viewStartLine];

  // Now do the one true logical line‐count diff
  const fullBeforeLines = fullBefore.length;
  const fullAfterLines  = fullAfter.length;
  const logicalCountChange = fullAfterLines - fullBeforeLines;

  return {
    changeType:         removedText.length && !insertText ? "deletion" : "insertion",
    startLine:          fullStartLine,
    endLine:            fullStartLine + removedViewLines,  
    startPos,
    data:               insertText || null,
    lineCountChange:    insertedViewLines - removedViewLines,
    logicalCountChange                  
  };
}

/**
 * Build a changeInfo object for an insertion (paste), taking folded blocks into account.
 *
 * @param {ClipboardEvent} e
 * @param {HTMLTextAreaElement} editor
 * @param {Object} foldedBlocksMap
 * @returns {{
*   changeType: "insertion",
*   startLine: number,
*   endLine: number,
*   startPos: number,
*   data: string,
*   lineCountChange: number,
*   logicalCountChange: number
* }}
*/
export function makePasteChangeInfo(e, editor, foldedBlocksMap) {
 // 1) Raw paste data and selection in the *view* (collapsed) text
 const pasteText     = e.clipboardData.getData("text/plain");
 const viewText      = editor.value;
 const { selectionStart, selectionEnd } = editor;

 // 2) Rebuild full→view mapping so we can convert view-lines → full-lines
 const { viewToFull } = expandViewToFull(viewText, foldedBlocksMap);

 // 3) Compute where the selection begins/ends in view lines & cols
 const beforeStart    = viewText.slice(0, selectionStart);
 const beforeEnd      = viewText.slice(0, selectionEnd);

 const viewStartLine  = beforeStart.split("\n").length - 1;
 const viewStartCol   = selectionStart - (beforeStart.lastIndexOf("\n") + 1);

 const viewEndLine    = beforeEnd.split("\n").length - 1;
 const viewEndCol     = selectionEnd - (beforeEnd.lastIndexOf("\n") + 1);

 // 4) Translate those view lines into full‑text lines
 const fullStartLine  = viewToFull[viewStartLine];
 const fullEndLine    = viewToFull[viewEndLine];

 // 5) Count lines removed & inserted in the *view*
 const removedViewLines   = viewEndLine  - viewStartLine;
 const insertedViewLines  = pasteText.split("\n").length - 1;
 const lineCountChange    = insertedViewLines - removedViewLines;

 // 6) Count lines removed & inserted in the *full* text
 const removedFullLines   = fullEndLine  - fullStartLine;
 const insertedFullLines  = insertedViewLines; // same as view for paste
 const logicalCountChange = insertedFullLines - removedFullLines;

 return {
   changeType:       "insertion",
   startLine:        fullStartLine,
   endLine:          fullEndLine,
   startPos:         selectionStart,
   data:             pasteText,
   lineCountChange,
   logicalCountChange
 };
}

/**
 * Returns the full code by inserting folded blocks back into the visible code.
 *
 * @param {string} currentVisibleCode - The code as seen in the editor (with folded blocks hidden).
 * @returns {string} - The full code with all folded blocks inserted.
 */
export function generateFullCode(currentVisibleCode, standalone_foldedBlocks) {
    const codeLines = currentVisibleCode.split('\n');  // Split visible code into lines
    const fullCode = [];  // Array to store the final full code
    
    // Loop through each line in the visible code
    for (let i = 0; i < codeLines.length; i++) {
        fullCode.push(codeLines[i]);  // Add the current visible line to fullCode

        // Check if this line is a folded line (i.e., it's the start of a folded block)
        if (standalone_foldedBlocks[i]) {
            // Insert the folded block (stored lines) into the correct place
            const foldedLines = standalone_foldedBlocks[i];
            console.log(foldedLines);
            
            fullCode.push(...foldedLines);  // Unfold and insert the folded lines
        }
    }

    return fullCode.join('\n');  // Combine all lines back into a single string and return
}

export function cleanForFolded(fullCode, standalone_foldedBlocks) {
    // Split the full code into lines
    const lines = fullCode.split("\n");
  
    // Create an array to store the resulting lines after removing the folded ones
    let visibleLines = [];
    
    // Iterate through each line, skipping the ones that are part of folded blocks
    lines.forEach((line, lineIndex) => {
      // Check if the current lineIndex is part of any folded block
      let isFoldedLine = false;
  
      for (const [foldStartIndex, foldedBlockLines] of Object.entries(standalone_foldedBlocks)) {
        const startIndex = parseInt(foldStartIndex, 10);
        const endIndex = startIndex + foldedBlockLines.length;
  
        // If the current line index falls within the folded block range, mark it as folded
        if (lineIndex > startIndex && lineIndex <= endIndex) {
          isFoldedLine = true;
          break; // No need to check further once it's determined as folded
        }
      }
  
      // If it's not part of any folded block, add it to the visibleLines array
      if (!isFoldedLine) {
        visibleLines.push(line);
      }
    });
  
    // Join the visible lines back into a string and return the updated code
    return visibleLines.join("\n");
}

export function handleCodeChange(event, editor, minimapContent, lineNumbers, foldingManager) {
  // Only intercept real inserrt events
  if (!event.altKey && !event.ctrlKey) {
    
    const foldedBlocks = foldingManager.getFoldedBlocksById();
    const changeInfo   = detectChange(event, editor, foldedBlocks);
  
    // Update Folding State (handle fold/unfold based on code changes)
    foldingManager.updateFoldingState(
      changeInfo, editor, foldedBlocks, 
        minimapContent, lineNumbers, foldingManager
    )
  }
}