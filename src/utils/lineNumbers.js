export function updateIndentationGuides(editor, minimapContent, lineNumbers, foldingUtils, setCode) {
    console.log("test");
    console.log(foldingUtils.getFoldedBlocksById());
    
    
    const codeLines = [...editor.value.split('\n')];
    // const lineNumbers = document.getElementById('line-numbers');
    lineNumbers.innerHTML = ''; // Clear previous lines

    let indentationLevels = [];
    let hiddenLineCount = 0;
    let currentVisibleLine = 0;

    // Iterate through code lines
    codeLines.forEach((line, index) => {
        const trimmedLine = line.trim();

        // If there are hidden lines, append placeholders
        if (hiddenLineCount) {
            appendHiddenLines(lineNumbers, hiddenLineCount);
            currentVisibleLine += hiddenLineCount + 1;
            hiddenLineCount = 0;
        } else {
            currentVisibleLine++;
        }

        const trimmedNextLine = codeLines[index+1]?.trim();
        const isFolded = !!foldingUtils.getFoldedBlocksById()[currentVisibleLine-1];


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
            hiddenLineCount = foldingUtils.getFoldedBlocksById()[currentVisibleLine-1].length;
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