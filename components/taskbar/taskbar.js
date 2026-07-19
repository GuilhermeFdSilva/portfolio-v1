import { StartMenu } from "./startMenu/startMenu.js";
import { Calendar } from "./calendar/calendar.js";
import { Task } from "../task/task.js";

export class Taskbar {
    static #taskbar = null;
    static #taskButtons = new Map();
    static #taskObserverConfigured = false;

    constructor() {
        throw new Error("Taskbar is a static class and cannot be instantiated.");
    }

    static getTaskbar() {
        if (Taskbar.#taskbar) {
            return Taskbar.#taskbar;
        }

        Taskbar.#taskbar = Taskbar.#loadTaskbar();

        return Taskbar.#taskbar;
    }

    static async #loadTaskbarTemplate() {
        const response = await fetch("./components/taskbar/taskbar.html");
        return response.text();
    }

    static async #loadTaskbar() {
        const wrapper = document.createElement("div");
        wrapper.innerHTML = await Taskbar.#loadTaskbarTemplate();

        const taskbar = wrapper.firstElementChild;
        const clock = taskbar.querySelector("#taskbar-clock");
        const taskContainer = taskbar.querySelector("#taskbar-apps");
        const startButton = taskbar.querySelector("#taskbar-start-button");
        const calendarButton = taskbar.querySelector("#taskbar-calendar-button");

        Taskbar.#updateTime(clock);
        Taskbar.#configureTaskObserver(taskContainer);

        taskbar.appendChild(await StartMenu.configInstance(startButton));
        taskbar.appendChild(await Calendar.configureInstance(calendarButton));

        return taskbar;
    }

    static #configureTaskObserver(taskContainer) {
        if (Taskbar.#taskObserverConfigured) return;

        Taskbar.#taskObserverConfigured = true;

        Task.subscribe("task:opened", ({ task }) => {
            Taskbar.#addTaskButton(taskContainer, task);
            Taskbar.#updateActiveTask();
        });

        Task.subscribe("task:closed", ({ task }) => {
            Taskbar.#removeTaskButton(task);
            Taskbar.#updateActiveTask();
        });

        Task.subscribe("task:focused", () => Taskbar.#updateActiveTask());

        Task.getOpenTasks().forEach(task => {
            Taskbar.#addTaskButton(taskContainer, task);
        });

        Taskbar.#updateActiveTask();
    }

    static #addTaskButton(taskContainer, task) {
        if (Taskbar.#taskButtons.has(task.taskID)) return;

        const button = document.createElement("button");
        const icon = document.createElement("img");
        const taskIcon = task.taskIcon;

        button.classList.add("interface-button", "taskbar-task-button");
        button.dataset.taskId = task.taskID;
        button.title = task.taskTitle;
        button.setAttribute("aria-label", task.taskTitle || "Open task");

        icon.alt = taskIcon.alt;
        if (taskIcon.src) icon.src = taskIcon.src;

        button.appendChild(icon);
        button.addEventListener("click", () => task.focusTask());

        Taskbar.#taskButtons.set(task.taskID, button);
        taskContainer.appendChild(button);
    }

    static #removeTaskButton(task) {
        const button = Taskbar.#taskButtons.get(task.taskID);

        button?.remove();
        Taskbar.#taskButtons.delete(task.taskID);
    }

    static #updateActiveTask() {
        Task.getOpenTasks().forEach(task => {
            const button = Taskbar.#taskButtons.get(task.taskID);
            if (!button) return;

            button.classList.toggle("taskbar-task-button-active", task.taskActive);
            button.setAttribute("aria-pressed", String(task.taskActive));
        });
    }

    static #timeFormat(date) {
        const hours = String(date.getHours()).padStart(2, "0");
        const minutes = String(date.getMinutes()).padStart(2, "0");

        return `${hours}:${minutes}`;
    }

    static #updateTime(clock) {
        clock.innerText = Taskbar.#timeFormat(new Date());
        setTimeout(() => Taskbar.#updateTime(clock), 1000);
    }
}
