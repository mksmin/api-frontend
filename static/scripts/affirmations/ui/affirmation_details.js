import {DOMUtils} from "../utils/dom.js";
import {ApiService} from "../services/api.js";
import {GeneralModalManager} from "./general_modal.js";
import {StatusIndicator} from "./status_indicator.js";

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
    this.generalModal = new GeneralModalManager();
    this.status = new StatusIndicator('statusBlockGeneralDiv')
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
    const deleteAffirmationButton = e.target.closest('#delete-btn')
    const editAffirmationButton = e.target.closest('#edit-btn')
    const cancelEditAffirmationButton = e.target.closest('#cancelEdit')

    if (section) {
      await this.openAffirmation(section);
      return;
    }

    if (closeAffirmation) {
      await this.closeAffirmation();
      return;
    }

    if (deleteAffirmationButton) {
      this.openDeletePopup();
      return;
    }

    if (editAffirmationButton) {
      this.openEditAffirmForm();
      return;
    }

    if (cancelEditAffirmationButton) {
      this.closeEditAffirmForm();
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

    this.closeEditAffirmForm();

  };

  openEditAffirmForm() {
    const affirmDetail = DOMUtils.getById('affirmDetail');
    const editAffirmForm = DOMUtils.getById('editAffirmForm');
    const textarea = DOMUtils.getById('editAffirmArea');
    const validationMsg = DOMUtils.getById('validationClientEditForm');
    const confirmBtn = DOMUtils.getById('confirmEdit');

    textarea.value = this.elements.affirmQuoteText.textContent.trim();

    validationMsg.textContent = `${textarea.value.length}/500 символов`;
    confirmBtn.disabled = textarea.value.trim().length === 0;

    textarea.oninput = () => {
      const len = textarea.value.length;

      validationMsg.textContent = `${len}/500 символов`;

      if (len === 0 || len > 500) {
        textarea.classList.add('is-invalid');
        confirmBtn.disabled = true;
        validationMsg.classList.add('invalid-feedback')
      } else {
        textarea.classList.remove('is-invalid')
        confirmBtn.disabled = false;
        validationMsg.classList.remove('invalid-feedback')
      }

    }
    DOMUtils.addClass(affirmDetail, 'd-none')
    DOMUtils.removeClass(editAffirmForm, 'd-none')

    DOMUtils.getById('confirmEdit').onclick = () => this.confirmEdit(this.selectedAffirmationId, textarea.value.trim());


  }

  closeEditAffirmForm() {
    const affirmDetail = DOMUtils.getById('affirmDetail');
    const editAffirmForm = DOMUtils.getById('editAffirmForm');
    const validationMsg = DOMUtils.getById('validationClientEditForm');
    const textarea = DOMUtils.getById('editAffirmArea');

    DOMUtils.addClass(editAffirmForm, 'd-none')
    DOMUtils.removeClass(affirmDetail, 'd-none')
    validationMsg.classList.remove('invalid-feedback')
    textarea.classList.remove('is-invalid')
    DOMUtils.getById('confirmEdit').onclick = null;

  }

  setupBackButton() {
    if (this.telegramService.isAvailable()) {
      this.telegramService.showMainButton('Назад',
        () => this.closeAffirmation(),
      );
    } else {
      const backButtonDiv = DOMUtils.getById('backButton')
      const buttonBack = DOMUtils.createElement(
        'button', {
          classes: ['btn', 'btn-dark', 'btn-md', 'mt-2', 'btn-back-c-lg'],
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


  openDeletePopup() {
    this.generalModal.show({
      title: `Удалить аффирмацию (ID: ${this.selectedAffirmationId})?`,
      confirmBtn: {
        text: 'Да, удалить',
        styleClasses: ['btn', 'btn-outline-danger'],
        disabled: false,
        onClick: async () => this.confirmDeletion(),
      },
      cancelBtn: {
        text: 'Не удалять',
        styleClasses: ['btn', 'btn-outline-secondary'],
        disabled: false,
      },
    })
  }


  async confirmDeletion() {
    try {
      const response = await ApiService.deleteAffirmation(this.selectedAffirmationId);
      console.log('Deleted:', response.status)
      const data = await response.json();

      if (data.redirect) {
        window.location.href = data.redirect;
      }
    } catch (error) {
      console.log('Delete error:', error);
    }
  };

  async confirmEdit(id, text) {
    try {
      const response = await ApiService.updateAffirmation(id, text);
      console.log('Updated: ', id, response.ok);

      if (this.selectedAffirmationId === id) {
        this.elements.affirmQuoteText.textContent = text;
        this.selectedAffirmationElement.querySelector('.detail-title').textContent = text;
      }

      if (response.ok) {
        this.status.show('success', 'Аффирмация успешно обновлена')
      }

    } catch (error) {
      console.error('Updating error:', error);
      this.status.show('error', `Ошибка при обновлении аффирмации: ${error.message || error}`)
    } finally {
      this.closeEditAffirmForm();
    }
  };


}


