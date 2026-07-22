import { LocalStorageManager } from "../../js/storage/localStorageManager.js";

/**
 * Gerencia os atalhos exibidos na área de trabalho.
 *
 * As posições são armazenadas como índices de quadrantes, e não como pixels.
 * Isso permite que a mesma organização seja recalculada quando a quantidade
 * de colunas muda em telas menores.
 */
export class Desktop {
    static #storageKey = "desktop.shortcuts.positions";

    #container = null;
    #shortcutLayer = null;
    #shortcutConfigs = [];
    #shortcutElements = new Map();
    #positions = new Map();
    #selectedShortcutId = null;
    #dragState = null;
    #resizeObserver = null;
    #lastTouch = {
        shortcutId: null,
        timestamp: 0
    };
    #ignoreNextClick = false;
    #lastPointerType = "mouse";

    /**
     * Cria e posiciona os atalhos dentro do desktop.
     *
     * @param {HTMLElement} container Elemento principal da área de trabalho.
     * @param {object} config Configuração do desktop.
     * @param {Array<object>} config.shortcuts Atalhos que serão renderizados.
     */
    constructor(container, config = {}) {
        if (!(container instanceof HTMLElement)) {
            throw new TypeError(
                "Um elemento de desktop válido é obrigatório."
            );
        }

        this.#container = container;
        this.#shortcutConfigs = this.#normalizeShortcutConfigs(
            config.shortcuts ?? []
        );

        this.#createShortcutLayer();
        this.#restorePositions();
        this.#renderShortcuts();
        this.#configureDesktopEvents();
        this.#configureResizeObserver();
        this.#layoutShortcuts();
    }

    /**
     * Retorna uma cópia das posições atuais por identificador.
     *
     * @returns {Record<string, number>}
     */
    getShortcutPositions() {
        return Object.fromEntries(this.#positions);
    }

    /**
     * Volta os atalhos para a ordem definida na configuração inicial.
     */
    resetShortcutPositions() {
        this.#positions.clear();

        this.#shortcutConfigs.forEach((shortcut, index) => {
            this.#positions.set(shortcut.id, index);
        });

        this.#savePositions();
        this.#layoutShortcuts();
        this.clearSelection();
    }

    /**
     * Remove o destaque de seleção do atalho atual.
     */
    clearSelection() {
        if (!this.#selectedShortcutId) {
            return;
        }

        const selectedElement = this.#shortcutElements.get(
            this.#selectedShortcutId
        );

        selectedElement?.classList.remove(
            "desktop-shortcut-selected"
        );

        selectedElement?.setAttribute(
            "aria-selected",
            "false"
        );

        this.#selectedShortcutId = null;
    }

    /**
     * Valida configurações e impede identificadores duplicados.
     *
     * @param {Array<object>} shortcuts Configurações recebidas.
     * @returns {Array<object>}
     */
    #normalizeShortcutConfigs(shortcuts) {
        if (!Array.isArray(shortcuts)) {
            throw new TypeError(
                "A lista de atalhos deve ser um array."
            );
        }

        const registeredIds = new Set();

        return shortcuts.map((shortcut, index) => {
            const id = String(shortcut?.id ?? "").trim();

            if (!id) {
                throw new TypeError(
                    `O atalho da posição ${index} não possui id.`
                );
            }

            if (registeredIds.has(id)) {
                throw new Error(
                    `O identificador de atalho "${id}" está duplicado.`
                );
            }

            registeredIds.add(id);

            return {
                id,
                label: String(shortcut.label ?? id),
                iconSrc: String(shortcut.iconSrc ?? ""),
                iconAlt: String(
                    shortcut.iconAlt ??
                    shortcut.label ??
                    id
                ),
                action:
                    typeof shortcut.action === "function"
                        ? shortcut.action
                        : () => {}
            };
        });
    }

    /**
     * Cria uma camada exclusiva para os atalhos, preservando as janelas que
     * também são adicionadas diretamente ao elemento #desktop.
     */
    #createShortcutLayer() {
        const layer = document.createElement("section");

        layer.className =
            "desktop-shortcuts-layer no-select";

        layer.setAttribute(
            "aria-label",
            "Atalhos da área de trabalho"
        );

        this.#shortcutLayer = layer;
        this.#container.appendChild(layer);
    }

    /**
     * Recupera posições salvas e resolve posições inválidas ou duplicadas.
     */
    #restorePositions() {
        const storedPositions = LocalStorageManager.get(
            Desktop.#storageKey,
            {}
        );

        const occupiedSlots = new Set();

        this.#shortcutConfigs.forEach(
            (shortcut, defaultSlot) => {
                const storedSlot = Number(
                    storedPositions?.[shortcut.id]
                );

                const validStoredSlot =
                    Number.isInteger(storedSlot) &&
                    storedSlot >= 0;

                const desiredSlot = validStoredSlot
                    ? storedSlot
                    : defaultSlot;

                const availableSlot = occupiedSlots.has(
                    desiredSlot
                )
                    ? this.#findFirstAvailableSlot(
                        occupiedSlots
                    )
                    : desiredSlot;

                occupiedSlots.add(availableSlot);

                this.#positions.set(
                    shortcut.id,
                    availableSlot
                );
            }
        );

        this.#savePositions();
    }

    /**
     * Cria os elementos semânticos dos atalhos e registra seus eventos.
     */
    #renderShortcuts() {
        this.#shortcutConfigs.forEach(shortcut => {
            const button = document.createElement("button");
            const icon = document.createElement("img");
            const label = document.createElement("span");

            button.type = "button";
            button.className = "desktop-shortcut";
            button.dataset.shortcutId = shortcut.id;

            button.setAttribute(
                "aria-label",
                `Abrir ${shortcut.label}`
            );

            button.setAttribute(
                "aria-selected",
                "false"
            );

            icon.className = "desktop-shortcut-icon";
            icon.src = shortcut.iconSrc;
            icon.alt = shortcut.iconAlt;
            icon.draggable = false;

            label.className = "desktop-shortcut-label";
            label.textContent = shortcut.label;

            button.append(icon, label);

            this.#configureShortcutEvents(
                button,
                shortcut
            );

            this.#shortcutElements.set(
                shortcut.id,
                button
            );

            this.#shortcutLayer.appendChild(button);
        });
    }

    /**
     * Registra seleção, abertura e movimentação por ponteiro.
     *
     * @param {HTMLButtonElement} button Elemento do atalho.
     * @param {object} shortcut Configuração correspondente.
     */
    #configureShortcutEvents(button, shortcut) {
        button.addEventListener(
            "pointerdown",
            event => {
                this.#startShortcutDrag(
                    event,
                    shortcut.id
                );
            }
        );

        button.addEventListener(
            "pointermove",
            event => {
                this.#moveShortcut(event);
            }
        );

        button.addEventListener(
            "pointerup",
            event => {
                this.#finishShortcutInteraction(
                    event,
                    shortcut
                );
            }
        );

        button.addEventListener(
            "pointercancel",
            () => {
                this.#cancelShortcutDrag();
            }
        );

        button.addEventListener(
            "click",
            event => {
                if (this.#ignoreNextClick) {
                    event.preventDefault();
                    this.#ignoreNextClick = false;

                    return;
                }

                this.#selectShortcut(shortcut.id);
            }
        );

        button.addEventListener(
            "dblclick",
            event => {
                event.preventDefault();

                if (this.#lastPointerType !== "touch") {
                    shortcut.action();
                }
            }
        );

        button.addEventListener(
            "keydown",
            event => {
                this.#handleShortcutKeydown(
                    event,
                    shortcut
                );
            }
        );
    }

    /**
     * Limpa a seleção quando o usuário interage com uma área vazia ou janela.
     */
    #configureDesktopEvents() {
        this.#container.addEventListener(
            "pointerdown",
            event => {
                const clickedShortcut =
                    event.target instanceof Element
                        ? event.target.closest(
                            ".desktop-shortcut"
                        )
                        : null;

                if (!clickedShortcut) {
                    this.clearSelection();
                }
            }
        );
    }

    /**
     * Recalcula a grade sempre que o tamanho útil do desktop mudar.
     */
    #configureResizeObserver() {
        this.#resizeObserver = new ResizeObserver(
            () => {
                requestAnimationFrame(
                    () => this.#layoutShortcuts()
                );
            }
        );

        this.#resizeObserver.observe(
            this.#container
        );
    }

    /**
     * Inicia uma possível movimentação do atalho.
     *
     * @param {PointerEvent} event Evento do ponteiro.
     * @param {string} shortcutId Identificador do atalho.
     */
    #startShortcutDrag(event, shortcutId) {
        if (event.button !== 0) {
            return;
        }

        const element =
            this.#shortcutElements.get(shortcutId);

        if (!element) {
            return;
        }

        this.#selectShortcut(shortcutId);

        this.#lastPointerType =
            event.pointerType || "mouse";

        const elementRect =
            element.getBoundingClientRect();

        this.#dragState = {
            shortcutId,
            element,
            pointerId: event.pointerId,
            pointerType: event.pointerType,
            startX: event.clientX,
            startY: event.clientY,
            offsetX:
                event.clientX - elementRect.left,
            offsetY:
                event.clientY - elementRect.top,
            originalSlot:
                this.#positions.get(shortcutId),
            moved: false
        };

        element.setPointerCapture?.(
            event.pointerId
        );
    }

    /**
     * Move visualmente o atalho antes de encaixá-lo no quadrante final.
     *
     * @param {PointerEvent} event Evento do ponteiro.
     */
    #moveShortcut(event) {
        const state = this.#dragState;

        if (
            !state ||
            state.pointerId !== event.pointerId
        ) {
            return;
        }

        const movement = Math.hypot(
            event.clientX - state.startX,
            event.clientY - state.startY
        );

        if (!state.moved && movement < 7) {
            return;
        }

        state.moved = true;
        event.preventDefault();

        const layerRect =
            this.#shortcutLayer.getBoundingClientRect();

        const metrics = this.#getGridMetrics();

        const maximumX = Math.max(
            0,
            layerRect.width - metrics.cellWidth
        );

        const maximumY = Math.max(
            0,
            layerRect.height - metrics.cellHeight
        );

        const x = this.#clamp(
            event.clientX -
                layerRect.left -
                state.offsetX,
            0,
            maximumX
        );

        const y = this.#clamp(
            event.clientY -
                layerRect.top -
                state.offsetY,
            0,
            maximumY
        );

        state.element.classList.add(
            "desktop-shortcut-dragging"
        );

        state.element.style.left = `${x}px`;
        state.element.style.top = `${y}px`;
    }

    /**
     * Decide entre clique, segundo toque mobile ou conclusão do arraste.
     *
     * @param {PointerEvent} event Evento do ponteiro.
     * @param {object} shortcut Configuração do atalho.
     */
    #finishShortcutInteraction(event, shortcut) {
        const state = this.#dragState;

        if (
            !state ||
            state.pointerId !== event.pointerId
        ) {
            return;
        }

        state.element.releasePointerCapture?.(
            event.pointerId
        );

        if (state.moved) {
            this.#dropShortcut(event, state);

            this.#ignoreNextClick = true;

            setTimeout(() => {
                this.#ignoreNextClick = false;
            }, 0);

            return;
        }

        if (state.pointerType === "touch") {
            this.#handleTouchActivation(shortcut);
        }

        this.#dragState = null;
    }

    /**
     * Encaixa o atalho no quadrante mais próximo e troca de lugar com o item
     * que já estiver ocupando o destino.
     *
     * @param {PointerEvent} event Evento final do ponteiro.
     * @param {object} state Estado do arraste.
     */
    #dropShortcut(event, state) {
        const targetSlot = this.#getClosestSlot(
            event.clientX,
            event.clientY
        );

        const occupiedShortcutId =
            this.#findShortcutAtSlot(
                targetSlot,
                state.shortcutId
            );

        if (occupiedShortcutId) {
            this.#positions.set(
                occupiedShortcutId,
                state.originalSlot
            );
        }

        this.#positions.set(
            state.shortcutId,
            targetSlot
        );

        state.element.classList.remove(
            "desktop-shortcut-dragging"
        );

        /*
         * O estado precisa ser removido antes do layout.
         *
         * Enquanto #dragState aponta para o elemento,
         * #layoutShortcuts() ignora esse atalho por
         * considerar que ele ainda está sendo arrastado.
         */
        this.#dragState = null;

        this.#savePositions();
        this.#layoutShortcuts();
    }

    /**
     * Cancela a movimentação e devolve o atalho ao quadrante anterior.
     */
    #cancelShortcutDrag() {
        if (!this.#dragState) {
            return;
        }

        this.#dragState.element.classList.remove(
            "desktop-shortcut-dragging"
        );

        this.#dragState = null;
        this.#layoutShortcuts();
    }

    /**
     * Em telas touch, o primeiro toque seleciona e o segundo abre o atalho.
     *
     * @param {object} shortcut Configuração do atalho.
     */
    #handleTouchActivation(shortcut) {
        const now = Date.now();

        const isSecondTap =
            this.#lastTouch.shortcutId ===
                shortcut.id &&
            now - this.#lastTouch.timestamp <= 550;

        if (isSecondTap) {
            shortcut.action();

            this.#lastTouch = {
                shortcutId: null,
                timestamp: 0
            };

            return;
        }

        this.#lastTouch = {
            shortcutId: shortcut.id,
            timestamp: now
        };
    }

    /**
     * Permite abrir o atalho usando a tecla Enter.
     *
     * @param {KeyboardEvent} event Evento de teclado.
     * @param {object} shortcut Configuração do atalho.
     */
    #handleShortcutKeydown(event, shortcut) {
        if (event.key !== "Enter") {
            return;
        }

        event.preventDefault();
        shortcut.action();
    }

    /**
     * Aplica destaque visual e estado acessível ao atalho selecionado.
     *
     * @param {string} shortcutId Identificador selecionado.
     */
    #selectShortcut(shortcutId) {
        if (
            this.#selectedShortcutId === shortcutId
        ) {
            return;
        }

        this.clearSelection();

        const shortcutElement =
            this.#shortcutElements.get(shortcutId);

        if (!shortcutElement) {
            return;
        }

        shortcutElement.classList.add(
            "desktop-shortcut-selected"
        );

        shortcutElement.setAttribute(
            "aria-selected",
            "true"
        );

        this.#selectedShortcutId = shortcutId;
    }

    /**
     * Posiciona cada atalho de acordo com seu índice de quadrante.
     */
    #layoutShortcuts() {
        if (!this.#shortcutLayer) {
            return;
        }

        const metrics = this.#getGridMetrics();

        this.#positions.forEach(
            (slot, shortcutId) => {
                const shortcutElement =
                    this.#shortcutElements.get(
                        shortcutId
                    );

                if (
                    !shortcutElement ||
                    shortcutElement ===
                        this.#dragState?.element
                ) {
                    return;
                }

                const safeSlot = this.#clamp(
                    slot,
                    0,
                    metrics.totalSlots - 1
                );

                const column =
                    safeSlot % metrics.columns;

                const row = Math.floor(
                    safeSlot / metrics.columns
                );

                const left =
                    metrics.paddingX +
                    column * metrics.cellWidth;

                const top =
                    metrics.paddingY +
                    row * metrics.cellHeight;

                shortcutElement.dataset.desktopSlot =
                    String(slot);

                shortcutElement.style.left =
                    `${left}px`;

                shortcutElement.style.top =
                    `${top}px`;
            }
        );
    }

    /**
     * Calcula dimensões da grade a partir das variáveis CSS responsivas.
     *
     * @returns {{
     * cellWidth: number,
     * cellHeight: number,
     * paddingX: number,
     * paddingY: number,
     * columns: number,
     * rows: number,
     * totalSlots: number
     * }}
     */
    #getGridMetrics() {
        const styles = getComputedStyle(
            this.#container
        );

        const cellWidth = this.#readCssNumber(
            styles,
            "--desktop-grid-cell-width",
            104
        );

        const cellHeight = this.#readCssNumber(
            styles,
            "--desktop-grid-cell-height",
            104
        );

        const paddingX = this.#readCssNumber(
            styles,
            "--desktop-grid-padding-x",
            12
        );

        const paddingY = this.#readCssNumber(
            styles,
            "--desktop-grid-padding-y",
            12
        );

        const availableWidth = Math.max(
            1,
            this.#container.clientWidth -
                paddingX * 2
        );

        const availableHeight = Math.max(
            1,
            this.#container.clientHeight -
                paddingY * 2
        );

        const columns = Math.max(
            1,
            Math.floor(
                availableWidth / cellWidth
            )
        );

        const rows = Math.max(
            1,
            Math.floor(
                availableHeight / cellHeight
            )
        );

        return {
            cellWidth,
            cellHeight,
            paddingX,
            paddingY,
            columns,
            rows,
            totalSlots: columns * rows
        };
    }

    /**
     * Converte a coordenada do ponteiro no quadrante mais próximo.
     *
     * @param {number} clientX Coordenada horizontal da viewport.
     * @param {number} clientY Coordenada vertical da viewport.
     * @returns {number}
     */
    #getClosestSlot(clientX, clientY) {
        const layerRect =
            this.#shortcutLayer.getBoundingClientRect();

        const metrics = this.#getGridMetrics();

        const localX =
            clientX -
            layerRect.left -
            metrics.paddingX;

        const localY =
            clientY -
            layerRect.top -
            metrics.paddingY;

        const column = this.#clamp(
            Math.floor(
                localX / metrics.cellWidth
            ),
            0,
            metrics.columns - 1
        );

        const row = this.#clamp(
            Math.floor(
                localY / metrics.cellHeight
            ),
            0,
            metrics.rows - 1
        );

        return (
            row * metrics.columns +
            column
        );
    }

    /**
     * Localiza quem ocupa um quadrante específico.
     *
     * @param {number} slot Quadrante consultado.
     * @param {string|null} excludedId Atalho ignorado na busca.
     * @returns {string|null}
     */
    #findShortcutAtSlot(
        slot,
        excludedId = null
    ) {
        for (
            const [
                shortcutId,
                shortcutSlot
            ] of this.#positions
        ) {
            if (
                shortcutId !== excludedId &&
                shortcutSlot === slot
            ) {
                return shortcutId;
            }
        }

        return null;
    }

    /**
     * Encontra o primeiro quadrante livre.
     *
     * @param {Set<number>} occupiedSlots Quadrantes ocupados.
     * @returns {number}
     */
    #findFirstAvailableSlot(
        occupiedSlots
    ) {
        let slot = 0;

        while (occupiedSlots.has(slot)) {
            slot++;
        }

        return slot;
    }

    /**
     * Persiste todas as posições em um único objeto JSON.
     */
    #savePositions() {
        LocalStorageManager.save(
            Desktop.#storageKey,
            Object.fromEntries(
                this.#positions
            )
        );
    }

    /**
     * Lê uma variável CSS numérica e aplica um fallback seguro.
     *
     * @param {CSSStyleDeclaration} styles Estilos computados.
     * @param {string} propertyName Nome da variável CSS.
     * @param {number} fallback Valor alternativo.
     * @returns {number}
     */
    #readCssNumber(
        styles,
        propertyName,
        fallback
    ) {
        const value = Number.parseFloat(
            styles.getPropertyValue(
                propertyName
            )
        );

        return Number.isFinite(value) &&
            value > 0
            ? value
            : fallback;
    }

    /**
     * Limita um número ao intervalo informado.
     *
     * @param {number} value Valor recebido.
     * @param {number} minimum Limite mínimo.
     * @param {number} maximum Limite máximo.
     * @returns {number}
     */
    #clamp(value, minimum, maximum) {
        return Math.max(
            minimum,
            Math.min(value, maximum)
        );
    }
}