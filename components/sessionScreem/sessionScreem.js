export class SessionScreem {
    static instance = null;

    constructor(container) {
        this.container = container;
        this.loadSessionScreemTemplate();
    }

    static async getSessionScreem(container) {
        if (this.instance) {
            return this.instance;
        }

        const sessionScreemHTML = await this.#loadSessionScreemTemplate();
        const wrapper = document.createElement("div");
        
        wrapper.innerHTML = sessionScreemHTML;

        this.instance = wrapper.firstElementChild;

        this.instance.querySelector("#session-btn-login").addEventListener("click", () => {
            this.destroy();
        });

        container.appendChild(this.instance);

        return this.instance;
    }

    static async #loadSessionScreemTemplate() {
        const res = await fetch("./components/sessionScreem/sessionScreem.html");
        const html = await res.text();

        return html;
    }

    static destroy() {
        this.instance.remove();
    }
}