const startMenu = document.getElementById("start-menu-container");
const startMenuButton = document.getElementById("taskbar-start-button");

let startMenuVisible = false;

/**
 * Change start menu visibility
 */
function setStartMenuVisibility() {
    if (startMenuVisible) {
        startMenu.style.display = "flex";
    } else {
        startMenu.style.display = "none";
    }
}

/**
 * Updates start menu visibility
 */
function switchStartMenuVisibility() {
    startMenuVisible = !startMenuVisible;

    setStartMenuVisibility();
}

startMenuButton.addEventListener("click", (event) => {
    event.stopPropagation();
    switchStartMenuVisibility();
});

setStartMenuVisibility();
