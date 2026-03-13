const bootDisplay = document.getElementById("boot");
const terminal = document.getElementById("terminal");
const skip = document.getElementById("skip");

// Texts for the boot
const bootLines = [
"GX BIOS v1.3",
"System Vendor: Guigrid Systems",
"",
"Detecting hardware...",
"CPU  .................. OK",
"Memory ......... 8192MB",
"Graphics ....... Web Renderer",
"",
"Mounting system files...",
"Loading core modules...",
"",
"profile.sys .............. loaded",
"projects.sys  ....... loaded",
"network.sys .......... loaded",
"",
"Initializing developer environment...",
"",
"Starting graphical interface...",
"",
"GX Desktop Ready.",
"",
"",
{ type: "end" } // Sentinel for the last line
];

// Function to close the system boot
function startSystem () {
    terminal.classList.add("exit");

    setTimeout(() => {
        terminal.style.display = "none"
    }, 500);

    document.removeEventListener("keydown", startSystem);
    document.removeEventListener("click", startSystem);
}

// This function generates a promise to wait for the next line or letter. It receives the waiting time
function delay(ms){
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Generates a random number for the line delay
function lineRandomDelay(textLength) {
    console.log(textLength)
    const min = textLength * 5;
    const max = textLength * 8;

    return Math.floor(Math.random() * (max - min + 1)) + min
}

// Add the listeners to finalize the boot
function addExitListeners() {
    document.addEventListener("keydown", startSystem);
    document.addEventListener("touchend", startSystem);
}

// Changes the visibility of the skip and cursor
function changeVisibility() {
    skip.style.display = "none";

    bootDisplay.classList.remove("loading-started");
    bootDisplay.classList.add("loading-complete");
}

// Iteration to generate the typing effect in the terminal
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

        await delay(lineRandomDelay(text.length));
    }
}

// Skip listener on ESC
document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
        startSystem();
    }
});

// Skip listener on click or touch
document.addEventListener("click", (e) => {
    if (e.target === skip) {
        startSystem();
    }
});

// Initialize the Iteration
typeBoot();
