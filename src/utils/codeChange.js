import { standalone_foldedBlocks } from "./folding";

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
export function detectChange(event, newCode, oldCode, foldedBlocks) {
  const selectionStart = event.target.selectionStart;
  const selectionEnd = event.target.selectionEnd;
  const inputData = (event.inputType == "insertLineBreak") ?'\n':event.data;

  const changeInfo = {
    changeType: '',
    affectedText: '',
    startLine: 0,
    endLine: 0,
    lineCountChange: 0,
    logicalCountChange: 0,
    startPos: selectionStart,
    endPos: selectionEnd,
    editorIndex: 0,
    context: '',
    data: inputData
  };

  // Step 1: Detect type of change (insertion, deletion, replacement)
  const lengthDiff = newCode.length - oldCode.length;

  if (lengthDiff > 0) {
    // Insertion
    changeInfo.changeType = 'insertion';
    const insertedText = newCode.substring(selectionStart - lengthDiff, selectionStart);
    changeInfo.affectedText = insertedText;
  } else if (lengthDiff < 0) {
    // Deletion
    changeInfo.changeType = 'deletion';
    const deletedText = oldCode.substring(selectionStart, selectionStart - lengthDiff);
    changeInfo.affectedText = deletedText;
  } else {
    // Replacement
    changeInfo.changeType = 'replacement';
    changeInfo.affectedText = newCode.substring(selectionStart, selectionEnd);
  }


  // Calculate line counts
  // const oldLines = oldCode.substring(0, selectionStart).split('\n');
  // const newLines = newCode.substring(0, selectionStart).split('\n');

  let insertionStartPos = selectionStart;
  if (changeInfo.changeType === 'insertion') {
    insertionStartPos = selectionStart - lengthDiff;
  } else if (changeInfo.changeType === 'deletion') {
    insertionStartPos = selectionStart;
  }
  
  const oldLinesUntilStart = oldCode.substring(0, insertionStartPos).split('\n');
  const logicalStartLine = oldLinesUntilStart.length;

    
  // const logicalStartLine = oldLines.length - 1;
  const logicalEndLine = logicalStartLine + changeInfo.affectedText.split('\n').length - 1;
  
  // Step 2: Folded line adjustments (fixed to handle blocks correctly)
  function calculateRealLineNumber(logicalLine, foldedBlocks) {
      if (!foldedBlocks) return 0;
      let realLine = logicalLine -1;
      let adjusted;
      
      return Object.entries(foldedBlocks).reduce((total, [foldStart, foldedLines]) => {
        const foldStartLine = parseInt(foldStart, 10);
        // console.log("foldStart: ", foldStart);
        if (realLine <= foldStartLine) {
          // return realLine;
        } else if (foldStartLine < realLine) {  
          realLine += foldedLines.length;
        }
        return realLine;
      }, 0);
      
  }

  changeInfo.editorIndex = logicalStartLine;
  
  changeInfo.startLine = calculateRealLineNumber(logicalStartLine, foldedBlocks);
  changeInfo.endLine = calculateRealLineNumber(logicalEndLine, foldedBlocks);

  // Line count change calculation
  changeInfo.lineCountChange = newCode.split('\n').length - oldCode.split('\n').length;
  changeInfo.logicalCountChange = (changeInfo.endLine - changeInfo.startLine) * (changeInfo.lineCountChange < 0 ? -1 : 1);
  
  // Step 3: Identify context for structural changes
  if (/\{|\}/.test(changeInfo.affectedText)) {
    changeInfo.context = "blockStructureChange";
  } else if (/\(|\)/.test(changeInfo.affectedText)) {
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
  