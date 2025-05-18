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

import { updateSyntaxHighlighting } from "../core/highlighting";
import { updateMinimapContent } from "../core/minimap";
import { updateIndentationGuides } from "./lineNumbers";

export function setFoldedBlock(foldedBlocks, newMap) {
  return { ...newMap };
}

// Function to find block start and end positions for curly-brace-based languages
function findBlockBoundaries(startLine, actualLineNumber, code, foldedBlocks={}) {
  const lines = foldedBlocks[actualLineNumber] || code.split("\n");
  let blockStart = startLine;
  let openBraces = 0;
  // console.log(foldedBlocks);

  if (foldedBlocks[actualLineNumber]) {
    startLine = foldedBlocks[actualLineNumber] ? 0 : startLine;
    openBraces = 1;
  }

  let blockEnd = -1;

  let codeLine = actualLineNumber;
  for (let i = startLine; i < lines.length; i++) {
    // console.log(foldedBlocks);
    // console.log("foldedBlocks[i]: ", foldedBlocks[actualLineNumber]);
    if (lines[i].includes("{") && !foldedBlocks[codeLine]?.length) {
      if (blockStart === -1) blockStart = i;
      openBraces++;
    } else {
      // console.log(foldedBlocks[actualLineNumber]?.length);
      // console.log(typeof(foldedBlocks[actualLineNumber]?.length));
      //
      codeLine += foldedBlocks[actualLineNumber]?.length || 0;
    }
    // console.log("!foldedBlocks[i]: ", !foldedBlocks[codeLine]?.length);
    // console.log("i: ", i);
    // console.log("codeLine: ", codeLine);
    // console.log("lines: ", lines);
    // console.log(`lines[]: |${lines[i]}|`);
    // console.log(lines[i].includes("}"));
    //
    if (lines[i].includes("}")) {
      openBraces--;
      // console.log("openBraces: ", openBraces);
      if (openBraces === 0) {
        blockEnd = i;
        break;
      }
    }else{
      
    }
    codeLine++;
  }
  // && blockEnd !== -1
  if (blockStart !== -1  ) {
    return { blockStart, blockEnd };
  }
  return null;
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
export function foldingButtons(line, index, actualLineNumber, editor, minimapContent, lineNumbers, foldingManager) {
  const foldedBlocks = foldingManager.getFoldedBlocksById();
  // console.log(foldedBlocksById);
  const foldingButton = document.createElement('span');
  foldingButton.className = 'folding-button';
  const folded = !!foldedBlocks[actualLineNumber];

  if (line.includes("{")) {
    foldingButton.style.cursor = 'pointer';
    foldingButton.innerHTML = folded ? '▶' : '▼';
    foldingButton.addEventListener('click', () => foldingManager.toggleFold(index, actualLineNumber, editor, minimapContent, lineNumbers, foldingManager));
  } else {
    foldingButton.style.visibility = 'hidden';
  }

  return foldingButton;
}

// Function to find nested blocks and add folding buttons
export function expandButtons(line, index, actualLineNumber, editor, minimapContent, lineNumbers, foldingManager) {
  const foldedBlocks = foldingManager.getFoldedBlocksById();
    // console.log(foldedBlocksById);
    const expandBtn = document.createElement('div');
    expandBtn.className = 'expand-button';
    const folded = !!foldedBlocks[actualLineNumber];

    if (line.includes("{")) {
      expandBtn.innerHTML = '... }';
      expandBtn.style.left = `${line.length * 9 + 75}px`;
      expandBtn.style.visibility = folded ? 'visible' : 'hidden';
      expandBtn.addEventListener('click', () => foldingManager.toggleFold(index, actualLineNumber, editor, minimapContent, lineNumbers, foldingManager));
    } else {
      expandBtn.style.visibility = 'hidden';
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

/**
 * Rebuild the fully‑expanded lines and a view→full mapping
 * by splicing in every folded block in ascending order of start lines.
 *
 * @param {string} viewText
 * @param {{ [startLine: number]: string[] }} foldedBlocksMap
 * @returns {{ fullLines: string[], viewToFull: number[] }}
 */
export function expandViewToFull(viewText, foldedBlocksMap) {
  // Split the collapsed text into lines
  const viewLines = viewText.split(/\r?\n/);
  // Work on a mutable copy for splicing
  const fullLines = [...viewLines];

  // 1) Gather and sort full‑start keys
  const starts = Object
    .keys(foldedBlocksMap)
    .map(n => parseInt(n, 10))
    .sort((a, b) => a - b);

  // 2) Build a foldEntries array with viewStart and hidden info
  let hiddenAccum = 0;
  const foldEntries = starts.map(start => {
    const hiddenLines = foldedBlocksMap[start] || [];
    const countHidden = hiddenLines.length;
    // In the collapsed view, this block header appears at:
    const viewStart = start - hiddenAccum;
    hiddenAccum += countHidden;
    return { viewStart, hiddenCount: countHidden, hiddenLines };
  });

  // 3) Splice each block’s hidden lines back into fullLines
  let offset = 0;
  for (const { viewStart, hiddenLines } of foldEntries) {
    if (hiddenLines.length === 0) continue;
    // Insert _after_ the block header in fullLines, accounting for prior offsets
    fullLines.splice(viewStart + 1 + offset, 0, ...hiddenLines);
    offset += hiddenLines.length;
  }

  // 4) Build view→full mapping
  const viewToFull = viewLines.map((_, vIdx) => {
    let fIdx = vIdx;
    for (const { viewStart, hiddenCount } of foldEntries) {
      if (viewStart < vIdx) fIdx += hiddenCount;
      else break;
    }
    return fIdx;
  });

  return {
    fullText: fullLines.join("\n"),
    viewToFull
  };
}

/**
 * Recursively compute the full span for a folded block that begins at “start”.
 * The base span is determined by foldedBlocks[start].length (for example, a simple block
 * may have length 2 meaning it covers two lines). Then any folded block whose key falls
 * inside the base interval will extend the overall ending line if its own effective end is later.
*/
export function computeTotalSpan(start, foldedBlocks) {
  
  if(!foldedBlocks[start]) return 0;
  
  // Use the folded block's own length as the base span.
  const baseSpan = foldedBlocks[start].length;
  let totalEnd = start + baseSpan;
  
  // Look through every key (sorted in document order) that may be nested.
  const sortedKeys = Object.keys(foldedBlocks)
    .map(Number)
    .sort((a, b) => a - b);
  for (const k of sortedKeys) {
    // If k is nested inside the current block...
    if (k > start && k < totalEnd) {
      const nestedSpan = computeTotalSpan(k, foldedBlocks);
      const nestedEnd = k + nestedSpan;
      // Extend totalEnd if the nested block reaches further down.
      if (nestedEnd > totalEnd) {
        totalEnd = nestedEnd + 1;
      }
    }
  }
  
  return totalEnd - start;
}

/**
 * Swap two folded block segments (with their nested blocks) in the mapping.
*/
export function updateFoldedBlocksAfterSwap(foldedBlocks, start1, start2) {
  // Determine lower starting lines.
  const A = Math.min(start1, start2);
  const spanA = computeTotalSpan(A, foldedBlocks); // Compute effective spans for each block.
  const groupA_end = A + spanA;    // end boundary for group A
  
  // Determine higher starting lines.
  const B = Math.max(start1, start2) + (start2 > start1 ? spanA : 0);
  // const B = Math.max(start1, start2) + spanA;
  
  const spanB = computeTotalSpan(B, foldedBlocks); // Compute effective spans for each block.
  const groupB_end = B + spanB;    // end boundary for group B

  const updatedFoldedBlocks = {};
  for (const key in foldedBlocks) {
    const numKey = parseInt(key, 10);
    let newKey = numKey;
    let groupA_end = A + spanA;    // end boundary for group A

    if (numKey >= groupA_end && numKey < B) {
      // Keys in the gap between the two blocks.
      // Their new key shifts by the difference (spanB - spanA).

      newKey = numKey - (A + spanA) + (A + spanB) - 1;
    }
    else if (numKey >= A && numKey < groupA_end) {
      // Keys that belong to group A (first block)
      // They will be relocated to after group B.
      newKey = numKey - A + (B + spanB - spanA);
    } else if (numKey >= B && numKey < groupB_end) {
      // Keys that belong to group B (second block)
      // They move to the top (starting at A).      
      newKey = numKey - B + A;
    }  else {
      // Other keys (before A or after group B) remain unchanged.
      newKey = numKey;
    }
    
    updatedFoldedBlocks[newKey] = foldedBlocks[key];
  }

  return updatedFoldedBlocks;
}

// Function to handle the folding state update
export function updateFoldingState(changeInfo, editor, oldFoldedBlocks, minimapContent, lineNumbers, foldingManager) {
  
  // Destructure key values from the change object.
  // const { changeType, startLine: changeStart, endLine: changeEnd, startPos, lineCountChange, logicalCountChange: changeLength, data } = changeInfo;
    const {
    changeType,
    startLine: changeStart,
    endLine: changeEnd,
    startPos,
    lineCountChange,
    logicalCountChange: changeLength,
    data
  } = changeInfo;

  // No net change → keep existing folds
  if (lineCountChange === 0) {
    return oldFoldedBlocks;
  }
  
  const newFoldedBlocks = {};

    // This variable will track the cumulative net shift due to unfolded blocks,
    // which affects the starting line numbers of subsequent folded blocks.
    // let cumulativeShift = changeLength;
    const inputShift = changeLength>0?lineCountChange:changeLength;
    let cumulativeShift = changeLength>0?lineCountChange:changeLength;

    // Process each folded block from the old state.
    for (const key in oldFoldedBlocks) {
      // Convert key to an integer line number.
      const blockStart = parseInt(key, 10);
      const foldedBlock = oldFoldedBlocks[key];
      const blockLength = foldedBlock.length;

      const blockEnd = blockStart + blockLength - 1;
  
      // If the change is inserting a newline and it occurs inside a folded block, then "open" the block.
      if (changeStart === blockStart && lineCountChange > 0) {
        // Insertion on the first line of the folded block:
        // Unfold the block visually/logically.
        const keys = Object.keys(oldFoldedBlocks);
        const idx  = keys.indexOf(String(key));
        const keysBefore = keys.slice(0, idx);
        const dataBefore = keysBefore.map(k => oldFoldedBlocks[k]);
        const totalShift = dataBefore.flat().length;
        
        foldingManager.toggleFold(blockStart-totalShift, blockStart, editor, minimapContent, lineNumbers, foldingManager);
        editor.selectionStart = editor.selectionEnd = startPos;
        // Since we open the block, we remove it and only count the inserted lines.
        cumulativeShift += blockLength;
        continue;

      }
      if (changeStart >= blockStart && changeStart+lineCountChange <= blockStart) {
      // if (changeStart >= blockStart && changeStart <= blockEnd) {
        // The block is being modified by an enter; remove it from the folded stack.
        continue;
      }
  
      if (changeType == "deletion" && changeStart <= blockStart && changeEnd >= blockEnd) {
        continue;
      }

      // Otherwise, if the block starts before the change, it remains unchanged.
      // If it starts at or after the change, shift its starting line by the net line change.
      const newKey = blockStart < changeStart ? blockStart : blockStart + inputShift;
      if(newKey >= 0) newFoldedBlocks[newKey] = foldedBlock;
    }
    return newFoldedBlocks;
} 


export function  toggleFold (startLine, actualLineNumber, editor, minimapContent, lineNumbers, foldingManager) {
  const foldedBlocks = foldingManager.getFoldedBlocksById();
  const code = editor.value;
  const block = findBlockBoundaries(startLine, actualLineNumber, code, foldedBlocks);
  let updatedBlocks = {};
  // console.log(block);
  // console.log("actualLineNumber: ", actualLineNumber);
  if (block) {
    const { blockStart, blockEnd } = block;

    if (foldedBlocks[actualLineNumber]) {
      const foldedCode = foldedBlocks[actualLineNumber];
      const unfoldedCode = editor.value.split("\n");
      unfoldedCode.splice(blockStart + 1, 0, ...foldedCode);
      editor.value = unfoldedCode.join("\n");
      // console.log(unfoldedCode);
      
      updatedBlocks =  {...foldedBlocks} ;
      delete updatedBlocks[actualLineNumber]; // Remove the old block

      // updateIndentationGuides(editor, minimapContent, lineNumbers, {getFoldedBlocksById, foldingButtons, expandButtons});
      updateFoldSymbol(blockStart, false);
    } else {
      const codeLines = editor.value.split("\n");
      const foldedLines = codeLines.splice(blockStart + 1, blockEnd - blockStart);

      updatedBlocks = {
        ...foldedBlocks,
        [actualLineNumber]: foldedLines,
      };

      codeLines.splice(blockStart + 1, 0);
      // console.log(codeLines);
      editor.value = codeLines.join("\n");

      // updateIndentationGuides(editor, minimapContent, lineNumbers, {getFoldedBlocksById, foldingButtons, expandButtons});
      updateFoldSymbol(blockStart, true);
    }
  } else{
    updatedBlocks = {...foldedBlocks};
  }
  return {newCode: editor.value, newFoldedBlocks: updatedBlocks}
}

