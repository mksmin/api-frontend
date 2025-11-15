import {DOMUtils} from "../utils/dom.js";
import {TelegramService} from "../services/telegram.js";

export class GeneralModalManager {
  constructor() {
    this.modal = DOMUtils.getById('general-page-modal')
    this.titleEl = this.modal.querySelector('#gModalText');
    this.confirmBtn = this.modal.querySelector('#gModalConfirmButton');
    this.cancelBtn = this.modal.querySelector('#gModalCancelButton');
    this.telegramService = new TelegramService();

    this.instance = bootstrap.Modal.getOrCreateInstance(this.modal);

    this.originalModal = {
      title: this.titleEl.textContent,
      confirmBtn: {
        text: this.confirmBtn.textContent,
        classes: [...this.confirmBtn.classList],
        hidden: this.confirmBtn.classList.contains('d-none'),
        disabled: this.confirmBtn.disabled,
      },

      cancelBtn: {
        text: this.cancelBtn.textContent,
        classes: [...this.cancelBtn.classList],
        hidden: this.cancelBtn.classList.contains('d-none'),
        disabled: this.cancelBtn.disabled,
      },
    }

    this.modal.addEventListener('hidden.bs.modal', () => this.reset());
  }

  show({
         title,
         confirmBtn = {},
         cancelBtn = {},
       }) {
    const {onClick = null} = confirmBtn;

    if (title) this.titleEl.textContent = title;

    this.applyButtonConfig(
      this.confirmBtn,
      this.originalModal.confirmBtn,
      confirmBtn,
    )
    this.applyButtonConfig(
      this.cancelBtn,
      this.originalModal.cancelBtn,
      cancelBtn,
    )

    this.confirmBtn.onclick = () => {
      if (onClick) onClick();
      this.instance.hide();
    };


    this.instance.show();
    this.telegramService.disableMainButton();

  };

  applyButtonConfig(
    btn,
    original,
    config
  ) {
    const {
      allow = true,
      text = null,
      styleClasses = null,
      disabled = true,
    } = config;

    if (!allow) {
      DOMUtils.addClass(btn, "d-none")
      return;
    } else {
      DOMUtils.removeClass(btn, "d-none")
    }

    if (text !== null) {
      btn.textContent = text;
    }

    if (styleClasses !== null) {
      btn.className = styleClasses.join(" ");
    }


    btn.disabled = disabled;
  };

  reset() {
    this.titleEl.textContent = this.originalModal.title;
    this.confirmBtn.onclick = null;
    this.restoreButton(this.confirmBtn, this.originalModal.confirmBtn);
    this.restoreButton(this.cancelBtn, this.originalModal.cancelBtn);

    this.telegramService.enableMainButton();


  };

  restoreButton(
    btn,
    original,
  ) {
    btn.textContent = original.text;
    btn.className = original.classes.join(" ");

    if (original.hidden) {
      DOMUtils.addClass(btn, "d-none")
    } else {
      DOMUtils.removeClass(btn, "d-none")
    }

    if ('disabled' in original) {
      btn.disabled = original.disabled;
    }

  }

}