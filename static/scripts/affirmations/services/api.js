import {CONFIG, MESSAGES} from "../config/constants.js";

export class ApiService {
  static async _fetch(url, options = {}) {
    try {
      const response = await fetch(url, {
        credentials: 'same-origin',
        ...options,
      });

      if (!response.ok) {
        throw new Error(`${MESSAGES.ERROR.SERVER}: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error(error);
      throw error;
    }
  };

  static async loadAffirmations(limit, offset) {
    const url = `${CONFIG.API.BASE_URL}/?limit=${limit}&offset=${offset}`;
    return this._fetch(url)
  }

  static async deleteAffirmation(id) {
    const url = `${window.location.pathname}/${id}`;
    return this._fetch(url, {
      method: 'DELETE',
      redirect: 'follow',
    });
  }

  static async updateAffirmation(id, text) {
    const url = `${CONFIG.API.BASE_URL}/${id}`;
    return this._fetch(url, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({text_task: text}),
    });
  }

  static async updateSettings(settings) {
    return this._fetch(CONFIG.API.SETTINGS_URL, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(settings),
    });
  }

}