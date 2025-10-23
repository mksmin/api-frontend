document.addEventListener('DOMContentLoaded', async () => {
    try {
        const path = window.location.pathname;
        const AUTH_PATH = '/auth/bot3';
        const INITIAL_REDIRECT_KEY = 'initial_redirect';

        function isSafeRedirect(r) {
            // Разрешаем только внутренние пути вида "/something"
            // Запрещаем абсолютные URL, протоколы и "//..."
            console.log('isSafeRedirect:', r);
            return typeof r === 'string' && r.length > 0 && r.startsWith('/') && !r.startsWith('//');
        }

        // Try to initialise Telegram WebApp if available (safe)
        try {
            if (window.Telegram && Telegram.WebApp && typeof Telegram.WebApp.ready === 'function') {
                Telegram.WebApp.ready();
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

            console.log("Initial redirect (raw):", sessionStorage.getItem(INITIAL_REDIRECT_KEY));
            console.log("redirectParam", redirectParam);

            if (redirectParam && isSafeRedirect(redirectParam)) {
                if (!sessionStorage.getItem(INITIAL_REDIRECT_KEY)) {
                    sessionStorage.setItem(INITIAL_REDIRECT_KEY, redirectParam);
                    console.log("Initial redirect saved:", redirectParam);
                }
            }
        })();


        const statusBlock  = document.getElementById('statusBlock');

        function safeSetStatus(type, text) {
            if (!statusBlock) {
                console.log('status:', type, text);
                return;
            }
            statusBlock.className = 'status-indicator' + (type ? ` status-${type}` : '');
            statusBlock.textContent = text;
        }
        safeSetStatus('info', '🪪 Необходима авторизация через Telegram');

        async function loginTelegramWidgetFromQuery() {
            const urlParams = new URLSearchParams(window.location.search);

            if (!(urlParams.has('id') && urlParams.has('hash') && urlParams.has('auth_date'))) {
                console.log('No Telegram auth params in URL');
                return;
            }

            if (sessionStorage.getItem('tg_auth_in_progress') === '1') {
                console.log('TG auth already in progress — skipping.');
                return;
            }
            sessionStorage.setItem('tg_auth_in_progress', '1');

            const queryData = new URLSearchParams();
            urlParams.forEach((value, key) => {
                if (!['dev', 'utm_source', 'ref'].includes(key)) {
                    queryData.append(key, value);
                }
            });

            safeSetStatus('info', '🪪 Обнаружены параметры авторизации, завершаю вход...');

            try {
                const response = await fetch(AUTH_PATH, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                        'X-Client-Source': 'TelegramWidget'
                    },
                    body: queryData.toString(),
                    credentials: 'include',
                    redirect: 'follow'
                });

                try {
                    history.replaceState({}, '', path);
                } catch (error) {
                    console.warn('history.replaceState failed', error);
                }

                const initialRedirect = sessionStorage.getItem(INITIAL_REDIRECT_KEY);
                if (initialRedirect && isSafeRedirect(initialRedirect)) {

                    sessionStorage.setItem('tg_auth_handled', '1');
                    sessionStorage.removeItem('tg_auth_in_progress');
                    sessionStorage.removeItem(INITIAL_REDIRECT_KEY);

                    safeSetStatus('success', '✅ Авторизация пройдена — перенаправляю...');
                    // Перенаправляем на сохранённый путь
                    window.location.href = initialRedirect;
                    return;

                }

                if (response.ok) {
                    // помечаем как обработанное, чтобы избежать повторной обработки
                    sessionStorage.setItem('tg_auth_handled', '1');
                    sessionStorage.removeItem('tg_auth_in_progress');

                    const finalUrl = response.url || path;
                    safeSetStatus('success', '✅ Авторизация пройдена, выполняю переход...');

                    if (finalUrl && finalUrl !== window.location.href) {
                        window.location.href = finalUrl;
                    } else {
                        window.location.reload();
                    }

                } else {
                    let text = '';
                    try { text = await response.text(); } catch (e) {}
                    console.error('Auth failed:', response.status, text);
                    sessionStorage.removeItem('tg_auth_in_progress');
                    safeSetStatus('error', `❌ Ошибка ${response.status}: ${text || 'Неизвестная ошибка'}`);
                }

            } catch (error) {
                // Обработка сетевой/непредвиденной ошибки — теперь корректно внутри catch
                console.error('Network/auth error', error);
                sessionStorage.removeItem('tg_auth_in_progress');
                safeSetStatus('error', '❌ Ошибка при обработке авторизации');
            }
        }

        await loginTelegramWidgetFromQuery();

    }
    catch (error) {
        console.error('Global Error:', error);
    }
});
