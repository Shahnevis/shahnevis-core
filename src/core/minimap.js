export function updateMinimapContent(minimapContent, highlighter) {
    // Update the minimap content based on the highlighted code
    minimapContent.innerHTML = highlighter.innerHTML;
  }
  
  export function syncMinimapScroll(codeEditor, minimap, minimapScrollbar) {
    // Calculate the scroll percentage of the editor
    const editorScrollPercentage = codeEditor.scrollTop / (codeEditor.scrollHeight - codeEditor.clientHeight);
    // Calculate scrollbar height proportionally to the minimap and editor heights
    const scrollbarHeight = (codeEditor.clientHeight / codeEditor.scrollHeight) * minimap.clientHeight;
  
    // Adjust the minimap scrollbar height and position based on the scroll percentage
    minimapScrollbar.style.height = `${scrollbarHeight}px`;
    minimapScrollbar.style.top = `${editorScrollPercentage * (minimap.clientHeight - scrollbarHeight)}px`;
  }
  
  export function handleMinimapClick(event, codeEditor, minimap) {
    // Calculate where the user clicked within the minimap
    const minimapClickPercentage = event.offsetY / minimap.clientHeight;
    // Calculate the new scroll position in the editor based on where they clicked in the minimap
    const editorScrollPosition = minimapClickPercentage * (codeEditor.scrollHeight - codeEditor.clientHeight);
    
    // Set the editor's scroll position accordingly
    codeEditor.scrollTop = editorScrollPosition;
  }
  
  export default function minimapHandler(editor, codeEditor, highlighter, minimap, minimapContent, minimapScrollbar) {
    // Sync the minimap with the editor's content and scroll
    const updateContentAndScroll = () => {
      updateMinimapContent(minimapContent, highlighter);
      syncMinimapScroll(codeEditor, minimap, minimapScrollbar);
    };
  
    // Event listener for input in the editor
    const onInput = () => {
      updateContentAndScroll();
    };
  
    // Event listener for scroll in the code editor
    const onScroll = () => {
      syncMinimapScroll(codeEditor, minimap, minimapScrollbar);
    };
  
    // Event listener for clicking on the minimap to navigate
    const onMinimapClick = (event) => {
      handleMinimapClick(event, codeEditor, minimap);
    };
  
    // Add event listeners (only once)
    editor.addEventListener('input', onInput);
    codeEditor.addEventListener('scroll', onScroll);
    minimap.addEventListener('click', onMinimapClick);
  
    // Initialize the minimap with current content and scroll position
    updateContentAndScroll();
  
    // Optionally, if you want to handle cleanup (e.g., in React when unmounting)
    return () => {
      editor.removeEventListener('input', onInput);
      codeEditor.removeEventListener('scroll', onScroll);
      minimap.removeEventListener('click', onMinimapClick);
    };
  }
  