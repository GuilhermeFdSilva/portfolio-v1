import { StartMenu } from "./startMenu/startMenu.js";
import { Calendar } from "./calendar/calendar.js";
import { Task } from "../task/task.js";

export class Taskbar {
    static taskbar = null;
    static #taskButtons = new Map();

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
        const taskContainer = taskbar.querySelector("#taskbar-apps");

        this.#updateTime(clock);
        this.#configureTaskObserver(taskContainer);

        const startButton = taskbar.querySelector("#taskbar-start-button");
        const calendarButton = taskbar.querySelector("#taskbar-calendar-button");

        taskbar.appendChild(await StartMenu.configInstance(startButton));
        taskbar.appendChild(await Calendar.configureInstance(calendarButton));

        return taskbar;
    }

    static #configureTaskObserver(taskContainer) {
        Task.subscribe("task:opened", ({ task }) => {
            this.#addTaskButton(taskContainer, task);
            this.#updateActiveTask();
        });

        Task.subscribe("task:closed", ({ task }) => {
            this.#removeTaskButton(task);
            this.#updateActiveTask();
        });

        Task.subscribe("task:focused", () => this.#updateActiveTask());

        Task.getOpenTasks().forEach(task => {
            this.#addTaskButton(taskContainer, task);
        });

        this.#updateActiveTask();
    }

    static #addTaskButton(taskContainer, task) {
        if (this.#taskButtons.has(task.taskID)) return;

        const button = document.createElement("button");
        const icon = document.createElement("img");

        button.classList.add("interface-button", "taskbar-task-button");
        button.dataset.taskId = task.taskID;
        button.title = task.taskTitle;
        button.setAttribute("aria-label", task.taskTitle || "Open task");

        icon.alt = task.taskIcon.alt;
        if (task.taskIcon.src) icon.src = task.taskIcon.src;

        button.appendChild(icon);
        button.addEventListener("click", () => task.focusTask());

        this.#taskButtons.set(task.taskID, button);
        taskContainer.appendChild(button);
    }

    static #removeTaskButton(task) {
        const button = this.#taskButtons.get(task.taskID);

        button?.remove();
        this.#taskButtons.delete(task.taskID);
    }

    static #updateActiveTask() {
        Task.getOpenTasks().forEach(task => {
            const button = this.#taskButtons.get(task.taskID);
            if (!button) return;

            button.classList.toggle("taskbar-task-button-active", task.taskActive);
            button.setAttribute("aria-pressed", task.taskActive.toString());
        });
    }

    /** Adjust the time to the desired format */
    static #timeFormat(date) {
        let hours = date?.getHours();
        let minutes = date?.getMinutes();

        hours = hours.toString().padStart(2, "0");
        minutes = minutes.toString().padStart(2, "0");

        return hours + ":" + minutes;
    }

    /** Updates the time regularly */
    static async #updateTime(clock) {
        const dateTime = new Date();
        const formattedTime = this.#timeFormat(dateTime);

        clock.innerText = formattedTime;

        const handler = () => this.#updateTime(clock);

        setTimeout(handler, 1000);
    }
}
