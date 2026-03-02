import {StatusIndicator} from "./affirmations/ui/status_indicator.js";
import {DOMUtils} from "./affirmations/utils/dom.js";

document.addEventListener('DOMContentLoaded', async () => {
  try {
    const AUTH_PATH = '/auth/tg/widget/mininwork_bot';
    const INITIAL_REDIRECT_KEY = 'initial_redirect';
    const status = new StatusIndicator('liveToast');
    const BOT_ID = document.querySelector('meta[name="tg-bot-id"]').content;


    function isSafeRedirect(r) {
      return typeof r === 'string' && r.length > 0 && r.startsWith('/') && !r.startsWith('//');
    }

    try {
      if (window.Telegram && Telegram.WebApp && typeof Telegram.WebApp.ready === 'function') {
        Telegram.WebApp.ready();
        console.log("✅ Telegram WebApp ready");
        console.log('InitData:', !!Telegram.WebApp.initData);
        if (typeof Telegram.WebApp.expand === 'function') {
          Telegram.WebApp.expand();
        }
      }
    } catch (e) {
      console.warn('Telegram WebApp init failed or not present', e);
    }

    (function saveInitialRedirect() {
      const urlParams = new URLSearchParams(window.location.search);
      const redirectParam = urlParams.get('redirect_url');

      if (redirectParam && isSafeRedirect(redirectParam)) {
        if (!sessionStorage.getItem(INITIAL_REDIRECT_KEY)) {
          sessionStorage.setItem(INITIAL_REDIRECT_KEY, redirectParam);
          console.log("Initial redirect saved:", redirectParam);
        }
      }
    })();

    function safeSetStatus(type, text) {
      if (!status) {
        return;
      }
      status.show(type, text, 10000, true);
    }

    safeSetStatus('primary', '🪪 Необходима авторизация через Telegram');

    const setupTelegramAuthWidget = () => {
      const ids = [
        "icon-telegram-auth",
        "text-telegram-auth",
        "btn-telegram-auth",
      ];


      ids.forEach(id => {
        const el = DOMUtils.getById(id);
        if (!el) return;
        el.addEventListener("click", () => {
          window.Telegram.Login.auth({
            bot_id: BOT_ID,
            request_access: true
          }, (user) => {
            loginTelegramWidget(user);
          });
        });
      });
    };

    window.loginTelegramWidget = async function (user) {
      sessionStorage.setItem('tg_auth_in_progress', '1');
      safeSetStatus('info', '🪪 Обнаружены параметры авторизации, завершаю вход...');

      sessionStorage.removeItem('photoUrl');
      sessionStorage.setItem('photoUrl', user.photo_url || '');

      try {
        const response = await fetch(AUTH_PATH, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Client-Source': 'TelegramWidget'
          },
          body: JSON.stringify(user),
          credentials: 'include',
        });

        const initialRedirect = sessionStorage.getItem(INITIAL_REDIRECT_KEY);
        if (initialRedirect && isSafeRedirect(initialRedirect)) {
          sessionStorage.setItem('tg_auth_handled', '1');
          sessionStorage.removeItem('tg_auth_in_progress');
          sessionStorage.removeItem(INITIAL_REDIRECT_KEY);

          safeSetStatus('success', '✅ Авторизация пройдена — перенаправляю...');
          window.location.href = initialRedirect;
          return;
        }


        if (response.ok) {
          const data = await response.json();
          const redirectUrl = data.redirect_url;

          if (redirectUrl) {
            sessionStorage.setItem('tg_auth_handled', '1');
            sessionStorage.removeItem('tg_auth_in_progress');
            safeSetStatus('success', '✅ Авторизация пройдена, выполняю переход...');
            window.location.href = redirectUrl;
          }
        } else {
          let text = '';
          try {
            text = await response.text()
          } catch (e) {
          }

          console.error('Auth failed:', response.status, text);
          sessionStorage.removeItem('tg_auth_in_progress');
          safeSetStatus('error', `❌ Ошибка ${response.status}: ${text || 'Неизвестная ошибка'}`);
        }
      } catch (error) {
        console.error('Network/auth error', error);
        sessionStorage.removeItem('tg_auth_in_progress');
        safeSetStatus('error', '❌ Ошибка при обработке авторизации');
      }
    };
    setupTelegramAuthWidget();

  } catch (error) {
    console.error('Global Error:', error);
  }
});
