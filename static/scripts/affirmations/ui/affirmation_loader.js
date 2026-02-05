import {DOMUtils} from "../utils/dom.js";
import {ApiService} from "../services/api.js";
import {CONFIG} from "../config/constants.js";
import {escapeHtml, sleep, debounce} from '../utils/helpers.js';

export class AffirmationLoader {
  constructor() {
    this.offset = 0;
    this.loading = false;
    this.autoLoading = false;
    this.allLoaded = false;
    this.loadedIds = new Set();
    this.observer = null;
    this.msnry = null;

    this.buttonLoad = DOMUtils.getById('loadAffirmationsBtn');
    this.container = DOMUtils.getById('affirm-container');
    this.endButton = DOMUtils.getById('endAffirmationsBtn');

    this.init();
  }

  init() {
    if (!this.container) {
      console.warn('⚠️ Affirmation container not found')
      return;
    }
    this.initializeExistingItems();
    this.initMasonry();
    this.setupObserver();
    this.attachEventListeners();
    this.initialLoad();

    document.addEventListener(
      'masonry:relayout',
      () => {
        this.msnry?.layout();
      });
  }

  initMasonry() {
    const grid = document.querySelector('.row.g-3');
    if (!grid || !window.Masonry) return;

    this.msnry = new Masonry(grid, {
      itemSelector: '.col-12.col-md-6',
      percentPosition: true,
      transitionDuration: '.2s',
    });

    window.addEventListener('load', () => {
      this.msnry.layout();
    });

    window.addEventListener(
      'resize',
      debounce(() => this.msnry?.layout(), 150)
    );
  };

  initializeExistingItems() {
    const existing = DOMUtils.queryAll('#affirm-container .col-12[data-id]')

    existing.forEach((el) => {
      if (el.dataset.id) {
        this.loadedIds.add(el.dataset.id)
      }
    });
    this.offset = this.loadedIds.size;
  };

  setupObserver() {
    if (!this.buttonLoad) {
      console.warn('⚠️ Load button not found');
      return;
    }
    this.observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            this.autoLoadWhileVisible();
          }
        });
      },
      {
        root: null,
        rootMargin: '0px 0px 200px 0px',
        threshold: 0.01,
      });
    this.observer.observe(this.buttonLoad);
  };

  attachEventListeners() {
    if (!this.buttonLoad) return;
    this.buttonLoad.addEventListener('click', async () => {
      const currentMargin = parseInt(window.getComputedStyle(this.buttonLoad).marginTop) || 0;
      this.buttonLoad.style.marginTop = `${currentMargin + 20}px`;
      await this.loadBatch();
    });

    const debouncedAutoLoad = debounce(() => {
      if (DOMUtils.isInViewport(this.buttonLoad)) {
        this.autoLoadWhileVisible();
      }
    }, 100);

    window.addEventListener('scroll', debouncedAutoLoad, {passive: true});
    window.addEventListener('resize', debouncedAutoLoad);
  };

  initialLoad() {
    if (this.buttonLoad && DOMUtils.isInViewport(this.buttonLoad)) {
      this.autoLoadWhileVisible();
    }
  };

  async loadBatch() {
    if (this.loading || this.allLoaded) return false;

    this.loading = true;
    this.setButtonState('loading');

    try {
      const response = await ApiService.loadAffirmations(
        CONFIG.PAGINATION.LIMIT,
        this.offset
      );

      const data = await response.json();
      if (!Array.isArray(data.affirmations) || data.affirmations.length === 0) {
        this.markAllLoaded();
        return false;
      }

      this.renderAffirmations(data.affirmations);
      this.offset += data.affirmations.length;
      this.setButtonState('ready');
      return true;

    } catch (error) {
      console.error('Load error:', error);
      this.setButtonState('ready');
      return false;
    } finally {
      await sleep(100);
      this.loading = false;
    }
  };

  async autoLoadWhileVisible() {
    if (this.autoLoading || this.allLoaded || !this.buttonLoad) return;

    this.autoLoading = true;

    try {
      while (!this.allLoaded && DOMUtils.isInViewport(this.buttonLoad)) {
        const success = await this.loadBatch();
        if (!success) break;
        await sleep(100);
      }
    } finally {
      this.autoLoading = false;
    }
  };

  renderAffirmations(affirmations) {
    const newElements = [];

    affirmations.forEach((affirmation, index) => {
      const id = affirmation.id?.toString();

      if (id && this.loadedIds.has(id)) return;
      if (id) this.loadedIds.add(id);

      const element = this.createAffirmationElement(affirmation);
      this.container.appendChild(element);
      newElements.push(element)

      setTimeout(() => {
        requestAnimationFrame(() => {
          element.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
          element.style.opacity = '1';
          element.style.transform = 'translateY(0)';
        });
      }, index * CONFIG.ANIMATION.CASCADE_DELAY);
    });

    if (this.msnry && newElements.length) {
      this.msnry.appended(newElements);
      this.msnry.layout();
    }

  };

  createAffirmationElement(affirmation) {
    const element = DOMUtils.createElement(
      'div',
      {
        classes: ['col-12', 'col-md-6', 'my-1'],
        dataset: {
          id: affirmation.id?.toString(),
          ui: 'affirmation-item',
        },
        style: {
          cursor: 'pointer',
        },
        innerHTML: `
        <div
                class="item d-flex w-100 p-3 my-0
                border rounded-4 text-decoration-none align-items-center"
        >
          <div class="flex-grow-1">
            <div>
              <p class="mb-0 affirm-title" data-item-text>${escapeHtml(affirmation.text_task || '')}</p>
            </div>
            <div class="d-flex gap-2">
              <p class="mb-0 opacity-75 small"></p>
              <small class="opacity-50 text-nowrap"></small>
            </div>
          </div>

          <i class="bi bi-caret-right-fill ms-3 flex-shrink-0"></i>
        </div>
      `,
      });

    element.style.opacity = '0';
    element.style.transform = 'translateY(10px)';

    return element
  };

  setButtonState(state) {
    if (!this.buttonLoad) return;
    if (state === 'loading') {
      DOMUtils.addClass(this.buttonLoad, 'disabled');
      DOMUtils.removeClass(this.buttonLoad, 'btn-primary')
      DOMUtils.addClass(this.buttonLoad, 'btn-outline-primary');
      this.buttonLoad.textContent = 'Загружаю...';
    } else {
      DOMUtils.removeClass(this.buttonLoad, 'disabled');
      DOMUtils.removeClass(this.buttonLoad, 'btn-outline-primary')
      DOMUtils.addClass(this.buttonLoad, 'btn-primary')
      this.buttonLoad.textContent = 'Загрузить аффирмации';
    }
  };

  markAllLoaded() {
    this.allLoaded = true;
    if (this.buttonLoad) {
      DOMUtils.addClass(this.buttonLoad, 'disabled', 'd-none');
    }

    if (this.endButton) {
      DOMUtils.removeClass(this.endButton, 'd-none');
    }
  };

  destroy() {
    if (this.observer) {
      this.observer.disconnect();
    }
  };

}