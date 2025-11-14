import {StatusIndicator} from "./affirmations/ui/status_indicator.js";
import {TelegramService} from "./affirmations/services/telegram.js";
import {AffirmationDetail} from "./affirmations/ui/affirmation_details.js";
import {AffirmationLoader} from "./affirmations/ui/affirmation_loader.js";

const status = new StatusIndicator("#statusSettings")

class AffirmationApp {
  constructor() {
    this.telegramService = new TelegramService();
    this.components = {};
  }

  init() {
    try {
      this.components.affirmationDetail = new AffirmationDetail(this.telegramService);
      this.components.affirmationLoader = new AffirmationLoader();
      // this.components.settingsManager = new SettingsManager();

      console.log('✅ Affirmation App initialized successfully');
    } catch (error) {
      console.error('❌ Failed to initialize app:', error);
    }
  };

  destroy() {
    Object.values(this.components).forEach((component) => {
      if (component.destroy) {
        component.destroy();
      }
    });

    this.components = {};
  };
}

document.addEventListener('DOMContentLoaded', () => {
  const app = new AffirmationApp();
  app.init();
});
