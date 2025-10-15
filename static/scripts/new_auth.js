document.addEventListener('DOMContentLoaded', async () => {
    try {
//        Конфигурация
        const urlParams = new URLSearchParams(window.location.search);
        const path = window.location.pathname;
        const botName = path.split('/').pop();

        let AUTH_PATH = '/auth';
        if (path.includes('/apps/') && botName !== '') {
            AUTH_PATH += '/${botName}';
        }

        // Инициализация Telegram WebApp
        Telegram.WebApp.ready();
        Telegram.WebApp.expand();

        const { statusBlock } = window.elements

        async function loadContent() {
            try {
                elements.statusBlock.className = 'status-indicator status-info';
                elements.statusBlock.textContent = '🪪 Нужна авторизация';

                let rqequestData = null;
                let clientType = null;

                if (Telegram.WebApp.initData) {
                    requestData = Telegram.WebApp.initData;
                    clientType = 'TelegramMiniApp';
                    console.log("Use InitData to auth")
                } else if (urlParams.has('id') && urlParams.has('hash') && urlParams.has('auth_date')) {
                    const queryData = new URLSearchParams();
                    urlParams.forEach((value, key) => {
                        if (!['dev', 'utm_source', 'ref'].includes(key)) {
                            queryData.append(key, value);
                        }
                    });
                    requestData = queryData.toString();
                    clientType = 'TelegramWidget';
                    console.log("Use URLParams to auth")
                } else {
                    return;
                }

                const response = await fetch(AUTH_PATH, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                        'X-Client-Source': clientType
                    },
                    body: requestData,
                    credentials: 'include'
                });

                const data = await response.text();

                if (response.status >= 200 && response.status < 300) {
                    elements.statusBlock.className = 'status-indicator status-success';
                    elements.statusBlock.textContent = '✅ Авторизация пройдена!';
                    window.history.replaceState({}, document.title, path);
                    window.location.reload();
                    window.hideResult();
                } else {
                    elemets.statusBlock.className = 'status-indicator status-error';
                    elements.statusBlock.textContent = "❌ Ошибка ${response.status}: ${data.message || 'Неизвестная ошибка'}";
                }

            }
            catch (error) {
                console.error('Error:', error);
            }
        };

        await loadContent();

    }
    catch (error) {
        console.error('Global Error:', error);
    }
});