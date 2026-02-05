import {DOMUtils} from "../utils/dom.js";
import {formatTime} from "../utils/helpers.js";
import {ApiService} from "../services/api.js";
import {StatusIndicator} from "./status_indicator.js";

export class SettingsManager {
  constructor() {
    this.statusTimer = null;
    this.init();
    this.status = new StatusIndicator("liveToast");
  }

  init() {
    this.initializeTimeDisplay();
    this.setupToggleSwitch();
    this.setupCountTasksModal();
    this.setupTimeModal();
  }

  initializeTimeDisplay() {
    const timeEl = DOMUtils.getById('timeSending')
    if (timeEl && timeEl.innerText) {
      timeEl.innerText = formatTime(timeEl.innerText)
    }
  }

  setupToggleSwitch() {
    const switchEl = DOMUtils.getById('switchSendingChecked');
    if (!switchEl) return;

    switchEl.addEventListener(
      'change',
      async (e) => {
      await this.handleToggleChange(e);
    });
  }

  async handleToggleChange(e) {
    const switchEl = e.currentTarget;
    switchEl.disabled = true;

    try {
      await ApiService.updateSettings({
        send_enable: switchEl.checked,
      });
      this.status.show('success', 'Настройки сохранены')
    } catch (error) {
      switchEl.checked = !switchEl.checked;
      this.status.show('error', error.message || 'Ошибка при сохранении настроек', 10000)
    } finally {
      switchEl.disabled = false;
    }
  };

  setupCountTasksModal() {
    const selectEl = DOMUtils.getById('countTasks')
    const saveBtn = DOMUtils.getById('saveCountTasksButton');
    const modalEl = DOMUtils.getById('affirmations-change-count');
    const currentDisplay = DOMUtils.getById('currentCountTasks');

    if (!selectEl || !saveBtn || !modalEl) return;

    let newValue = null;

    modalEl.addEventListener(
      'show.bs.modal',
      (event) => {
        const trigger = event.relatedTarget;
        const current = trigger?.dataset.currentCount;

        selectEl.value = current;
        newValue = current;
        saveBtn.disabled = true;
      }
    );

    selectEl.addEventListener(
      'change',
      function () {
        newValue = this.value;
        saveBtn.disabled = false;
      }
    );

    saveBtn.addEventListener(
      'click',
      async () => {
        const modal = bootstrap.Modal.getInstance(modalEl);
        await this.saveCountTasks(
          saveBtn,
          newValue,
          currentDisplay,
          modal,
        );
      }
    );
  };

  async saveCountTasks(
    saveBtn,
    newValue,
    currentDisplay,
    modal
  ) {
    saveBtn.disabled = true;
    saveBtn.textContent = 'Сохранение...';

    try {
      await ApiService.updateSettings({count_tasks: parseInt(newValue)})
      if (currentDisplay) {
        currentDisplay.textContent = newValue;

        const parentItem = currentDisplay.closest('[data-current-count]');
        if (parentItem) {
          parentItem.dataset.currentCount = newValue;
        }
      }

      this.status.show('success', 'Настройки сохранены')
      modal.hide();
    } catch (error) {
      modal.hide();
      this.status.show('error', error.message || 'Ошибка запроса', 10000);
    } finally {
      saveBtn.textContent = 'Сохранить';
      saveBtn.disabled = false;
    }
  };

  setupTimeModal() {
    const timeInput = DOMUtils.getById('affirmation-time');
    const saveBtn = DOMUtils.getById('saveTimeButton');
    const timeDisplay = DOMUtils.getById('timeSending');
    const modalEl = DOMUtils.getById('affirmations-change-time-sending');

    if (!timeInput || !saveBtn || !modalEl) return;

    let newTime = timeInput.value;
    const modal = bootstrap.Modal.getOrCreateInstance(modalEl); // eslint-disable-line no-undef

    timeInput.addEventListener(
      'change',
      function () {
        newTime = this.value;
        saveBtn.disabled = false;
      });

    saveBtn.addEventListener(
      'click',
      async () => {
        await this.saveTime(
          saveBtn,
          newTime,
          timeDisplay,
          modal
        );
      });

    modalEl.addEventListener(
      'hidden.bs.modal',
      () => {
        timeInput.value = timeDisplay?.textContent || timeDisplay.value;
      });
  };

  async saveTime(
    saveBtn,
    newTime,
    timeDisplay,
    modal
  ) {
    saveBtn.disabled = true;
    saveBtn.textContent = 'Сохранение...';

    try {
      await ApiService.updateSettings({send_time: newTime})
      if (timeDisplay) {
        timeDisplay.textContent = newTime;
      }

      this.status.show('success', 'Настройки сохранены')
      modal.hide();
    } catch (error) {
      modal.hide();
      this.status.show('error', error.message || 'Ошибка запроса', 10000);
    } finally {
      saveBtn.textContent = 'Сохранить';
      saveBtn.disabled = false;
    }
  };

  destroy() {
    if (this.statusTimer) {
      clearTimeout(this.statusTimer);
    }
  }


}