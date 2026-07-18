import { DragManager } from "./draggable/draggable.js";

export class Task {
    static context = null;
    static openTasks = [];

    static #nextTaskId = 0;
    static #zIndex = 0;
    static #observers = new Map();
    static #dragManager = null;

    taskID = "";
    taskTitle = "";
    taskIcon = { src: "", alt: "icon" };
    taskActive = false;
    taskFullScream = false;
    taskZIndex = 0;
    taskElement = null;

    #focusHandler = null;
    #closeHandlers = [];

    constructor(context) {
        if (!Task.context) {
            if (!(context instanceof HTMLElement)) {
                throw new Error("The application context can't be NULL.");
            }

            Task.context = context;
        }

        Task.#configureDragManager();
    }

    static subscribe(eventName, observer) {
        if (typeof observer !== "function") {
            throw new TypeError("The observer must be a function.");
        }

        if (!Task.#observers.has(eventName)) {
            Task.#observers.set(eventName, new Set());
        }

        Task.#observers.get(eventName).add(observer);

        return () => Task.unsubscribe(eventName, observer);
    }

    static unsubscribe(eventName, observer) {
        Task.#observers.get(eventName)?.delete(observer);
    }

    static getOpenTasks() {
        return [...Task.openTasks];
    }

    static #notify(eventName, detail = {}) {
        Task.#observers.get(eventName)?.forEach(observer => observer(detail));
        Task.#observers.get("*")?.forEach(observer => observer({ eventName, ...detail }));
    }

    static #configureDragManager() {
        if (Task.#dragManager) return;

        Task.#dragManager = new DragManager();
        Task.#dragManager.subscribe(({ type, detail }) => {
            if (type === "drag:start") {
                Task.activateTaskByElement(detail.element);
            }
        });
    }

    openTask(taskElement, closeElements = [], config = {}) {
        if (!(taskElement instanceof HTMLElement)) return;
        if (this.taskElement) return;

        const {
            title = "",
            icon = {}
        } = config;

        this.taskID = Task.getTaskId();
        this.taskTitle = title;
        this.taskIcon = {
            src: icon.src ?? "",
            alt: icon.alt ?? "icon"
        };
        this.taskElement = taskElement;

        taskElement.id = this.taskID;
        taskElement.dataset.taskId = this.taskID;

        this.#focusHandler = () => this.focusTask();
        taskElement.addEventListener("mousedown", this.#focusHandler);

        Task.openTasks.push(this);
        Task.context.appendChild(taskElement);
        Task.#dragManager.register(taskElement, Task.context);

        this.closeTask(closeElements);
        this.focusTask();

        Task.#notify("task:opened", { task: this });
    }

    static getTaskId() {
        const id = `task-${Task.#nextTaskId}`;
        Task.#nextTaskId++;

        return id;
    }

    focusTask() {
        if (!Task.openTasks.includes(this) || !this.taskElement) return;

        Task.openTasks.forEach(task => {
            task.taskActive = false;
            task.taskElement?.removeAttribute("data-task-active");
        });

        Task.#zIndex++;

        this.taskActive = true;
        this.taskZIndex = Task.#zIndex;
        this.taskElement.style.zIndex = this.taskZIndex;
        this.taskElement.dataset.taskActive = "true";

        Task.#notify("task:focused", { task: this });
    }

    static activateTaskByElement(taskElement) {
        const task = Task.openTasks.find(item => item.taskElement === taskElement);
        task?.focusTask();
    }

    closeTask(closeElements = []) {
        closeElements
            .filter(element => element instanceof HTMLElement)
            .forEach(element => {
                const handler = () => this.removeTask();

                element.addEventListener("click", handler);
                this.#closeHandlers.push({ element, handler });
            });
    }

    removeTask() {
        const taskIndex = Task.openTasks.indexOf(this);
        if (taskIndex === -1) return;

        const wasActive = this.taskActive;

        this.#closeHandlers.forEach(({ element, handler }) => {
            element.removeEventListener("click", handler);
        });
        this.#closeHandlers = [];

        if (this.taskElement && this.#focusHandler) {
            this.taskElement.removeEventListener("mousedown", this.#focusHandler);
        }

        Task.#dragManager.unregister(this.taskElement);
        this.taskElement?.remove();
        Task.openTasks.splice(taskIndex, 1);

        this.taskActive = false;
        Task.#notify("task:closed", { task: this });

        if (wasActive && Task.openTasks.length) {
            const nextTask = [...Task.openTasks]
                .sort((taskA, taskB) => taskB.taskZIndex - taskA.taskZIndex)[0];

            nextTask.focusTask();
        }

        this.taskElement = null;
        this.#focusHandler = null;
    }
}
