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


// Function to handle the folding state update
export function updateFoldingState(changeInfo, editor, updatedCode) {
    console.log(changeInfo);
    
    const newFoldedBlocks = { ...standalone_foldedBlocks };  // Copy the current folded blocks state
    const changeStart = changeInfo.startLine;  // Where the change starts
    const changeEnd = changeInfo.endLine;      // Where the change ends
    const changeLength = changeInfo.lineCountChange; // The number of lines added/removed

    console.log(newFoldedBlocks);
    let counter = 0;

    // Step 1: Adjust folding data based on change
    for (let lineNumber in newFoldedBlocks) {
        let foldedBlock = newFoldedBlocks[lineNumber];
        const blockStart = parseInt(lineNumber);  // Starting line of the folded block
        const blockEnd = blockStart + foldedBlock.length - 1;  // Ending line of the folded block
        
        console.log(blockStart);
        console.log(changeEnd+counter);
        
        // Case 1: If the change is before the folded block
        if (changeEnd+counter-1 < blockStart) {
            
            // Adjust the block's position based on the length of the change
            const newStartLine = blockStart + changeLength;
            console.log("newStartLine: ", newStartLine);
            const newFoldedBlock =  [...foldedBlock] ;
            delete newFoldedBlocks[lineNumber]; // Remove the old block
            newFoldedBlocks[newStartLine] = newFoldedBlock;  // Insert block at new position
        }
        
        // Case 2: If the change is inside the folded block
        else if (changeStart <= blockEnd && changeEnd+counter >= blockStart) {
            // delete newFoldedBlocks[lineNumber];
            // The change overlaps the block, so we unfold it
        }

        // Case 3: If the change is after the folded block, we do nothing
        else if (changeStart > blockEnd) {
            counter += foldedBlock.length;
            // No action needed, block stays in place
        }
    }

    // Step 2: Reapply folding to the updated code (optional, based on your use case)
    // Here you could check for newly foldable blocks after the change, if needed.
    // For simplicity, we assume only the adjustment of existing folded blocks is handled here.

    // Step 3: Update the global folding state
    // console.log(newFoldedBlocks);
    standalone_foldedBlocks = {...newFoldedBlocks}
    
    // setFoldedBlock(newFoldedBlocks);  // Update the folding state
}

