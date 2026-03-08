import { DOMUtils } from "../utils/dom.js";
import { CONFIG } from "../config/constants.js";

export class SortManager {
  constructor() {
    this.sortAlphaBtn = DOMUtils.getById('sort-alphabet');
    this.sortDateBtn = DOMUtils.getById('sort-date');

    if (!this.sortAlphaBtn || !this.sortDateBtn) {
      return;
    }

    this.sortBy = localStorage.getItem(CONFIG.STORAGE_KEYS.SORT_BY) || CONFIG.PAGINATION.SORT_BY;
    this.order = localStorage.getItem(CONFIG.STORAGE_KEYS.SORT_ORDER) || CONFIG.PAGINATION.ORDER;

    window.SortManagerInstance = this;

    this.init();
  }

  init() {
    this.updateUI(this.sortBy, this.order);
    this.attachEventListeners();
    this.initialSync();
  }

  initialSync() {
    // If saved settings differ from server default (created_at asc), trigger reload
    if (localStorage.getItem(CONFIG.STORAGE_KEYS.SORT_BY) || localStorage.getItem(CONFIG.STORAGE_KEYS.SORT_ORDER)) {
      if (this.sortBy !== 'created_at' || this.order !== 'asc') {
        setTimeout(() => {
          this.dispatchSort(this.sortBy, this.order, true);
        }, 100);
      }
    }
  }

  attachEventListeners() {
    this.sortAlphaBtn.addEventListener('click', () => {
      let order = 'asc';
      if (DOMUtils.hasClass(this.sortAlphaBtn, 'active')) {
        const icon = this.sortAlphaBtn.querySelector('i');
        const isDown = DOMUtils.hasClass(icon, 'bi-sort-alpha-down');
        order = isDown ? 'desc' : 'asc';
      }
      this.handleSortChange('text', order);
    });

    this.sortDateBtn.addEventListener('click', () => {
      let order = 'desc';
      if (DOMUtils.hasClass(this.sortDateBtn, 'active')) {
        const icon = this.sortDateBtn.querySelector('i');
        const isDown = DOMUtils.hasClass(icon, 'bi-sort-numeric-down');
        order = isDown ? 'asc' : 'desc';
      }
      this.handleSortChange('created_at', order);
    });
  }

  handleSortChange(sortBy, order) {
    this.sortBy = sortBy;
    this.order = order;
    this.updateUI(sortBy, order);
    this.dispatchSort(sortBy, order);
  }

  dispatchSort(sortBy, order, silent = false) {
    localStorage.setItem(CONFIG.STORAGE_KEYS.SORT_BY, sortBy);
    localStorage.setItem(CONFIG.STORAGE_KEYS.SORT_ORDER, order);
    document.dispatchEvent(new CustomEvent('affirmation:sort', {
      detail: { sortBy, order, silent }
    }));
  }

  updateUI(sortBy, order) {
    if (sortBy === 'text') {
      DOMUtils.addClass(this.sortAlphaBtn, 'active');
      DOMUtils.removeClass(this.sortDateBtn, 'active');
      
      const icon = this.sortAlphaBtn.querySelector('i');
      const span = this.sortAlphaBtn.querySelector('span');
      if (order === 'asc') {
        icon.className = 'bi bi-sort-alpha-down';
        span.textContent = 'АБВ';
      } else {
        icon.className = 'bi bi-sort-alpha-up-alt';
        span.textContent = 'ВБА';
      }
    } else {
      DOMUtils.addClass(this.sortDateBtn, 'active');
      DOMUtils.removeClass(this.sortAlphaBtn, 'active');
      
      const icon = this.sortDateBtn.querySelector('i');
      const span = this.sortDateBtn.querySelector('span');
      if (order === 'desc') {
        icon.className = 'bi bi-sort-numeric-down';
        span.textContent = 'Сначала новые';
      } else {
        icon.className = 'bi bi-sort-numeric-up-alt';
        span.textContent = 'Сначала старые';
      }
    }
  }
}