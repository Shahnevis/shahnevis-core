import { expandViewToFull } from "./folding.js";
import { makePasteChangeInfo } from "./codeChange.js";

/**
 * Move the cursor's current line up *in the FULL, unfolded code*.
 *
 * After the move, everything remains unfolded in the editor.
 */
export async function handleCopyOrCut(event, editor, foldingManager) {
    if (event.ctrlKey && (event.key === 'c' || event.key === 'x')) {
        event.preventDefault();
        
        // 1) grab the folded‑blocks map and current (collapsed) text
        const foldedBlocks = foldingManager.getFoldedBlocksById();
        const viewText     = editor.value;

        // 2) rebuild the full text and view→full mapping
        const { fullText, viewToFull } = expandViewToFull(viewText, foldedBlocks);
        const fullLines = fullText.split(/\r?\n/);

        // 3) figure out selection in view-coordinates
        const { selectionStart, selectionEnd } = editor;
        console.log({ selectionStart, selectionEnd });
        console.log({ fullText, viewToFull });
        
        
        const beforeStart = viewText.slice(0, selectionStart);
        const beforeEnd   = viewText.slice(0, selectionEnd);
        const afterEnd   = viewText.slice(selectionEnd, viewText.length);

        const viewStartLine = beforeStart.split(/\r?\n/).length - 1;
        const viewStartCol  = selectionStart - (beforeStart.lastIndexOf('\n') + 1);

        const viewEndLine = beforeEnd.split(/\r?\n/).length - 1;
        const viewEndCol  = selectionEnd - (beforeEnd.lastIndexOf('\n') + 1);

        // 4) map those into full‑text lines
        const fullStartLine = viewToFull[viewStartLine];
        
        const fullEndLine   = viewToFull[viewEndLine];

        // 5) compute character offsets in fullText
        const charOffset = (line, col) => {
            console.log(line, col);
            
            let off = 0;
            for (let i = 0; i < line; i++) {
                off += fullLines[i].length + 1; // +1 for '\n'
            }
            return off + col;
        };
        console.log("viewStartCol, viewEndCol", viewStartCol, viewEndCol);
        
        const startOffset = charOffset(fullStartLine, viewStartCol);
        const endOffset   = charOffset(fullEndLine,   viewEndCol);

        // 6) extract and copy
        const extracted = fullText.slice(startOffset, endOffset);
        try {
            // Write to clipboard
            await navigator.clipboard.writeText(extracted);
          } catch (err) {
            console.error('Clipboard write failed', err);
            // (You could fallback to execCommand here if you really needed to)
          }
          

        // 7) if it’s a cut, remove that slice and overwrite the editor
        if (event.key === 'x') {
            const newFullText = beforeStart + afterEnd;
            editor.value = newFullText;

            // Figure out how many FULL lines got removed
            const removedLines = fullEndLine - fullStartLine;
            console.log(removedLines);
            
            const newFolded = {};
            for (const [key, lines] of Object.entries(foldedBlocks)) {
                const startNum = parseInt(key, 10);
                if (startNum < fullStartLine) {
                    // Blocks entirely before the cut stay at the same key
                    newFolded[startNum] = lines;
                } else if (startNum > fullEndLine) {
                    // Blocks after the cut get shifted up by removedLines
                    newFolded[startNum - removedLines] = lines;
                }
                // else: blocks whose start was within [fullStartLine..fullEndLine] are dropped
            }
            // Push the filtered map back into your folding utils
            foldingManager.updateFoldedBlocks(newFolded);         
             
            editor.selectionStart = editor.selectionEnd = selectionStart;
        }
    }
}



export function handlePaste(event, editor, minimapContent, lineNumbers, foldingManager) {
    // Only intercept real paste events
    if (event.type !== "paste") return;
    
    const foldedBlocks = foldingManager.getFoldedBlocksById();
    
    const changeInfo   = makePasteChangeInfo(event, editor, foldedBlocks);

    console.log(event.type);
    // console.log(foldedBlocks);
    

    // Update Folding State (handle fold/unfold based on code changes)
    foldingManager.updateFoldingState(
      changeInfo, editor, foldedBlocks, 
        minimapContent, lineNumbers, foldingManager
    )
        
}