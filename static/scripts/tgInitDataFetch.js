import {DOMUtils} from "./affirmations/utils/dom.js";

document.addEventListener('DOMContentLoaded', async () => {
  const botAuthPath = document.querySelector('meta[name="miniapp-bot-auth-path"]');
  let AUTH_PATH = "";
  const tg = Telegram.WebApp;
  const errorsMeta = document.querySelector('meta[name="errors"]');

  const elements = {
    statusAuth: DOMUtils.getById('statusAuth'),
    botConfig: DOMUtils.getById('botConfigPath'),
    tgIcon: DOMUtils.getById('icon-telegram-auth'),
    gradient: DOMUtils.query('.gradient'),
  }

  function setAuthStatus(
    element,
    header = '',
    message = '',
    subtext = "",
    className = 'color-telegram',
  ) {
    if (!element) {
      console.error('setAuthStatusError: элемент не найден');
      return;
    }
    element.innerHTML = `
  <span class="word ${className}">${header}</span>
  <span class="word">${message}</span>
`;

    if (subtext) {
      element.innerHTML += `
      <span class="word mt-3 fs-3" style="line-height: normal">${subtext}</span>
      `;
    }
  }

  if (errorsMeta) {
    const errors = errorsMeta.getAttribute('content');
    setAuthStatus(
      elements.statusAuth,
      'Ошибка:',
      errors,
      "",
      'text-error'
    );
    DOMUtils.addClass(elements.tgIcon, 'bg-color-error');
    DOMUtils.addClass(elements.gradient, 'gradient-error');
    DOMUtils.removeClass(elements.gradient, 'gradient-telegram');
    errorsMeta.remove();
    return;
  }

  if (botAuthPath) {
    AUTH_PATH = botAuthPath.getAttribute('content');
    botAuthPath.remove();
  } else {
    setAuthStatus(
      elements.statusAuth,
      'Ошибка:',
      "Сервер не вернул путь авторизации",
      "Попробуйте перезагрузить страницу или обратиться в поддержку",
      'text-error'
    );
    DOMUtils.addClass(elements.tgIcon, 'bg-color-error');
    DOMUtils.addClass(elements.gradient, 'gradient-error');
    DOMUtils.removeClass(elements.gradient, 'gradient-telegram');

    if (elements.botConfig) {
      elements.botConfig.remove()
    }

    return;
  }

  try {
    tg.ready();
    tg.expand();

    if (!tg.initData) {
      setAuthStatus(
        elements.statusAuth,
        'Ошибка:',
        'не удалось получить данные от Telegram',
        "",
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
        'Content-Type': 'application/x-www-form-urlencoded'
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
        'авторизация прошла',
        "",
        'color-telegram'
      )
      window.location.href = redirectUrl || '/profile';
    } else {
      const data = await response.json();
      setAuthStatus(
        elements.statusAuth,
        'Ошибка:',
        `${response.status}, ${data.detail || JSON.stringify(data)}`,
        "",
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
      "",
      'text-warning'
    )
    DOMUtils.addClass(elements.tgIcon, 'bg-color-warning')
    DOMUtils.addClass(elements.gradient, 'gradient-warning')
    DOMUtils.removeClass(elements.gradient, 'gradient-telegram')
    DOMUtils.addClass(elements.botConfig.querySelector('a'), 'bg-color-warning')
  }
});
