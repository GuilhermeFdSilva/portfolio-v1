const bootDisplay = document.getElementById("boot");
const bootLines = [
"GX BIOS v1.3",
"System Vendor: Guigrid Systems",
"",
"Detecting hardware...",
"CPU ............ OK",
"Memory ......... 8192MB",
"Graphics ....... Web Renderer",
"",
"Mounting system files...",
"Loading core modules...",
"",
"profile.sys ......... loaded",
"projects.sys ....... loaded",
"network.sys ........ loaded",
"",
"Initializing developer environment...",
"",
"Starting graphical interface...",
"",
"GX Desktop Ready.",
"",
"",
-1
];

function startSystem () {
    const terminal = document.getElementById("terminal");

    if (terminal instanceof HTMLElement) {
        terminal.classList.add("exit");

        setTimeout(() => {
            terminal.style.display = "none"
        }, 500);
    }

    document.removeEventListener("keydown");
    document.removeEventListener("click");
}

function delay(ms){
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function typeBoot(){

    for (const text of bootLines){
        const min = 50;
        const max = 100;

        const line = document.createElement("p");
        bootDisplay.appendChild(line);

        if (text === "") {
            line.innerHTML = "&nbsp;";
        }

        if (text === -1) {
            line.classList.add("blink");
            line.innerHTML = "< PRESS ANY KEY TO START >";
            
            bootDisplay.classList.remove("loading-started");
            bootDisplay.classList.add("loading-complete");

            document.addEventListener("keydown", () => startSystem());
            document.addEventListener("click", () => startSystem());

            continue;
        }

        for (const letter of text){
            line.innerHTML += letter;
            await delay();
        }

        bootDisplay.scrollTop = bootDisplay.scrollHeight;

        await delay(Math.floor(Math.random() * (max - min + 1)) + min);
    }
}

typeBoot();
