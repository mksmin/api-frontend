import {CONFIG, MESSAGES} from "../config/constants.js";

export class ApiService {
  static async _fetch(url, options ={}){
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

}