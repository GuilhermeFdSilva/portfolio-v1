import { Task } from "../task/task.js";

export class Dialog extends Task {
  static dialogTemplateCache = null;

  constructor (context, config = {}) {
    super(context);    
    
    this.#openDialog(config);
  }

  static async #loadDialogTemplate() {
    if (Dialog.dialogTemplateCache) return Dialog.dialogTemplateCache;

    const res = await fetch("./components/dialog/dialog.html");
    const html = await res.text();

    Dialog.dialogTemplateCache = html;
    return html;
  }

  async #openDialog(config = {}) {
    const {
      title = "Aviso",
      message = "",
    } = config;

    const html = await Dialog.#loadDialogTemplate();

    const wrapper = document.createElement("div");
    wrapper.innerHTML = html;

    const dialog = wrapper.firstElementChild;

    dialog.querySelector(".dialog-title").textContent = title;
    dialog.querySelector(".dialog-message").textContent = message;

    const closeButtons = [
      dialog.querySelector(".dialog-confirm"),
      dialog.querySelector(".dialog-close")
    ];

    this.openTask(dialog, closeButtons);
  }
}