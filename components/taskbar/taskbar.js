import { loadStartMenu, setStartMenuVisibility } from "./startMenu/startMenu.js";
import { Calendar } from "./calendar/calendar.js";

let taskbarTemplateCache = null;

async function loadTaskbarTemplate() {
    if (taskbarTemplateCache) return taskbarTemplateCache;

    const res = await fetch("/components/taskbar/taskbar.html");
    const html = await res.text();

    taskbarTemplateCache = html;
    return html;
}

export async function loadTaskbar() {
    const wrapper = document.createElement("div");

    wrapper.innerHTML = await loadTaskbarTemplate();
    const taskbar = wrapper.firstElementChild;

    taskbar.appendChild(await loadStartMenu());
    const startButton = taskbar.querySelector("#taskbar-start-button");
    const calendarButton = taskbar.querySelector("#taskbar-calendar-button");


    taskbar.appendChild(await (new Calendar(calendarButton)).loadCalendar());

    document.getElementById("taskbar").appendChild(taskbar);
}

/** Adjust the time to the desired format */
function timeFormat(date) {
    let hours = date?.getHours();
    let minutes = date?.getMinutes();

    hours = hours.toString().padStart(2, "0");
    minutes = minutes.toString().padStart(2, "0");

    return hours + ":" + minutes
}

/** Updates the time regularly */
export async function updateTime(clock) {
    const dateTime = new Date();
    const formattedTime = timeFormat(dateTime);

    clock.innerText = formattedTime;

    let hadler = () => updateTime(clock);

    setTimeout(hadler, 1000);
}
