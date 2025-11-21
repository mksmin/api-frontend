import {DOMUtils} from "../utils/dom.js";

export class StatusIndicator {
  constructor(selectorOrElement) {
    this.el = DOMUtils.getById(selectorOrElement)

    if (!this.el) {
      console.error(`StatusIndicator: element not found: ${selectorOrElement}`);
      return;
    }

    this.child = this.el.querySelector('.status-indicator')
    if (!this.child) {
      console.error(".status-indicator not found")
      return;
    }

    this.collapseList = bootstrap.Collapse.getOrCreateInstance(this.el, {
      toggle: false
    })


    if (!this.el) {
      console.error(`StatusIndicator: element not found: ${selectorOrElement}`);
      return;
    }
  };

  show(
    type = 'info',
    text = this.child.textContent,
    duration = 5000,
    autoHide = true
  ) {
    if (!this.el) return;
    this.child.textContent = text;
    this.child.classList = [`status-indicator status-${type}`]

    this.collapseList.show()

    if (autoHide) {
      clearTimeout(this.el._timer);
      this.el._timer = setTimeout(() => {
        this.hide();
      }, duration);
    }
  };

  hide() {
    if (!this.el) return;
    this.collapseList.hide()
    this.el.addEventListener('hidden.bs.collapse', event => {
      this.child.classList = ['status-indicator status-info']
    })
    clearTimeout(this.el._timer);
  };

}
