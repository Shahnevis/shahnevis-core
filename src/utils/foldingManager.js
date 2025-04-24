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
  

  export function createFoldingManager() {
    let foldedBlocks = {};

    return{
      setFoldedBlock: ()=> 
        setFoldedBlock(params),

      getFoldedBlocks: ()=>
        foldedBlocks,

      toggleFold: ()=> 
        toggleFold(startLine, actualLineNumber, editor, minimapContent, lineNumbers, setCode),

      foldingButtons: ()=> 
        foldingButtons(line, index, actualLineNumber, editor, minimapContent, lineNumbers, setCode),

      expandButtons: ()=> 
        expandButtons(line, index, actualLineNumber, editor, minimapContent, lineNumbers, setCode),

      expandViewToFull: ()=> 
        expandViewToFull(viewText, foldedBlocksMap),

      computeTotalSpan: ()=> 
        computeTotalSpan(start, foldedBlocks),

      updateFoldedBlocksAfterSwap: ()=> 
        updateFoldedBlocksAfterSwap(foldedBlocks, start1, start2),

      updateFoldingState: ()=>
        updateFoldingState(changeInfo, editor, updatedCode, oldFoldedBlocks, minimapContent, lineNumbers, setCode)

    }
  }
