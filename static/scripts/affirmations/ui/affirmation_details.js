import {DOMUtils} from "../utils/dom.js";

export class AffirmationDetail {
  constructor(telegramService) {
    this.telegramService = telegramService;
    this.selectedAffirmationId = null;
    this.selectedAffirmationElement = null;
    this.savedScrollY = 0;

    this.elements = {};

    this.init();
  };

  init() {
    this.attachEventListeners();
  };

  load_elements() {
    if (Object.keys(this.elements).length > 0) return;

    this.elements = {
      mainContainer: DOMUtils.getById('container-affirm'),
      detailContainer: DOMUtils.getById('affirmation'),
      deletePopup: DOMUtils.getById('deletePopup'),
      editPopup: DOMUtils.getById('editPopup'),
      settingsAffirmation: DOMUtils.getById('settings'),
      profileSection: DOMUtils.getById('profileSection'),
      affirmQuoteText: DOMUtils.getById('affirmQuoteText'),
      affirmationId: DOMUtils.getById('affirmationId'),
    };
  };

  attachEventListeners() {
    document.addEventListener('click', async (e) => {
      await this.handleClick(e);
    });
  };

  async handleClick(e) {
    const section = e.target.closest('.text-section.text-link');
    const closeAffirmation = e.target.closest('#closeAffirmation')
    const deleteAffirmationButton = e.target.closest('.delete-btn')
    const confirmDeleteAffirmationButton = e.target.closest('#confirmDelete')
    const cancelDeleteAffirmationButton = e.target.closest('#cancelDelete')

    if (section) {
      await this.openAffirmation(section);
      return;
    }

    if (closeAffirmation) {
      await this.closeAffirmation();
      return;
    }

    if (deleteAffirmationButton) {
      openDeletePopup();
      return;
    }

    if (confirmDeleteAffirmationButton) {
      const url = window.location.pathname;
      await confirmDeletion(url);
      return;
    }

    if (cancelDeleteAffirmationButton) {
      closeDeletePopup();
      return;
    }
    if (this.elements.deletePopup && e.target === this.elements.deletePopup) {
      closeDeletePopup();
      return;
    }
  };

  async openAffirmation(section) {
    this.load_elements();

    this.savedScrollY = DOMUtils.getScrollY();
    this.selectedAffirmationElement = section;
    this.selectedAffirmationId = section.dataset.id;

    DOMUtils.addClass(this.elements.mainContainer, 'hidden-container');
    await DOMUtils.waitForTransition(this.elements.mainContainer)

    DOMUtils.setDisplay(this.elements.detailContainer, 'block')
    DOMUtils.addClass(this.elements.mainContainer, 'd-none')
    DOMUtils.addClass(this.elements.detailContainer, 'visible');
    DOMUtils.addClass(this.elements.settingsAffirmation, 'd-none')
    DOMUtils.addClass(this.elements.profileSection, 'd-none')

    this.elements.affirmQuoteText.textContent = section.querySelector('.detail-title')?.textContent || '';
    this.elements.affirmationId.textContent = `ID: ${this.selectedAffirmationId}`;

    this.setupBackButton();
  };

  async closeAffirmation() {
    this.removeBackButton()
    DOMUtils.removeClass(this.elements.detailContainer, 'visible')
    await DOMUtils.waitForTransition(this.elements.detailContainer)

    DOMUtils.removeClass(this.elements.mainContainer, 'd-none', 'hidden-container')
    DOMUtils.setDisplay(this.elements.detailContainer, 'none')
    DOMUtils.scrollTo(0, this.savedScrollY);
    DOMUtils.removeClass(this.elements.settingsAffirmation, 'd-none')
    DOMUtils.removeClass(this.elements.profileSection, 'd-none')
  };

  setupBackButton() {
    if (this.telegramService.isAvailable()) {
      this.telegramService.showMainButton('Назад',
        () => this.closeAffirmation(),
      );
    } else {
      const backButtonDiv = DOMUtils.getById('backButton')
      const buttonBack = DOMUtils.createElement(
        'button', {
          classes: ['btn', 'btn-primary', 'btn-md'],
          attributes: {
            type: 'button',
            id: 'closeAffirmation',
            style: '--bs-btn-padding-y: .5rem;'
          },
          innerText: 'Назад',
        });

      buttonBack.onclick = () => this.closeAffirmation();
      backButtonDiv.appendChild(buttonBack);
      DOMUtils.removeClass(backButtonDiv, 'd-none')
    }
  };

  removeBackButton() {
    if (this.telegramService.isAvailable()) {
      this.telegramService.hideMainButton(
        () => this.closeAffirmation()
      );
    } else {
      const backButtonDiv = DOMUtils.getById('backButton')
      DOMUtils.addClass(backButtonDiv, 'd-none')
      DOMUtils.getById('closeAffirmation')?.remove();
    }
  };
}


