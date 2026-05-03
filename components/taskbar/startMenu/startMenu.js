let startMenuTemplateCache = null;

let startMenuVisible = false;

async function loadStartMenuTemplate() {
    if (startMenuTemplateCache) return startMenuTemplateCache;
    
    const res = await fetch("./components/taskbar/startMenu/startMenu.html");
    const html = await res.text();

    startMenuTemplateCache = html;
    return html;
}

export async function loadStartMenu() {
    const wrapper = document.createElement("div");

    wrapper.innerHTML = await loadStartMenuTemplate();
    const startMenu = wrapper.firstElementChild;

    return startMenu;
}

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
    
    // /**
    //  * Listener for the start menu access startMenuButton
    //  */
    // startMenuButton.addEventListener("click", (event) => {
    //     event.stopPropagation();
    //     switchStartMenuVisibility();
    // });
    
    // /**
    //  * Listener to close the start menu if the user clicks elsewhere on the screen
    //  */
    // document.addEventListener("click", (event) => {
    //     if (!startMenu.contains(event.target)) {
    //         if (startMenuVisible) {
    //             switchStartMenuVisibility();
    //         }
    //     }
    // });
