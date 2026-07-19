export class DragManager {
    #activeElement = null;
    #activeContainer = null;
    #activePointerId = null;
    #captureElement = null;
    #offsetX = 0;
    #offsetY = 0;
    #registeredElements = new Map();
    #observers = new Set();

    constructor() {
        this.#initializeGlobalEvents();
    }

    subscribe(observer) {
        if (typeof observer !== "function") {
            throw new TypeError("The observer must be a function.");
        }

        this.#observers.add(observer);

        return () => this.#observers.delete(observer);
    }

    register(element, container = element?.parentElement) {
        if (!(element instanceof HTMLElement)) return;

        const dragContainer = container instanceof HTMLElement
            ? container
            : document.documentElement;

        this.#registeredElements.set(element, dragContainer);
        element.dataset.draggableInit = "true";

        requestAnimationFrame(() => {
            if (this.#registeredElements.has(element)) {
                this.#constrainElement(element, dragContainer);
            }
        });
    }

    unregister(element) {
        if (!(element instanceof HTMLElement)) return;

        this.#registeredElements.delete(element);
        delete element.dataset.draggableInit;

        if (this.#activeElement === element) {
            this.#finishDrag("drag:cancel");
        }
    }

    #initializeGlobalEvents() {
        document.addEventListener("pointerdown", event => this.#startDrag(event));
        document.addEventListener("pointermove", event => this.#moveDrag(event));
        document.addEventListener("pointerup", event => this.#endDrag(event));
        document.addEventListener("pointercancel", event => this.#cancelDrag(event));

        window.addEventListener("resize", () => {
            requestAnimationFrame(() => this.#constrainRegisteredElements());
        });
    }

    #startDrag(event) {
        if (event.button !== 0) return;

        const handle = event.target instanceof Element
            ? event.target.closest(".drag-handle")
            : null;

        if (!handle || event.target.closest("button")) return;

        const draggableElement = handle.closest(".interface-draggable");
        if (!draggableElement || !this.#registeredElements.has(draggableElement)) return;

        this.#activeElement = draggableElement;
        this.#activeContainer = this.#registeredElements.get(draggableElement);
        this.#activePointerId = event.pointerId;
        this.#captureElement = handle;

        this.#prepareElementPosition(draggableElement, this.#activeContainer);

        const elementRect = draggableElement.getBoundingClientRect();
        this.#offsetX = event.clientX - elementRect.left;
        this.#offsetY = event.clientY - elementRect.top;

        if (typeof handle.setPointerCapture === "function") {
            handle.setPointerCapture(event.pointerId);
        }

        this.#notify("drag:start", {
            element: draggableElement,
            pointerType: event.pointerType
        });

        event.preventDefault();
    }

    #moveDrag(event) {
        if (!this.#isActivePointer(event)) return;

        const containerRect = this.#activeContainer.getBoundingClientRect();
        const bounds = this.#getMovementBounds(this.#activeElement, this.#activeContainer);

        const desiredX = event.clientX - containerRect.left - this.#offsetX;
        const desiredY = event.clientY - containerRect.top - this.#offsetY;

        const x = this.#clamp(desiredX, 0, bounds.maxX);
        const y = this.#clamp(desiredY, 0, bounds.maxY);

        this.#setElementPosition(this.#activeElement, x, y);

        this.#notify("drag:move", {
            element: this.#activeElement,
            position: { x, y },
            pointerType: event.pointerType
        });

        event.preventDefault();
    }

    #endDrag(event) {
        if (!this.#isActivePointer(event)) return;

        this.#finishDrag("drag:end", event.pointerType);
    }

    #cancelDrag(event) {
        if (!this.#isActivePointer(event)) return;

        this.#finishDrag("drag:cancel", event.pointerType);
    }

    #finishDrag(eventName, pointerType = "") {
        const element = this.#activeElement;

        if (
            this.#captureElement &&
            this.#activePointerId !== null &&
            typeof this.#captureElement.hasPointerCapture === "function" &&
            this.#captureElement.hasPointerCapture(this.#activePointerId)
        ) {
            this.#captureElement.releasePointerCapture(this.#activePointerId);
        }

        if (element) {
            this.#notify(eventName, { element, pointerType });
        }

        this.#clearActiveElement();
    }

    #isActivePointer(event) {
        return Boolean(
            this.#activeElement &&
            this.#activeContainer &&
            event.pointerId === this.#activePointerId
        );
    }

    #prepareElementPosition(element, container) {
        const elementRect = element.getBoundingClientRect();
        const containerRect = container.getBoundingClientRect();
        const bounds = this.#getMovementBounds(element, container);

        const x = this.#clamp(elementRect.left - containerRect.left, 0, bounds.maxX);
        const y = this.#clamp(elementRect.top - containerRect.top, 0, bounds.maxY);

        element.style.transform = "none";
        this.#setElementPosition(element, x, y);
    }

    #constrainRegisteredElements() {
        this.#registeredElements.forEach((container, element) => {
            this.#constrainElement(element, container);
        });
    }

    #constrainElement(element, container) {
        if (!element.isConnected || !container.isConnected) return;

        this.#prepareElementPosition(element, container);
    }

    #getMovementBounds(element, container) {
        return {
            maxX: Math.max(0, container.clientWidth - element.offsetWidth),
            maxY: Math.max(0, container.clientHeight - element.offsetHeight)
        };
    }

    #setElementPosition(element, x, y) {
        element.style.left = `${x}px`;
        element.style.top = `${y}px`;
    }

    #clamp(value, minimum, maximum) {
        return Math.max(minimum, Math.min(value, maximum));
    }

    #clearActiveElement() {
        this.#activeElement = null;
        this.#activeContainer = null;
        this.#activePointerId = null;
        this.#captureElement = null;
        this.#offsetX = 0;
        this.#offsetY = 0;
    }

    #notify(type, detail = {}) {
        this.#observers.forEach(observer => observer({ type, detail }));
    }
}
