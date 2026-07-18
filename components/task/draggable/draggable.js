export class DragManager {
  #active = null;
  #container = null;
  #offsetX = 0;
  #offsetY = 0;
  #registeredElements = new Map();
  #observers = new Set();

  constructor() {
    this.#initGlobalEvents();
  }

  subscribe(observer) {
    if (typeof observer !== "function") {
      throw new TypeError("The observer must be a function.");
    }

    this.#observers.add(observer);

    return () => this.#observers.delete(observer);
  }

  notify(type, detail = {}) {
    this.#observers.forEach(observer => observer({ type, detail }));
  }

  register(element, container = element?.parentElement) {
    if (!(element instanceof HTMLElement)) return;

    const dragContainer = container instanceof HTMLElement
      ? container
      : document.documentElement;

    this.#registeredElements.set(element, dragContainer);
    element.dataset.draggableInit = "true";
  }

  unregister(element) {
    if (!(element instanceof HTMLElement)) return;

    this.#registeredElements.delete(element);
    delete element.dataset.draggableInit;

    if (this.#active === element) {
      this.#clearActiveElement();
    }
  }

  #initGlobalEvents() {
    document.addEventListener("mousedown", event => {
      if (event.button !== 0) return;

      const target = this.getDraggableFromPoint(event.clientX, event.clientY);
      if (!target || !this.#registeredElements.has(target)) return;

      const handle = event.target.closest(".drag-handle");
      const clickedButton = event.target.closest("button");

      if (!handle || !target.contains(handle) || clickedButton) return;

      this.#active = target;
      this.#container = this.#registeredElements.get(target);

      this.#prepareElementPosition(target, this.#container);

      const targetRect = target.getBoundingClientRect();
      this.#offsetX = event.clientX - targetRect.left;
      this.#offsetY = event.clientY - targetRect.top;

      this.notify("drag:start", { element: target });
      event.preventDefault();
    });

    document.addEventListener("mousemove", event => {
      if (!this.#active || !this.#container) return;

      const containerRect = this.#container.getBoundingClientRect();

      let x = event.clientX - containerRect.left - this.#offsetX;
      let y = event.clientY - containerRect.top - this.#offsetY;

      const maxX = Math.max(0, containerRect.width - this.#active.offsetWidth);
      const maxY = Math.max(0, containerRect.height - this.#active.offsetHeight);

      x = Math.max(0, Math.min(x, maxX));
      y = Math.max(0, Math.min(y, maxY));

      this.#active.style.left = `${x}px`;
      this.#active.style.top = `${y}px`;

      this.notify("drag:move", {
        element: this.#active,
        position: { x, y }
      });
    });

    document.addEventListener("mouseup", () => {
      if (!this.#active) return;

      this.notify("drag:end", { element: this.#active });
      this.#clearActiveElement();
    });
  }

  #prepareElementPosition(element, container) {
    const elementRect = element.getBoundingClientRect();
    const containerRect = container.getBoundingClientRect();

    element.style.left = `${elementRect.left - containerRect.left}px`;
    element.style.top = `${elementRect.top - containerRect.top}px`;
    element.style.transform = "none";
  }

  #clearActiveElement() {
    this.#active = null;
    this.#container = null;
    this.#offsetX = 0;
    this.#offsetY = 0;
  }

  getDraggableFromPoint(x, y) {
    const elements = document.elementsFromPoint(x, y);

    return elements.find(element =>
      element.classList?.contains("interface-draggable")
    );
  }
}
