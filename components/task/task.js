export class Task {
    static context = null;
    static openTasks = [];

    taskID = "";
    taskActive = false
    taskFullScream = false;
    taskZIndex = 0;

    constructor(context) {
        if (Task.context) return;

        if (!context) throw new Error("The aplication colntext can't by NULL.");

        Task.context = context;
    }

    openTask(taskElement, closeElementes) {
        if (taskElement instanceof HTMLElement && closeElementes) {
            const id = Task.getTaskId();

            this.taskID = id;
            taskElement.id = id;

            Task.openTasks.push(this);

            Task.context.appendChild(taskElement);

            this.closeTask(closeElementes)
        }
    }

    static getTaskId() {
        return "task-" + Task.openTasks.length;
    }

    closeTask(closeElements = []) {
        closeElements.forEach(element => {
            element.addEventListener("click", () => {
                if (Task.context instanceof HTMLElement) {
                    Task.context.querySelector(`#${this.taskID}`).remove();
                }
            });
        });
    }
}