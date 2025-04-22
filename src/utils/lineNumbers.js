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

export function updateIndentationGuides(editor, minimapContent, lineNumbers, foldingUtils, setCode) {

    
    const foldedBlocks = foldingUtils.getFoldedBlocksById();

    function countTotalFoldedLines(startLine) {
        const keys = Object.keys(foldedBlocks)
        .map(Number)
        .sort((a, b) => a - b);

        let total = foldedBlocks[startLine].length;
        // console.log("=---------------------------------");
        // console.log(foldedBlocks);
        // console.log(keys);
        
        for (let key of keys) {
            // console.log("key: ", key);
            // console.log("startLine: ", startLine);
            // console.log(foldedBlocks[key.toString()]);
            // console.log(foldedBlocks[key.toString()].length);
            // console.log(total);
            
            // console.log(key, parseInt(startLine));
            
            
            if (key <= startLine) continue;
            if (key < total+startLine) {
                total += foldedBlocks[key.toString()].length;
            } else {
                break;
            }
        }
        // console.log("total: ", total);
        
        return total;
    }
    
    
    const codeLines = [...editor.value.split('\n')];
    // const lineNumbers = document.getElementById('line-numbers');
    lineNumbers.innerHTML = ''; // Clear previous lines

    let indentationLevels = [];
    let hiddenLineCount = 0;
    let currentVisibleLine = 0;
    let i = 0;
    
    // Iterate through code lines
    codeLines.forEach((line, index) => {
        const trimmedLine = line.trim();

        // If there are hidden lines, append placeholders
        if (hiddenLineCount) {
            appendHiddenLines(lineNumbers, hiddenLineCount);
            
            currentVisibleLine += countTotalFoldedLines(currentVisibleLine -1 ) + 1;
            hiddenLineCount = 0;
        } else {
            currentVisibleLine++;
        }

        const trimmedNextLine = codeLines[index+1]?.trim();
        const isFolded = !!foldedBlocks[currentVisibleLine-1];

        // Create line number element with indentations
        const lineNumberElement = createLineNumberElement(
            trimmedLine,
            currentVisibleLine,
            indentationLevels,
            index
        );

        // Add fold/expand buttons
        lineNumberElement.appendChild(foldingUtils.foldingButtons(line, index, currentVisibleLine-1, editor, minimapContent, lineNumbers, setCode));
        lineNumberElement.appendChild(foldingUtils.expandButtons(line, index, currentVisibleLine-1, editor, minimapContent, lineNumbers, setCode));

        lineNumbers.appendChild(lineNumberElement);

        // Adjust indentation based on code structure
        handleIndentation(trimmedLine, trimmedNextLine, indentationLevels, isFolded);

        // Handle folded lines
        if (isFolded) {
            hiddenLineCount = foldedBlocks[currentVisibleLine-1].length;
            indentationLevels.pop();
        }
    });
}

  // Helper function to append hidden lines
  function appendHiddenLines(lineNumbers, count) {
    for (let i = 0; i < count; i++) {
        const hiddenLineNumberElement = document.createElement('div');
        hiddenLineNumberElement.className = `line-number`;
        hiddenLineNumberElement.style.visibility = 'hidden';
        lineNumbers.appendChild(hiddenLineNumberElement);
    }
  }

  // Helper function to create the line number element
  function createLineNumberElement(trimmedLine, visibleLineNumber, indentationLevels, index) {
    const lineNumberElement = document.createElement('div');
    lineNumberElement.className = `line-number`;

    const indentations = getIndentationGuides(indentationLevels);
    lineNumberElement.innerHTML = indentations + `<span>${visibleLineNumber}</span>`;

    return lineNumberElement;
  }

  // Helper function to get indentation guides
  function getIndentationGuides(levels) {
    let indentations = '';
    levels.forEach((level) => {
        indentations += `<span class="indentation-guide line-indentation-${level}"></span>`;
    });
    return indentations;
  }

  // Helper function to handle indentation logic
  function handleIndentation(trimmedLine, nextLine, indentationLevels, isFolded) {
    if ((trimmedLine.endsWith('{') && !isFolded) || trimmedLine.endsWith('(')) {
        indentationLevels.push(indentationLevels.length + 1); // New block
    }
    
    if (nextLine?.startsWith('}') || nextLine?.startsWith(')')) {
        indentationLevels.pop(); // End of block
    }
    
  }
  //#endregion