import {DOMUtils} from "./affirmations/utils/dom.js";

document.addEventListener('DOMContentLoaded', async () => {
  const path = window.location.pathname;
  const botName = path.split('/').pop();
  const tg = Telegram.WebApp;
  let AUTH_PATH = '/auth';

  const elements = {
    statusAuth: DOMUtils.getById('statusAuth'),
    botConfig: DOMUtils.getById('botConfigPath'),
    tgIcon: DOMUtils.getById('icon-telegram-auth'),
    gradient: DOMUtils.query('.gradient'),
  }

  function setAuthStatus(element, header = '', message = '', className = 'color-telegram') {
    if (!element) {
      console.error('setAuthStatusError: элемент не найден');
      return;
    }
    element.innerHTML = `
  <span class="word ${className}">${header}</span>
  <span class="word">${message}</span>
`;
  }

  if (path.includes('/apps/') && botName !== '') {
    AUTH_PATH += `/${botName}`;
  }

  try {
    tg.ready();
    tg.expand();

    if (!tg.initData) {
      setAuthStatus(
        elements.statusAuth,
        'Ошибка:',
        'не удалось получить данные от Telegram',
        'text-warning'
      )
      DOMUtils.addClass(elements.tgIcon, 'bg-color-warning')
      DOMUtils.addClass(elements.botConfig.querySelector('a'), 'bg-color-warning')
      DOMUtils.addClass(elements.gradient, 'gradient-warning')
      DOMUtils.removeClass(elements.gradient, 'gradient-telegram')
      return;
    }

    const response = await fetch(AUTH_PATH, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'X-Client-Source': 'TelegramMiniApp'
      },
      body: Telegram.WebApp.initData,
      credentials: 'include'
    });


    if (response.ok) {
      const data = await response.json();
      const redirectUrl = data.redirect_url;
      setAuthStatus(
        elements.statusAuth,
        'Успешно:',
        'авторизация прошла'
      )
      window.location.href = redirectUrl || '/profile';
    } else {
      const data = await response.json();
      setAuthStatus(
        elements.statusAuth,
        'Ошибка:',
        `${response.status}, ${data.detail || JSON.stringify(data)}`,
        'text-error'
      )
      DOMUtils.addClass(elements.tgIcon, 'bg-color-error')

      DOMUtils.addClass(elements.botConfig.querySelector('a'), 'bg-color-error')
      DOMUtils.addClass(elements.gradient, 'gradient-error')
      DOMUtils.removeClass(elements.gradient, 'gradient-telegram')

    }
  } catch (error) {
    setAuthStatus(
      elements.statusAuth,
      'Ошибка:',
      error.message,
      'text-warning'
    )
    DOMUtils.addClass(elements.tgIcon, 'bg-color-warning')
    DOMUtils.addClass(elements.gradient, 'gradient-warning')
    DOMUtils.removeClass(elements.gradient, 'gradient-telegram')
    DOMUtils.addClass(elements.botConfig.querySelector('a'), 'bg-color-warning')
  }
});