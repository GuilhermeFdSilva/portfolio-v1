export class SysBoot {
    static #instance = null;
    static #context = null;
    static #element = null;
    static #bootTerminalTemplateCache = null;
    static #firstBoot = true;

    static #bootLines = [
        "AuroraOS BIOS v1.0",
        "Copyright (C) 2026 GuilhermeFdSilva",
        "",
        "Performing system diagnostics...",
        "",
        "CPU ................. Virtual Core OK",
        "Memory .............. 8192MB OK",
        "Display ............. Web Renderer Ready",
        "",
        "Detecting hardware devices...",
        "Keyboard ............ Connected",
        "Pointer Device ...... Connected",
        "Storage ............. Virtual Disk Mounted",
        "",
        "Loading AuroraOS kernel...",
        "Initializing core services...",
        "",
        "system.core ......... loaded",
        "ui.manager .......... loaded",
        "window.service ...... loaded",
        "network.interface ... loaded",
        "",
        "Starting Aurora Desktop Environment...",
        "",
        "User session: guest",
        "",
        "AuroraOS is starting...",
        "",
        "AuroraOS Ready.",
        "",
        "",
        { type: "end" }
    ];

    #bootStarted = false;
    #bootComplete = false;
    #closed = false;
    #keydownHandler = null;
    #pointerHandler = null;

    constructor() {
        if (!SysBoot.#context) {
            throw new Error("SysBoot is a singleton class. Use SysBoot.getSysBoot() to get the instance.");
        }
    }

    static async getSysBoot(container) {
        if (SysBoot.#instance) {
            return SysBoot.#instance;
        }

        if (!(container instanceof HTMLElement)) {
            throw new TypeError("A valid boot container is required.");
        }

        const sysBootHTML = await SysBoot.#loadBootTerminalTemplate();
        const wrapper = document.createElement("div");
        wrapper.innerHTML = sysBootHTML;

        SysBoot.#element = wrapper.firstElementChild;
        SysBoot.#context = container;
        SysBoot.#instance = new SysBoot();

        return SysBoot.#instance;
    }

    async startBoot() {
        if (this.#bootStarted || this.#closed) return;

        this.#bootStarted = true;
        SysBoot.#context.appendChild(SysBoot.#element);
        this.#addBootListeners();
        await this.#startTyping();
    }

    static async #loadBootTerminalTemplate() {
        if (SysBoot.#bootTerminalTemplateCache) {
            return SysBoot.#bootTerminalTemplateCache;
        }

        const response = await fetch("./components/sysBoot/bootTerminal.html");
        SysBoot.#bootTerminalTemplateCache = await response.text();

        return SysBoot.#bootTerminalTemplateCache;
    }

    #addBootListeners() {
        SysBoot.#element.focus();

        this.#keydownHandler = event => {
            if (event.key === "Escape" || this.#bootComplete) {
                this.#closeBoot();
            }
        };

        this.#pointerHandler = event => {
            const skipButton = event.target instanceof Element
                ? event.target.closest("#skip")
                : null;

            if (skipButton || this.#bootComplete) {
                this.#closeBoot();
            }
        };

        SysBoot.#element.addEventListener("keydown", this.#keydownHandler);
        SysBoot.#element.addEventListener("pointerup", this.#pointerHandler);
    }

    #removeBootListeners() {
        if (this.#keydownHandler) {
            SysBoot.#element.removeEventListener("keydown", this.#keydownHandler);
        }

        if (this.#pointerHandler) {
            SysBoot.#element.removeEventListener("pointerup", this.#pointerHandler);
        }

        this.#keydownHandler = null;
        this.#pointerHandler = null;
    }

    #closeBoot() {
        if (this.#closed) return;

        this.#closed = true;
        SysBoot.#firstBoot = false;
        this.#removeBootListeners();
        SysBoot.#element.classList.add("exit");

        setTimeout(() => {
            SysBoot.#element.remove();
        }, 500);
    }

    async #startTyping() {
        const bootDisplay = SysBoot.#element.querySelector("#boot");
        const skip = SysBoot.#element.querySelector("#skip");

        for (const text of SysBoot.#bootLines) {
            if (this.#closed) return;

            const line = document.createElement("p");
            line.classList.add("no-select");
            bootDisplay.appendChild(line);

            if (text === "") {
                line.innerHTML = "&nbsp;";
            }

            if (typeof text === "object" && text.type === "end") {
                line.classList.add("blink");
                line.textContent = "< PRESS ANY KEY TO START >";

                this.#bootComplete = true;
                this.#changeVisibility(bootDisplay, skip);
                continue;
            }

            for (const letter of text) {
                if (this.#closed) return;

                line.textContent += letter;
                await this.#delay(1);
            }

            bootDisplay.scrollTop = bootDisplay.scrollHeight;
            await this.#delay(this.#lineRandomDelay(text.length));
        }
    }

    #changeVisibility(bootDisplay, skip) {
        skip?.remove();
        bootDisplay.classList.remove("loading-started");
        bootDisplay.classList.add("loading-complete");
    }

    #delay(milliseconds) {
        return new Promise(resolve => setTimeout(resolve, milliseconds));
    }

    #lineRandomDelay(textLength) {
        const minimum = textLength;
        const maximum = textLength * 2;

        return Math.floor(Math.random() * (maximum - minimum + 1)) + minimum;
    }
}
