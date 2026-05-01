let bootTermianlTemplateCache = null;

async function loadBootTerminalTemplate() {
    if (bootTermianlTemplateCache) return bootTermianlTemplateCache;

    const res = await fetch("./components/sysBoot/bootTerminal.html");
    const html = await res.text();

    bootTermianlTemplateCache = html;
    return html;
}

/** Texts for the boot  */
const bootLines = [
"AuroraOS BIOS v1.0",
"Copyright (C) 2026 GuilhermeFdSilva",
"",
"Initializing firmware...",
"Loading legacy compatibility layer [Win98-style UI]... OK",
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
"Mounting system references...",
"design.profile ....... Windows 98 Interface Guidelines",
"creative.source ..... github.com/mewmewdevart",
"system.author ....... github.com/GuilhermeFdSilva",
"",
"Loading AuroraOS kernel...",
"Initializing core services...",
"",
"system.core ......... loaded",
"ui.manager .......... loaded",
"window.service ...... loaded",
"network.interface ... loaded",
"",
"Applying visual layer: classic.desktop ... OK",
"Injecting UI inspiration model ........... OK",
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

/** Function to close the system boot */
function startSystem (terminal) {
    terminal.classList.add("exit");

    setTimeout(() => {
        terminal.remove();
    }, 500);

    terminal.removeEventListener("keydown", startSystem);
    terminal.removeEventListener("click", startSystem);
}

/** This function generates a promise to wait for the next line or letter. It receives the waiting time */
function delay(ms){
    return new Promise(resolve => setTimeout(resolve, ms));
}

/** Generates a random number for the line delay */
function lineRandomDelay(textLength) {
    const min = textLength * 1;
    const max = textLength * 2;

    return Math.floor(Math.random() * (max - min + 1)) + min
}

/** Add the listeners to finalize the boot */
function addExitListeners(terminal) {
    const handler = () => startSystem(terminal);

    document.addEventListener("keydown", handler, { once: true });
    document.addEventListener("touchend", handler, { once: true });
}

/** Changes the visibility of the skip and cursor */
function changeVisibility(bootDisplay , skip ) {
    skip.remove();

    bootDisplay.classList.remove("loading-started");
    bootDisplay.classList.add("loading-complete");
}

/** Iteration to generate the typing effect in the terminal */
async function bootTerminalMain(terminal, bootDisplay, skip){
    for (const text of bootLines){
        const line = document.createElement("p");
        line.classList.add("no-select");
        bootDisplay.appendChild(line);

        if (text === "") {
            line.innerHTML = "&nbsp;";
        }

        if (text.type === "end") {
            line.classList.add("blink");
            line.innerHTML = "< PRESS ANY KEY TO START >";

            changeVisibility(bootDisplay, skip);
            addExitListeners(terminal);

            continue;
        }

        for (const letter of text){
            line.textContent += letter;
            await delay(1);
        }

        bootDisplay.scrollTop = bootDisplay.scrollHeight;

        await delay(lineRandomDelay(text.length));
    }
}

function addBootListeners (terminal) {
    /** Listener to skip on ESC  */
    document.addEventListener("keydown", (event) => {
        if (event.key === "Escape") {
            startSystem(terminal);
        }
    });
    
    /** Skip on click or touch */
    terminal.addEventListener("click", (e) => {
        if (e.target === skip) {
            startSystem(terminal);
        }
    });
}

export async function startBoot() {
    const html = await loadBootTerminalTemplate();

    const wrapper = document.createElement("div");
    wrapper.innerHTML = html;

    const terminal = wrapper.firstElementChild;
    const bootDisplay = terminal.querySelector("#boot");
    const skip = terminal.querySelector("#skip");

    document.body.appendChild(terminal);
    addBootListeners(terminal);
    bootTerminalMain(terminal, bootDisplay, skip);
}
