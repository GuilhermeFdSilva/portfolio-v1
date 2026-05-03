export class Dialog {
  static dialogTemplateCache = null;

  constructor(desktop) {
    if (!desktop) throw new Error("Desktop element is required to initialize Dialog.");
    this.desktop = desktop;
  }

  static async loadDialogTemplate() {
    if (Dialog.dialogTemplateCache) return Dialog.dialogTemplateCache;

    const res = await fetch("./components/dialog/dialog.html");
    const html = await res.text();

    Dialog.dialogTemplateCache = html;
    return html;
  }

  async openDialog(config = {}) {
    const {
      title = "Aviso",
      message = "",
    } = config;

    const html = await Dialog.loadDialogTemplate();

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
}