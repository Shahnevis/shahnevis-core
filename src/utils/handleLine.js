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

import { updateSyntaxHighlighting } from '../core/highlighting.js';
import { computeTotalSpan, updateFoldedBlocksAfterSwap } from './folding.js';

// moveLine =====================
// Function to move line up
function moveLineUp(editor, foldingUtils) {
    const foldedBlocks = foldingUtils.getFoldedBlocksById();
    const cursorPosition = editor.selectionStart;
    const lines = editor.value.split("\n");

    // Get the line number of the cursor
    const lineIndex = editor.value.substring(0, cursorPosition).split("\n").length - 1;
    let actualLineIndex = editor.value.substring(0, cursorPosition).split("\n").length - 1;

    let lastBlockNumber = 0;
    let lastBlockSize = 0;

    for (const key in foldedBlocks) {
        const numKey = parseInt(key, 10);

        if ((numKey > lastBlockNumber+lastBlockSize || lastBlockNumber == 0) && numKey < actualLineIndex) {
            lastBlockNumber = numKey
            if(lastBlockNumber != 0)
                lastBlockSize = 0;
        }

        if (numKey < actualLineIndex) {
            actualLineIndex += foldedBlocks[key].length
            lastBlockSize += foldedBlocks[key].length
        } else 
            break;
    }

    // If it's the first line, do nothing
    if (lineIndex === 0) return;

    // Swap the current line with the previous line
    const temp = lines[lineIndex];
    lines[lineIndex] = lines[lineIndex - 1];
    lines[lineIndex - 1] = temp;
    console.log("???????????????????");
    
    // Update the editor content
    editor.value = lines.join("\n");
    foldingUtils.updateFoldedBlocks(
        updateFoldedBlocksAfterSwap(
            foldedBlocks, 
            actualLineIndex, 
            foldedBlocks[actualLineIndex -lastBlockSize - 1]?
                lastBlockNumber:(actualLineIndex - 1)
        )
    )
    // Restore the cursor position
    const newCursorPos = cursorPosition - lines[lineIndex]?.length - 1; // Adjust cursor for the swapped line
    editor.selectionStart = editor.selectionEnd = newCursorPos;
}

// Function to move line down
function moveLineDown(editor, foldingUtils) {
    const foldedBlocks = foldingUtils.getFoldedBlocksById();
    const cursorPosition = editor.selectionStart;
    const lines = editor.value.split("\n");

    // Get the line number of the cursor
    const lineIndex = editor.value.substring(0, cursorPosition).split("\n").length - 1;
    let actualLineIndex = editor.value.substring(0, cursorPosition).split("\n").length - 1;


    for (const key in foldedBlocks) {
        const numKey = parseInt(key, 10);

        if (numKey < actualLineIndex) 
            actualLineIndex += foldedBlocks[key].length;
        else 
            break;
    }

    // If it's the last line, do nothing
    if (lineIndex === lines.length - 1) return;

    // Swap the current line with the next line
    const temp = lines[lineIndex];
    lines[lineIndex] = lines[lineIndex + 1];
    lines[lineIndex + 1] = temp;

    // Update the editor content
    editor.value = lines.join("\n");
    foldingUtils.updateFoldedBlocks(
        updateFoldedBlocksAfterSwap(foldedBlocks, actualLineIndex, actualLineIndex + 1)
    )

    // Restore the cursor position
    const newCursorPos = cursorPosition + lines[lineIndex]?.length + 1; // Adjust cursor for the swapped line
    editor.selectionStart = editor.selectionEnd = newCursorPos;
}

export function handleMoveLine(e, editor, foldingUtils) {
    if (e.altKey) {
        if (e.key === 'ArrowUp') {
            e.preventDefault();  // Prevent default browser behavior (if any)
            moveLineUp(editor, foldingUtils);
        } else if (e.key === 'ArrowDown') {
            e.preventDefault();  // Prevent default browser behavior (if any)
            moveLineDown(editor, foldingUtils);
        }
    }    
    // Update syntax highlighting if needed
    const highlight = null;
    updateSyntaxHighlighting(editor, highlight);
}
// moveLine =====================



// multi-line ===================
let anchorLineStart = null;
let anchorLineEnd = null;

// Function to handle multi-line selection
function multiLineSelect(direction, editor) {
    const cursorPosition = editor.selectionStart;
    const lines = editor.value.split("\n");

    // Get the current line number
    let lineIndex = editor.value.substring(0, cursorPosition).split("\n").length - 1;

    // Initialize anchor points if this is the first multi-line select
    if (anchorLineStart === null || anchorLineEnd === null) {
        anchorLineStart = lineIndex;
        anchorLineEnd = lineIndex;
    }

    // Move selection up or down
    if (direction === 'up' && anchorLineStart > 0) {
        anchorLineStart--;
    } else if (direction === 'down' && anchorLineEnd < lines.length - 1) {
        anchorLineEnd++;
    }

    // Select from the anchor start line to the anchor end line
    const start = getPositionForLine(anchorLineStart, editor);
    const end = getPositionForLine(anchorLineEnd, editor) + lines[anchorLineEnd].length;

    editor.setSelectionRange(start, end);
}

// Get the cursor position at the start of a given line
function getPositionForLine(lineIndex, editor) {
    const lines = editor.value.split("\n");
    let position = 0;
    for (let i = 0; i < lineIndex; i++) {
        position += lines[i].length + 1; // +1 for the newline character
    }
    return position;
}

// handle for Ctrl + Alt + Arrow keys
export function handleMultiSelect(e, editor) {
    if (e.ctrlKey && e.altKey) {
        if (e.key === 'ArrowUp') {
            e.preventDefault();  // Prevent default browser behavior
            multiLineSelect('up', editor);
        } else if (e.key === 'ArrowDown') {
            e.preventDefault();  // Prevent default browser behavior
            multiLineSelect('down', editor);
        }
    }
    // Update syntax highlighting if needed
    const highlight = null;
    updateSyntaxHighlighting(editor, highlight);
}

// Function to reset anchor points when the selection is cleared or changed manually
export function resetAnchorPoints(editor) {
    editor.addEventListener('click', () => {
        anchorLineStart = null;
        anchorLineEnd = null;
    });

    editor.addEventListener('input', () => {
        anchorLineStart = null;
        anchorLineEnd = null;
    });
}

// multi-line ===================
