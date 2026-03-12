const bootDisplay = document.getElementById("boot");
const terminal = document.getElementById("terminal");
const skip = document.getElementById("skip");

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
{ type: "end" }
];

function startSystem () {
    terminal.classList.add("exit");

    setTimeout(() => {
        terminal.style.display = "none"
    }, 500);

    document.removeEventListener("keydown", startSystem);
    document.removeEventListener("click", startSystem);
}

function delay(ms){
    return new Promise(resolve => setTimeout(resolve, ms));
}

function lineRandomDelay() {
    const min = 50;
    const max = 150;

    return Math.floor(Math.random() * (max - min + 1)) + min
}

function addExitListeners() {
    document.addEventListener("keydown", startSystem);
    document.addEventListener("touchend", startSystem);
}

function changeVisibility() {
    skip.style.display = "none";

    bootDisplay.classList.remove("loading-started");
    bootDisplay.classList.add("loading-complete");
}

async function typeBoot(){
    for (const text of bootLines){
        const line = document.createElement("p");
        bootDisplay.appendChild(line);

        if (text === "") {
            line.innerHTML = "&nbsp;";
        }

        if (text.type === "end") {
            line.classList.add("blink");
            line.innerHTML = "< PRESS ANY KEY TO START >";

            changeVisibility();
            addExitListeners();

            continue;
        }

        for (const letter of text){
            line.textContent += letter;
            await delay(1);
        }

        bootDisplay.scrollTop = bootDisplay.scrollHeight;

        await delay(lineRandomDelay());
    }
}

document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
        startSystem();
    }
});

document.addEventListener("click", (e) => {
    if (e.target === skip) {
        startSystem();
    }
});

typeBoot();
