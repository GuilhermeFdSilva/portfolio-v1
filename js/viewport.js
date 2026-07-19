export class Viewport {
    static #resizeFrame = null;
    static #isConfigured = false;

    constructor() {
        throw new Error("Viewport is a static utility class and cannot be instantiated.");
    }

    static configure() {
        if (Viewport.#isConfigured) {
            return;
        }

        Viewport.#isConfigured = true;
        Viewport.#updateSize();

        window.addEventListener("resize", Viewport.#scheduleUpdate, { passive: true });
        window.addEventListener("orientationchange", Viewport.#scheduleUpdate, { passive: true });
        window.visualViewport?.addEventListener("resize", Viewport.#scheduleUpdate, { passive: true });
        window.visualViewport?.addEventListener("scroll", Viewport.#scheduleUpdate, { passive: true });
    }

    static #scheduleUpdate = () => {
        if (Viewport.#resizeFrame !== null) {
            cancelAnimationFrame(Viewport.#resizeFrame);
        }

        Viewport.#resizeFrame = requestAnimationFrame(() => {
            Viewport.#resizeFrame = null;
            Viewport.#updateSize();
        });
    };

    static #updateSize() {
        const visualViewport = window.visualViewport;
        const viewportHeight = visualViewport?.height ?? window.innerHeight;
        const viewportWidth = visualViewport?.width ?? window.innerWidth;
        const viewportTop = visualViewport?.offsetTop ?? 0;
        const viewportLeft = visualViewport?.offsetLeft ?? 0;

        const rootStyle = document.documentElement.style;

        rootStyle.setProperty("--viewport-height", `${Math.round(viewportHeight)}px`);
        rootStyle.setProperty("--viewport-width", `${Math.round(viewportWidth)}px`);
        rootStyle.setProperty("--viewport-top", `${Math.round(viewportTop)}px`);
        rootStyle.setProperty("--viewport-left", `${Math.round(viewportLeft)}px`);
    }
}
