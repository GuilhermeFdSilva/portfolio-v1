import { StartMenu } from "./startMenu/startMenu.js";
import { Calendar } from "./calendar/calendar.js";

export class Taskbar {
    static taskbar = null;

    static getTaskbar() {
        if (Taskbar.taskbar) {
            return Taskbar.taskbar;
        }

        Taskbar.taskbar = this.#loadTaskbar();

        return Taskbar.taskbar;
    }

    static async #loadTaskbarTemplate() {
        const res = await fetch("./components/taskbar/taskbar.html");
        const html = await res.text();

        return html;
    }

    static async #loadTaskbar() {
        const wrapper = document.createElement("div");

        wrapper.innerHTML = await this.#loadTaskbarTemplate();
        const taskbar = wrapper.firstElementChild;

        const clock = taskbar.querySelector("#taskbar-clock");

        this.#updateTime(clock);

        const startButton = taskbar.querySelector("#taskbar-start-button");
        const calendarButton = taskbar.querySelector("#taskbar-calendar-button");

        taskbar.appendChild(await (StartMenu.configInstance(startButton)));

        taskbar.appendChild(await (Calendar.configureInstance(calendarButton)));

        return taskbar;
    }

    /** Adjust the time to the desired format */
    static #timeFormat(date) {
        let hours = date?.getHours();
        let minutes = date?.getMinutes();

        hours = hours.toString().padStart(2, "0");
        minutes = minutes.toString().padStart(2, "0");

        return hours + ":" + minutes
    }

    /** Updates the time regularly */
    static async #updateTime(clock) {
        const dateTime = new Date();
        const formattedTime = this.#timeFormat(dateTime);

        clock.innerText = formattedTime;

        let hadler = () => this.#updateTime(clock);

        setTimeout(hadler, 1000);
    }
}