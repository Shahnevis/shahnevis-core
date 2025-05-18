import {
  setFoldedBlock,
  findBlockBoundaries,
  toggleFold,
  updateFoldSymbol,
  foldingButtons,
  expandButtons,
  expandViewToFull,
  computeTotalSpan,
  updateFoldedBlocksAfterSwap,
  updateFoldingState
  } from "./folding";
  

  export function createFoldingManager(initState) {
    
    let foldedBlocks = {...initState.foldedBlocks};
    const listeners = new Set();

    function notify() {
      for (const fn of listeners) fn({
        ...initState,
        foldedBlocks
      });
    }
  

    return{

      onChange(fn) {
        listeners.add(fn);
        return () => listeners.delete(fn);
      },

      // each of these methods drives state + notifies
      setFoldedBlock(params) {
        foldedBlocks = setFoldedBlock(foldedBlocks, params);
        notify();
      },

            // each of these methods drives state + notifies
            updateFoldedBlocks(params) {
              foldedBlocks = setFoldedBlock(foldedBlocks, params);
              notify();
            },

      getFoldedBlocksById() {
        return foldedBlocks;
      },

      toggleFold: (startLine, actualLineNumber, editor, minimapContent, lineNumbers, foldingManager)=> {
        const { newCode, newFoldedBlocks } = 
            toggleFold(startLine, actualLineNumber, editor, minimapContent, lineNumbers, foldingManager)
            // code = newCode;
            // console.log(newCode);
            
            foldedBlocks = newFoldedBlocks;
            // you can now update DOM once here:
            notify();
      },

      foldingButtons: (line, index, actualLineNumber, editor, minimapContent, lineNumbers, foldingManager)=> 
        foldingButtons(line, index, actualLineNumber, editor, minimapContent, lineNumbers, foldingManager),

      expandButtons: (line, index, actualLineNumber, editor, minimapContent, lineNumbers, foldingManager)=> 
        expandButtons(line, index, actualLineNumber, editor, minimapContent, lineNumbers, foldingManager),

      expandViewToFull: (viewText, foldedBlocksMap)=> 
        expandViewToFull(viewText, foldedBlocksMap),

      computeTotalSpan: (start, foldedBlocks)=> 
        computeTotalSpan(start, foldedBlocks),

      updateFoldedBlocksAfterSwap(start1, start2) {
        foldedBlocks = updateFoldedBlocksAfterSwap(foldedBlocks, start1, start2);
        notify();
      },

      updateFoldingState: (changeInfo, editor, oldFoldedBlocks, minimapContent, lineNumbers, foldingManager)=>{
        foldedBlocks = updateFoldingState(changeInfo, editor, oldFoldedBlocks, minimapContent, lineNumbers, foldingManager);
        notify();
      }
    }
  }
