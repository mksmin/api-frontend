import {DOMUtils} from "../utils/dom.js";

export class StatusIndicator {
  /**
   * @param {string|HTMLElement} selectorOrElement - элемент или его ID
   */
  constructor(selectorOrElement) {
    this.el = DOMUtils.getById(selectorOrElement)

    if (!this.el) {
      console.error(`StatusIndicator: element not found: ${selectorOrElement}`);
      return;
    }

    this.body = this.el.querySelector(
      '.toast-body',
    );

    if (!this.body) {
      console.error("StatusIndicator: .toast-body not found")
      return;
    }

    this.toast = bootstrap.Toast.getOrCreateInstance(
      this.el,
      {
        autohide: false
      });
  };

  /**
   * Показать тост
   * @param {'success'|'info'|'warning'|'danger'} type - тип (цвет)
   * @param {string} text - текст тоста
   * @param {number} duration - время отображения в мс
   * @param {boolean} autoHide - автоматически скрывать
   */
  show(
    type = 'info',
    text = '',
    duration = 5000,
    autoHide = true
  ) {
    if (!this.el) return;

    this.body.textContent = text;
    this.el.className = `toast align-items-center text-bg-${type} border-0`;
    this.toast.show();

    if (autoHide) {
      clearTimeout(this.el._timer);
      this.el._timer = setTimeout(() => {
        this.hide();
      }, duration);
    }
  };

  hide() {
    if (!this.el) return;
    this.toast.hide();
    clearTimeout(this.el._timer);
  };

}
