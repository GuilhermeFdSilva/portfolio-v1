const startMenu = document.getElementById("start-menu-container");
const startMenuButton = document.getElementById("taskbar-start-button");

let startMenuVisible = false;

/**
 * Change start menu visibility
 */
export function setStartMenuVisibility() {
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

/**
 * Listener for the start menu access startMenuButton
 */
startMenuButton.addEventListener("click", (event) => {
    event.stopPropagation();
    switchStartMenuVisibility();
});

/**
 * Listener to close the start menu if the user clicks elsewhere on the screen
 */
document.addEventListener("click", (event) => {
    if (!startMenu.contains(event.target)) {
        if (startMenuVisible) {
            switchStartMenuVisibility();
        }
    }
});
