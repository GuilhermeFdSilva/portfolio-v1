import { Task } from "../task/task.js";

export class Dialog extends Task {
    static #dialogTemplateCache = null;

    constructor(context, config = {}) {
        super(context);

        this.#openDialog(config);
    }

    static async #loadDialogTemplate() {
        if (Dialog.#dialogTemplateCache) {
            return Dialog.#dialogTemplateCache;
        }

        const response = await fetch("./components/dialog/dialog.html");
        Dialog.#dialogTemplateCache = await response.text();

        return Dialog.#dialogTemplateCache;
    }

    async #openDialog(config = {}) {
        const {
            title = "Aviso",
            message = "",
            iconSrc = "",
            iconAlt = "icon"
        } = config;

        const html = await Dialog.#loadDialogTemplate();
        const wrapper = document.createElement("div");
        wrapper.innerHTML = html;

        const dialog = wrapper.firstElementChild;
        const titleIcon = dialog.querySelector(".dialog-task-icon");

        dialog.querySelector(".dialog-title").textContent = title;
        dialog.querySelector(".dialog-message").textContent = message;

        titleIcon.alt = iconAlt;
        if (iconSrc) titleIcon.src = iconSrc;

        const closeButtons = [
            dialog.querySelector(".dialog-confirm"),
            dialog.querySelector(".dialog-close")
        ];

        this.openTask(dialog, closeButtons, {
            title,
            icon: {
                src: iconSrc,
                alt: iconAlt
            }
        });
    }
}
