export class DOMUtils {

  static getById(id) {
    return document.getElementById(id);
  };

  static query(selector) {
    return document.querySelector(selector);
  };

  static queryAll(selector) {
    return document.querySelectorAll(selector);
  };

  static addClass(element, ...classNames) {
    if (element) {
      element.classList.add(...classNames);
    }

  };

  static removeClass(element, ...classNames) {
    if (element) {
      element.classList.remove(...classNames);
    }
  };

  static toggleClass(element, className) {
    if (element) {
      element.classList.toggle(className);
    }
  }

  static hasClass(element, className) {
    return element?.classList.contains(className) ?? false;
  }

  static setDisplay(element, display) {
    if (element) {
      element.style.display = display;
    }
  }

  static createElement(tag, options = {}) {
    const element = document.createElement(tag);

    if (options.classes) {
      element.classList.add(...options.classes);
    }

    if (options.attributes) {
      Object.entries(options.attributes).forEach(([key, value]) => {
        element.setAttribute(key, value);
      });
    }

    if (options.innerHTML) {
      element.innerHTML = options.innerHTML;
    }

    if (options.innerText) {
      element.innerText = options.innerText;
    }

    if (options.dataset) {
      Object.entries(options.dataset).forEach(([key, value]) => {
        element.dataset[key] = value;
      });
    }

    return element;
  };

  static waitForTransition(element) {
    return new Promise((resolve) => {
      element.addEventListener('transitionend', resolve, {once: true});
    });
  }

  static isInViewport(element) {
    const rect = element.getBoundingClientRect();
    return rect.top < window.innerHeight && rect.bottom > 0;
  }

  static scrollTo(x, y) {
    window.scrollTo(x, y);
  }

  static getScrollY() {
    return window.pageYOffset || document.documentElement.scrollTop;
  }
}