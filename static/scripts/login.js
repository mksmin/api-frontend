document.addEventListener('DOMContentLoaded', async () => {
    try {
        const path = window.location.pathname;
        const AUTH_PATH = '/auth/bot2';
        const INITIAL_REDIRECT_KEY = 'initial_redirect';
        const statusBlock  = document.getElementById('statusBlock');

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

        (function saveInitialRedirect () {
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
            if (!statusBlock) {
                console.log('status:', type, text);
                return;
            }
            statusBlock.className = 'status-indicator' + (type ? ` status-${type}` : '');
            statusBlock.textContent = text;
        }
        safeSetStatus('info', '🪪 Необходима авторизация через Telegram');

        function injectTelegramWidget() {
            const script = document.createElement('script');
            const container = document.querySelector('.auth-wrapper .tg-widget');
            if (!container) {
                console.warn('⚠️ Контейнер для Telegram-виджета не найден');
                return;
            }

            script.async = true;
            script.src = 'https://telegram.org/js/telegram-widget.js?22';
//            script.dataset.telegramLogin = 'test_mininBot';
            script.dataset.telegramLogin = 'mininwork_bot';
            script.dataset.size = 'large';
            script.dataset.onauth = "loginTelegramWidget(user)";
            script.dataset.radius = 12;

            console.log("✅ Telegram Widget injected:");

            container.appendChild(script);
        };

        window.loginTelegramWidget = async function(user) {
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
                };

                if (response.ok) {
                    const data = await response.json();
                    const redirectUrl = data.redirect_url;

                    if (redirectUrl) {
                        sessionStorage.setItem('tg_auth_handled', '1');
                        sessionStorage.removeItem('tg_auth_in_progress');
                        safeSetStatus('success', '✅ Авторизация пройдена, выполняю переход...');
                        window.location.href = redirectUrl;
                    } else {};

                } else {
                    let text = '';
                    try { text = await response.text() } catch (e) {};
                    console.error('Auth failed:', response.status, text);
                    sessionStorage.removeItem('tg_auth_in_progress');
                    safeSetStatus('error', `❌ Ошибка ${response.status}: ${text || 'Неизвестная ошибка'}`);
                };
            } catch (error) {
                console.error('Network/auth error', error);
                sessionStorage.removeItem('tg_auth_in_progress');
                safeSetStatus('error', '❌ Ошибка при обработке авторизации');
            };
        };
        injectTelegramWidget();

    } catch (error) {
        console.error('Global Error:', error);
    }
});
