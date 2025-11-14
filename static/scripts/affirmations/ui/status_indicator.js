import { DOMUtils } from "../utils/dom.js";

export class StatusIndicator {
    constructor(selectorOrElement) {
        this.el = typeof selectorOrElement === "string" ? DOMUtils.query(selectorOrElement) : selectorOrElement;
        if (!this.el) {
            console.error(`StatusIndicator: element not found: ${selectorOrElement}`);
            return;
        };
    };

    show(type, text, duration = 5000) {
        if (!this.el) return;

        this.el.className = "status-indicator";
        this.el.textContent = text;

        DOMUtils.addClass(this.el, `status-${type}`);
        DOMUtils.removeClass(this.el, "d-none")

        this.el.style.opacity = 1;
        if (this.el.parentElement) {
            this.el.parentElement.style.opacity = 1;
        };
        this.el.style.transform = "scaleY(1)";

        clearTimeout(this.el._timer)

        this.el._timer = setTimeout(() => {
            DOMUtils.addClass(this.el, "d-none");
        }, duration);

    };
};
