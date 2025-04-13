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

import { languages } from "../utils/languages.js";

/**
 * Updates the syntax highlighting based on the selected language and editor content.
 * 
 * @param {HTMLElement} editor - The reference to the editor element (textarea).
 * @param {HTMLElement} highlight - The reference to the highlight element (pre).
 */
export function updateSyntaxHighlighting(editor, highlight) {
    const code = editor.value;
      const lang = 'javascript'; // Replace with dynamic language if needed
      let highlightedCode = [""];
      if (languages[lang].syntax) {
        const syntax = languages[lang].syntax;
        const tokenizer = languages[lang].tokenizer;
        let bcode = code.match(tokenizer) || [];
        // console.log(code, bcode);
        
        highlightedCode = bcode.map(token => {
          for (const rule of Object.keys(syntax)) {
            if (new RegExp(syntax[rule], 'g').test(token)) {
              // Apply the first matching rule and return the highlighted token
              return token.replace(new RegExp(syntax[rule], 'g'), match => {
                return `<span class="${rule}">${match}</span>`;
              });
            }
          }
          // If no rule matched, return the token as is
          return token;
        });
          highlightedCode = highlightedCode.join("")
      }
    
      // Safely replace line breaks to maintain format
      if(highlight)
        highlight.innerHTML = highlightedCode.replace(/\n/g, '<br>');
}

/**
 * Synchronize the editor height with the highlight section.
 * 
 * @param {HTMLElement} editor - The reference to the editor element.
 * @param {HTMLElement} highlight - The reference to the highlight element.
 */
export function syncHighlightScroll(editor, highlight) {
    editor.style.height = `${highlight.offsetHeight}px`;
}

/**
 * Sets up event listeners for input and scroll synchronization.
 * 
 * @param {HTMLElement} editor - The reference to the editor element.
 * @param {HTMLElement} highlight - The reference to the highlight element.
 */
export default function highlightHandler(editor, highlight) {
    const sync = () => syncHighlightScroll(editor, highlight);

    editor.addEventListener('input', sync);
    window.addEventListener('resize', sync); // resize event is on the window, not the highlight element.
  
    // Initial sync on load
    sync();
}
