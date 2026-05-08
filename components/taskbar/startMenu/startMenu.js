export class StartMenu {
    static startMenu = null;
    static startMenuButton = null;
    static startMenuVisible = false;

    static configInstance(button) {
        if (StartMenu.startMenu) {
            return StartMenu.startMenu;
        }

        StartMenu.startMenu = this.#loadStartMenu();

        StartMenu.startMenuButton = button;

        StartMenu.startMenuButton.addEventListener("click", (event) => {
            event.stopPropagation();
            this.#switchStartMenuVisibility();
        });

        document.addEventListener("click", (event) => {
            if (StartMenu.startMenuVisible && !StartMenu.startMenu.contains(event.target) && event.target !== StartMenu.startMenuButton) {
                event.stopPropagation();
                this.#switchStartMenuVisibility();
            }
        });

        document.addEventListener("keydown", (event) => {
            if (StartMenu.startMenuVisible && event.key == "Escape") {
                event.stopPropagation();
                this.#switchStartMenuVisibility();
            }
        });

        return StartMenu.startMenu;
    }

    static getInstance() {
        if (!StartMenu.startMenuButton) {
            throw new Error("StartMenu instance not created yet");
        }

        return StartMenu.startMenuButton;
    }

    static async #loadStartMenuTemplate() {
        const res = await fetch("./components/taskbar/startMenu/startMenu.html");
        const html = await res.text();

        return html;
    }

    static async #loadStartMenu() {
        const wrapper = document.createElement("div");

        wrapper.innerHTML = await this.#loadStartMenuTemplate();
        const startMenu = wrapper.firstElementChild;

        StartMenu.startMenu = startMenu;

        return startMenu;
    }

    /**
     * Change start menu visibility
     */
    static #switchStartMenuVisibility() {
        StartMenu.startMenuVisible = !StartMenu.startMenuVisible;

        if (StartMenu.startMenuVisible) {
            StartMenu.startMenu.style.display = "flex";
        } else {
            StartMenu.startMenu.style.display = "none";
        }
    }
}