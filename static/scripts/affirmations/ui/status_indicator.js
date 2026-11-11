import {Toast} from "bootstrap";
import {DOMUtils} from "../utils/dom.js";

const statusColors = ['primary', 'success', 'info', 'warning', 'danger'];

export class StatusIndicator {
  /**
   * @param {string} IDOfElement - ID элемента
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

    this.toast = Toast.getOrCreateInstance(
      this.el,
      {
        autohide: false
      });
  };

  /**
   * Показать тост
   * @param {'primary'|'success'|'info'|'warning'|'danger'|'error'} type - тип (цвет)
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
    if (!this.toast) return;

    const color = type === 'error' ? 'danger' : type;
    this.body.textContent = text;
    for (const previousColor of statusColors) {
      this.el.classList.remove(`text-bg-${previousColor}`, `bg-${previousColor}`, `fg-contrast-${previousColor}`);
    }
    this.el.classList.add(`text-bg-${color}`, `bg-${color}`, `fg-contrast-${color}`);
    this.toast.show();

    clearTimeout(this.el._timer);
    if (autoHide) {
      this.el._timer = setTimeout(() => {
        this.hide();
      }, duration);
    }
  };

  hide() {
    if (!this.toast) return;
    this.toast.hide();
    clearTimeout(this.el._timer);
  };

}
