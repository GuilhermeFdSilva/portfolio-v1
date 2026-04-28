let dialogTemplateCache = null;
let desktop = document.getElementById("main");

async function loadDialogTemplate() {
  if (dialogTemplateCache) return dialogTemplateCache;

  const res = await fetch("./components/dialog/dialog.html");
  const html = await res.text();

  dialogTemplateCache = html;
  return html;
}

export async function openDialog(config = {}) {
  const {
    title = "Aviso",
    message = "",
  } = config;

  const html = await loadDialogTemplate();

  const wrapper = document.createElement("div");
  wrapper.innerHTML = html;

  const dialog = wrapper.firstElementChild;

  dialog.querySelector(".dialog-title").textContent = title;
  dialog.querySelector(".dialog-message").textContent = message;

  const close = () => dialog.remove();
  dialog.querySelector(".dialog-close").onclick = close;
  dialog.querySelector(".dialog-confirm").onclick = close;

  desktop.appendChild(dialog);
}
