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
  
export default function minimapHandler(
  editor,
  codeEditor,
  highlighter,
  minimap,
  minimapContent,
  minimapScrollbar
) {
  // Sync the minimap with the editor's content and scroll
  var updateContentAndScroll = function updateContentAndScroll() {
    updateMinimapContent(minimapContent, highlighter);
    syncMinimapScroll(codeEditor, minimap, minimapScrollbar);
  };

  // Event listener for input in the editor
  var onInput = function onInput() {
    updateContentAndScroll();
  };

  // Event listener for scroll in the code editor
  var onScroll = function onScroll() {
    syncMinimapScroll(codeEditor, minimap, minimapScrollbar);
  };

  // Event listener for clicking on the minimap to navigate
  var onMinimapClick = function onMinimapClick(event) {
    handleMinimapClick(event, codeEditor, minimap);
  };

  // Combined mousedown handler for both click and drag
  const onMinimapMouseDown = function onMinimapMouseDown(event) {
    // Prevent default behavior (like text selection)
    event.preventDefault();

    // Record the starting coordinates and scroll position
    const startX = event.clientX;
    const startY = event.clientY;
    let dragged = false;
    const startScrollTop = codeEditor.scrollTop;

    // Calculate the total scrollable area of the code editor
    const codeEditorScrollableHeight = codeEditor.scrollHeight - codeEditor.clientHeight;
    // Determine the minimap dimensions and thumb limits
    const minimapHeight = minimap.clientHeight;
    const thumbHeight = minimapScrollbar.clientHeight;
    const maxThumbMove = minimapHeight - thumbHeight;
    
    // Mousemove handler to update the scroll position if dragging occurs
    const onMouseMove = function onMouseMove(e) {
      const deltaX = Math.abs(e.clientX - startX);
      const deltaY = Math.abs(e.clientY - startY);
      
      // If the movement exceeds a small threshold, consider it a drag.
      if (!dragged && (deltaX > 5 || deltaY > 5)) {
        dragged = true;
        // Change the cursor to indicate dragging
        minimap.style.cursor = 'grabbing';
      }
      
      if (dragged) {
        // Calculate how much the mouse has moved vertically
        const moveY = e.clientY - startY;
        // Convert thumb movement into a scroll delta for the code editor
        const scrollDelta = (moveY / maxThumbMove) * codeEditorScrollableHeight;
        let newScrollTop = startScrollTop + scrollDelta;
        // Clamp the new scroll position within valid bounds
        newScrollTop = Math.max(0, Math.min(newScrollTop, codeEditorScrollableHeight));
        codeEditor.scrollTop = newScrollTop;
        // Update the minimap thumb position using your sync function
        syncMinimapScroll(codeEditor, minimap, minimapScrollbar);
      }
    };

    // Mouseup handler: if no dragging occurred, treat as a click.
    const onMouseUp = function onMouseUp(e) {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);

      // Restore the original cursor regardless of the action
      minimap.style.cursor = '';

      // If the mouse hasn't moved much, it's a click rather than a drag.
      if (!dragged) {
        onMinimapClick(e);
      }
    };

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
  };

  // Add event listeners (only once)
  editor.addEventListener('input', onInput);
  codeEditor.addEventListener('scroll', onScroll);
  minimap.addEventListener('mousedown', onMinimapMouseDown);

  // Initialize the minimap with current content and scroll position
  updateContentAndScroll();

  // Optionally, return a cleanup function (useful if used in a React useEffect)
  return function cleanup() {
    editor.removeEventListener('input', onInput);
    codeEditor.removeEventListener('scroll', onScroll);
    minimap.removeEventListener('mousedown', onMinimapMouseDown);
  };
}