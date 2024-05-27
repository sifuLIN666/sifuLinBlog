// buttons
const svgCopy = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-copy" viewBox="0 0 16 16">
<path fill-rule="evenodd" d="M4 2a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2zm2-1a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1zM2 5a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1v-1h1v1a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h1v1z"/>
</svg>`;
const svgCheck = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-check-all" viewBox="0 0 16 16">
<path d="M8.97 4.97a.75.75 0 0 1 1.07 1.05l-3.99 4.99a.75.75 0 0 1-1.08.02L2.324 8.384a.75.75 0 1 1 1.06-1.06l2.094 2.093L8.95 4.992zm-.92 5.14.92.92a.75.75 0 0 0 1.079-.02l3.992-4.99a.75.75 0 1 0-1.091-1.028L9.477 9.417l-.485-.486z"/>
</svg>`;
const svgError = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-x" viewBox="0 0 16 16">
<path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708"/>
</svg>`;
// add button function
const addCopyButtons = (clipboard) => {
  Object.entries(document.querySelectorAll("div.chroma")).forEach(
    (codeBlock) => {
      const code = codeBlock[1].querySelectorAll("pre > code");
      if (code) {
        const codeHead = document.createElement("div");
        codeHead.innerHTML = `<span class="code-lang">${code[1].getAttribute(
          "data-lang"
        )}</span>`;
        const copyButton = document.createElement("button");
        codeHead.className = "code-head";
        codeHead.appendChild(copyButton);
        copyButton.className = "code-copy-button";
        copyButton.type = "button";
        copyButton.innerHTML = svgCopy;
        copyButton.addEventListener("click", () => {
          clipboard
            .writeText(code[1].innerText)
            .then(() => {
              copyButton.blur();
              copyButton.innerHTML = svgCheck;
              setTimeout(() => (copyButton.innerHTML = svgCopy), 2000);
            })
            .catch((error) => {
              copyButton.innerHTML = "Error";
              console.error(error);
              setTimeout(() => (copyButton.innerHTML = svgError), 2000);
            });
        });
        codeBlock[1].insertAdjacentElement("beforebegin", codeHead);
      }
    }
  );
};
// trigger function
if (navigator && navigator.clipboard) {
  addCopyButtons(navigator.clipboard);
}
