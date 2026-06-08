export class SysBoot {
    static #instance = null;

    static #context = null;
    static #element = null;
    static #firstBoot = true;
    
    /** Texts for the boot  */
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
        { type: "end" } // Sentinel for the last line
    ];

    constructor() {
        if (!SysBoot.#context) {
            throw new Error("SysBoot is a singleton class. Use SysBoot.getSysBoot() to get the instance.");
        }
    }

    static async getSysBoot(container) {
        if (this.#context) {
            return this.#instance;
        }

        const sysBootHTML = await this.#loadBootTerminalTemplate();
        const wrapper = document.createElement("div");

        wrapper.innerHTML = sysBootHTML;

        this.#element = wrapper.firstElementChild;
        container.appendChild(this.#element);

        this.#context = container;
        this.#instance = new SysBoot();

        return this.#instance;
    }

    static async #loadBootTerminalTemplate() {
        if (SysBoot.bootTermianlTemplateCache) return SysBoot.bootTermianlTemplateCache;

        const res = await fetch("./components/sysBoot/bootTerminal.html");
        const html = await res.text();

        SysBoot.bootTermianlTemplateCache = html;
        return html;
    }


    /** Function to close the system boot */
    #closeBoot(terminal) {
        if (SysBoot.#firstBoot) SysBoot.#firstBoot = false;

        terminal.classList.add("exit");

        setTimeout(() => {
            terminal.remove();
        }, 500);

        let handler = () => this.#closeBoot(terminal);

        terminal.removeEventListener("keydown", handler);
        terminal.removeEventListener("touchend", handler);
    }

    /** This function generates a promise to wait for the next line or letter. It receives the waiting time */
    #delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /** Generates a random number for the line delay */
    #lineRandomDelay(textLength) {
        const min = textLength * 1;
        const max = textLength * 2;

        return Math.floor(Math.random() * (max - min + 1)) + min
    }

    /** Add the listeners to finalize the boot */
    #addCloseListeners(terminal) {
        const handler = () => this.#closeBoot(terminal);

        terminal.addEventListener("keydown", handler, { once: true });
        terminal.addEventListener("touchend", handler, { once: true });
    }

    /** Changes the visibility of the skip and cursor */
    #changeVisibility(bootDisplay, skip) {
        skip.remove();

        bootDisplay.classList.remove("loading-started");
        bootDisplay.classList.add("loading-complete");
    }

    /** Iteration to generate the typing effect in the terminal */
    async #startTyping() {
        const bootDisplay = SysBoot.#element.querySelector("#boot");
        const skip = SysBoot.#element.querySelector("#skip");

        for (const text of SysBoot.#bootLines) {
            const line = document.createElement("p");
            line.classList.add("no-select");
            bootDisplay.appendChild(line);

            if (text === "") {
                line.innerHTML = "&nbsp;";
            }

            if (text.type === "end") {
                line.classList.add("blink");
                line.innerHTML = "< PRESS ANY KEY TO START >";

                this.#changeVisibility(bootDisplay, skip);
                this.#addCloseListeners(SysBoot.#element);

                continue;
            }

            for (const letter of text) {
                line.textContent += letter;
                await this.#delay(1);
            }

            bootDisplay.scrollTop = bootDisplay.scrollHeight;

            await this.#delay(this.#lineRandomDelay(text.length));
        }
    }

    #addBootListeners() {
        SysBoot.#element.focus();

        /** Listener to skip on ESC  */
        SysBoot.#element.addEventListener("keydown", (event) => {
            if (event.key === "Escape") {
                this.#closeBoot(SysBoot.#element);
            }
        });

        /** Skip on click or touch */
        SysBoot.#element.addEventListener("click", (e) => {
            if (e.target === skip) {
                this.#closeBoot(SysBoot.#element);
            }
        });
    }

    async startBoot() {
        SysBoot.#context.appendChild(SysBoot.#element);
        this.#addBootListeners(SysBoot.#element);
        this.#startTyping();
    }
}
