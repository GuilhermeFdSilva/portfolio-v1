export class SessionScreem {
    static instance = null;
    
    static async getSessionScreem() {
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