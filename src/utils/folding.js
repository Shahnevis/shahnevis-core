import { updateSyntaxHighlighting } from "../core/highlighting";
import { updateMinimapContent } from "../core/minimap";
import { updateIndentationGuides } from "./lineNumbers";

// Track folded blocks with their start and end positions
export let standalone_foldedBlocks = {};


export function setFoldedBlock(params) {
    standalone_foldedBlocks = params;
}

// Function to find block start and end positions for curly-brace-based languages
function findBlockBoundaries(startLine, actualLineNumber, code) {
    const lines = standalone_foldedBlocks[actualLineNumber] || code.split("\n");
    let blockStart = startLine;
    let openBraces = 0;

    if(standalone_foldedBlocks[actualLineNumber]){
        startLine = (standalone_foldedBlocks[actualLineNumber])?0:startLine
        openBraces = 1;
    }

    let blockEnd = -1;

    for (let i = startLine; i < lines.length; i++) {
        if (lines[i].includes("{")) {
            if (blockStart === -1) blockStart = i;
            openBraces++;
        }
        if (lines[i].includes("}")) {
            openBraces--;
            if (openBraces === 0) {
                blockEnd = i;
                break;
            }
        }
    }
    // console.log({ blockStart, blockEnd });
    // console.log(blockStart !== -1 && blockEnd !== -1);
    
    
    if (blockStart !== -1 && blockEnd !== -1) {
        return { blockStart, blockEnd };
    }
    return null;
}

// function to toggle block folding (fold/unfold)
function toggleFold(startLine, actualLineNumber, editor, minimapContent, lineNumbers, setCode) {
    const code = editor.value;
    const block = findBlockBoundaries(startLine, actualLineNumber, code);
    
    // console.log(block);
    if (block) {
        const { blockStart, blockEnd } = block;
        
        // Check if this block is already folded
        if (standalone_foldedBlocks[actualLineNumber]) {
            // Unfold the block by restoring the lines
            const foldedCode = standalone_foldedBlocks[actualLineNumber];
            const unfoldedCode = editor.value.split("\n");
            unfoldedCode.splice(blockStart + 1, 0, ...foldedCode);
            editor.value = unfoldedCode.join("\n");

            delete standalone_foldedBlocks[actualLineNumber];

            // Change symbol to unfold
            updateIndentationGuides(editor, minimapContent, lineNumbers); // Update line numbers after folding/unfolding
            updateFoldSymbol(blockStart, false);
        } else {
            // Fold the block by hiding lines between blockStart and blockEnd
            const codeLines = editor.value.split("\n");
            const foldedLines = codeLines.splice(blockStart + 1, blockEnd - blockStart);

            standalone_foldedBlocks[actualLineNumber] = foldedLines; // Store the folded lines
            codeLines.splice(blockStart + 1, 0); //`/* ... Folded ${foldedLines.length} lines */`

            editor.value = codeLines.join("\n");
            
            // Change symbol to fold
            updateIndentationGuides(editor, minimapContent, lineNumbers); // Update line numbers after folding/unfolding
            updateFoldSymbol(blockStart, true);
        }
        // // updateIndentationGuides(); // Update line numbers after folding/unfolding
        const highlight = null;
        updateSyntaxHighlighting(editor, highlight); // Reapply syntax highlighting
        updateMinimapContent(minimapContent, highlight); // Update the minimap
    }

    // Notify the parent or any external component about the new textarea value
    if (setCode) {
        setCode(editor.value); // Call the callback function with the updated code
    }
}

// Function to update the fold/unfold symbol based on the block state
function updateFoldSymbol(lineIndex, folded=false) {
    let symbol = (!folded)?'▼':'▶';
    const foldingButtons = document.querySelectorAll('.folding-button');
    const expandButtons = document.querySelectorAll('.expand-button');
    if (expandButtons[lineIndex]) {
        expandButtons[lineIndex].style.visibility = (folded)?'visible':'hidden';
    }
    if (foldingButtons[lineIndex]) {
        foldingButtons[lineIndex].innerHTML = symbol;
    }
}

// Function to find nested blocks and add folding buttons
export function foldingButtons(line, index, actualLineNumber, editor, minimapContent, lineNumbers, setCode) {
        const foldingButton = document.createElement('span');
        foldingButton.className = 'folding-button';
        const folded = !!standalone_foldedBlocks[actualLineNumber];
        // Check for curly brace to add folding functionality
        if (line.includes("{")) {
            foldingButton.style.cursor = 'pointer';
            foldingButton.innerHTML = (!folded)?'▼':'▶'; // Default to unfolded
            // foldingButton.style.visibility = (folded)?'visible':'hidden';
            foldingButton.addEventListener('click', () => toggleFold(index, actualLineNumber, editor, minimapContent, lineNumbers, setCode));
        } else {
            foldingButton.style.visibility = 'hidden'; // No foldable block
        }
        
        return foldingButton;
}

// Function to find nested blocks and add folding buttons
export function expandButtons(line, index, actualLineNumber, editor, minimapContent, lineNumbers, setCode) {

    const expandBtn = document.createElement('div');
    expandBtn.className = 'expand-button'; 
    const folded = !!standalone_foldedBlocks[actualLineNumber];
    // Check for curly brace to add folding functionality
    if (line.includes("{")) {
        expandBtn.innerHTML = '... }'; // Default to unfolded
        expandBtn.style.left = `${line.length*9+75}px`;
        expandBtn.style.visibility = (folded)?'visible':'hidden';
        expandBtn.addEventListener('click', () => toggleFold(index, actualLineNumber, editor, minimapContent, lineNumbers, setCode));
    } else {
        expandBtn.style.visibility = 'hidden'; // No foldable block
    }
    
    return expandBtn;
}

function pythonlike_findIndentedBlock(startLine, code) {
    const lines = code.split("\n");
    const indentLevel = lines[startLine].match(/^\s*/)[0].length;

    let blockEnd = startLine + 1;
    while (blockEnd < lines.length && lines[blockEnd].match(/^\s*/)[0].length > indentLevel) {
        blockEnd++;
    }

    return { blockStart: startLine, blockEnd: blockEnd - 1 };
}


export function updateFoldedBlocksAfterSwap(foldingUtils, rangeStart, rangeEnd) {
    const foldedBlocks = foldingUtils.getFoldedBlocksById();
    let cumulativeShift = 0;
    let delta = rangeEnd - rangeStart;
    console.log(foldedBlocks);
    console.log("rangeStart: ", rangeStart);
    console.log("rangeEnd: ", rangeEnd);

    const updatedFoldedBlocks = {};
    // Loop through every folded block key.
    for (const key in foldedBlocks) {
      const numKey = parseInt(key, 10);
      console.log("cumulativeShift: ", cumulativeShift);
      console.log("rangeEnd + cumulativeShift: ", rangeEnd + cumulativeShift);
      console.log("numKey: ", numKey);
      
      if (numKey === rangeStart) {
        // The folded block at the upper line moves to the bottom of the selection.
        updatedFoldedBlocks[rangeEnd] = foldedBlocks[key];
        cumulativeShift += foldedBlocks[key].length;

      } else if (numKey >= rangeStart && numKey <= rangeEnd + cumulativeShift) {
          // A folded block that starts inside the selected range shifts up by one.
          updatedFoldedBlocks[numKey + delta] = foldedBlocks[key];
          cumulativeShift += foldedBlocks[key].length;
      } else {
        // Other folded blocks remain unchanged.
        updatedFoldedBlocks[numKey] = foldedBlocks[key];
      }
    }
    console.log(updatedFoldedBlocks);
    
    return updatedFoldedBlocks;
}

// Function to handle the folding state update
export function updateFoldingState(changeInfo, editor, updatedCode, oldFoldedBlocks, minimapContent, lineNumbers, setCode) {
    const newFoldedBlocks = {};

    // Destructure key values from the change object.
    const { changeType, startLine: changeStart, endLine: changeEnd, startPos, lineCountChange, logicalCountChange: changeLength, data } = changeInfo;
    
    // Determine if the change contains an Enter/newline.
    const insertLength = data?.split('\n').length - 1 || 0;

    if(changeLength != 0){
      // This variable will track the cumulative net shift due to unfolded blocks,
      // which affects the starting line numbers of subsequent folded blocks.
      // let cumulativeShift = changeLength;
      let cumulativeShift = changeLength>0?lineCountChange:changeLength;

      // Process each folded block from the old state.
      for (const key in oldFoldedBlocks) {
        // Convert key to an integer line number.
        const blockStart = parseInt(key, 10);
        const foldedBlock = oldFoldedBlocks[key];
        const blockLength = foldedBlock.length;
        const blockEnd = blockStart + blockLength - 1;
    
        // If the change is inserting a newline and it occurs inside a folded block, then "open" the block.
        if (changeStart === blockStart) {
          // Insertion on the first line of the folded block:
          // Unfold the block visually/logically.
          toggleFold(blockStart+insertLength, blockStart, editor, minimapContent, lineNumbers, setCode);
          editor.selectionStart = editor.selectionEnd = startPos;
          // Since we open the block, we remove it and only count the inserted lines.
          cumulativeShift = insertLength;
          continue;

        }
        if (changeStart >= blockStart && changeStart+insertLength <= blockStart) {
        // if (changeStart >= blockStart && changeStart <= blockEnd) {
          // The block is being modified by an enter; remove it from the folded stack.
          continue;
        }
    
        if (changeType == "deletion" && changeStart <= blockStart && changeEnd >= blockEnd) {
          continue;
        }

        // Otherwise, if the block starts before the change, it remains unchanged.
        // If it starts at or after the change, shift its starting line by the net line change.
        const newKey = blockStart < changeStart ? blockStart : blockStart + cumulativeShift;
        if(newKey >= 0) newFoldedBlocks[newKey] = foldedBlock;
      }
      return newFoldedBlocks;
    }
    return oldFoldedBlocks;
} 