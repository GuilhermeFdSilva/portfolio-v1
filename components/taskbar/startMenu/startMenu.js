export class StartMenu {
    static #startMenu = null;
    static #startMenuButton = null;
    static #startMenuVisible = false;
    static #startMenuTemplateCache = null;

    constructor() {
        throw new Error("StartMenu is a static class and cannot be instantiated.");
    }

    static async configInstance(button) {
        if (StartMenu.#startMenu) {
            return StartMenu.#startMenu;
        }

        if (!(button instanceof HTMLElement)) {
            throw new TypeError("A valid start menu button is required.");
        }

        StartMenu.#startMenu = await StartMenu.#loadStartMenu();
        StartMenu.#startMenuButton = button;

        StartMenu.#startMenuButton.addEventListener("click", event => {
            event.stopPropagation();
            StartMenu.#switchStartMenuVisibility();
        });

        document.addEventListener("click", event => {
            const clickedOutsideMenu = !StartMenu.#startMenu.contains(event.target);
            const clickedOutsideButton = !StartMenu.#startMenuButton.contains(event.target);

            if (StartMenu.#startMenuVisible && clickedOutsideMenu && clickedOutsideButton) {
                StartMenu.#switchStartMenuVisibility();
            }
        });

        document.addEventListener("keydown", event => {
            if (StartMenu.#startMenuVisible && event.key === "Escape") {
                StartMenu.#switchStartMenuVisibility();
            }
        });

        return StartMenu.#startMenu;
    }

    static getInstance() {
        if (!StartMenu.#startMenuButton) {
            throw new Error("StartMenu instance not created yet.");
        }

        return StartMenu.#startMenuButton;
    }

    static async #loadStartMenuTemplate() {
        if (StartMenu.#startMenuTemplateCache) {
            return StartMenu.#startMenuTemplateCache;
        }

        const response = await fetch("./components/taskbar/startMenu/startMenu.html");
        StartMenu.#startMenuTemplateCache = await response.text();

        return StartMenu.#startMenuTemplateCache;
    }

    static async #loadStartMenu() {
        const wrapper = document.createElement("div");
        wrapper.innerHTML = await StartMenu.#loadStartMenuTemplate();

        return wrapper.firstElementChild;
    }

    static #switchStartMenuVisibility() {
        StartMenu.#startMenuVisible = !StartMenu.#startMenuVisible;
        StartMenu.#startMenu.style.display = StartMenu.#startMenuVisible ? "flex" : "none";
    }
}
