import { standalone_foldedBlocks } from "./folding";

/**
 * Detects changes made in the editor and returns change information.
 * This includes detecting insertion, deletion, or modification of code.
 *
 * @param {Event} event - The event object from the editor change.
 * @param {string} oldCode - The code before the change.
 * @returns {Object} changeInfo - Information about the change.
 */
export function detectChange(event, newCode, oldCode) {
    const selectionStart = event.target.selectionStart;
    const selectionEnd = event.target.selectionEnd;

    const changeInfo = {
        changeType: '',
        affectedText: '',
        startLine: 0,
        endLine: 0,
        lineCountChange: 0,
        startPos: selectionStart,
        endPos: selectionEnd,
        context: ''
    };

    // Step 1: Detect if text was added, removed, or replaced
    if (newCode.length > oldCode.length) {
        // Insertion
        changeInfo.changeType = 'insertion';
        const diff = newCode.length - oldCode.length;
        changeInfo.affectedText = newCode.substr(selectionStart - diff, diff);
    } else if (newCode.length < oldCode.length) {
        // Deletion
        changeInfo.changeType = 'deletion';
        const diff = oldCode.length - newCode.length;
        changeInfo.affectedText = oldCode.substr(selectionStart, diff);
    } else {
        // Replacement (no length difference, just modified content)
        changeInfo.changeType = 'replacement';
        changeInfo.affectedText = newCode.substr(selectionStart, selectionEnd - selectionStart);
    }

    // Step 2: Determine which lines are affected
    const oldLines = oldCode.split('\n');
    const newLines = newCode.split('\n');
    
    // Find the start and end line for the change
    changeInfo.startLine = oldCode.slice(0, selectionStart).split("\n").length - 1;
    changeInfo.endLine = oldCode.slice(0, selectionEnd).split("\n").length - 1;
    changeInfo.lineCountChange = newLines.length - oldLines.length;

    // Step 3: Identify context for structural changes (e.g., block starts/ends)
    // For example, this can be used to detect whether curly braces or other structural characters were affected.
    if (changeInfo.affectedText.includes("{") || changeInfo.affectedText.includes("}")) {
        changeInfo.context = "blockStructureChange";
    } else if (changeInfo.affectedText.includes("(") || changeInfo.affectedText.includes(")")) {
        changeInfo.context = "functionStructureChange";
    }

    return changeInfo;
}


/**
 * Returns the full code by inserting folded blocks back into the visible code.
 *
 * @param {string} currentVisibleCode - The code as seen in the editor (with folded blocks hidden).
 * @returns {string} - The full code with all folded blocks inserted.
 */
export function generateFullCode(currentVisibleCode) {
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


export function cleanForFolded(fullCode) {
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
  