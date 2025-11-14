import {CONFIG} from "../config/constants.js";

export class TelegramService {
  constructor() {
    this.tg = window.Telegram?.WebApp;
    this.isInTelegram = !!this.tg && this.tg.initData !== '';

    if (this.isInTelegram) {
      this.tg.ready();
      this.tg.expand();
      console.log('TelegramService initialized in Telegram');
    }
    console.log('TelegramService initialized');
  };

  isAvailable() {
    return this.isInTelegram;
  }

  showMainButton(text, onClick) {
    if (!this.isInTelegram) return;
    this.tg.MainButton.offClick();

    this.tg.MainButton.setParams({
      text,
      has_shine_effect: false,
      is_visible: true,
      color: CONFIG.TELEGRAM.MAIN_BUTTON_COLOR,
      position: 'left',
    });
    console.log('Onclick', onClick)
    this.tg.MainButton.show();
    this.tg.MainButton.onClick(onClick);
  }

  hideMainButton(onClick) {
    if (!this.isInTelegram) return;

    if (onClick) {
      this.tg.MainButton.offClick(onClick);
    }
    this.tg.MainButton.hide();
  }
}