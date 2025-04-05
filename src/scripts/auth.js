document.addEventListener('DOMContentLoaded', async () => {
    try {
        // Конфигурация
        const urlParams = new URLSearchParams(window.location.search);
        const path = window.location.pathname;
        const hasAffirm = path.includes('/affirm');

        // Настройка API endpoints
        let AUTH_PATH = "/auth";

        // Инициализация Telegram WebApp
        Telegram.WebApp.ready();
        Telegram.WebApp.expand();

        const { statusBlock } = window.elements;

        async function loadContent() {
            try {
                elements.statusBlock.className = 'status-indicator status-info';
                elements.statusBlock.textContent = `🪪 Нужна авторизация`;

                let requestData = null;
                let clientType = null;

                if (Telegram.WebApp.initData) {
                    requestData = Telegram.WebApp.initData;
                    clientType = "TelegramMiniApp"
                } else if (urlParams.has('id') && urlParams.has('hash') && urlParams.has('auth_date')) {
                    const queryData = new URLSearchParams();
                    urlParams.forEach((value, key) => {
                        if (!['dev', 'utm_source', 'ref'].includes(key)) {
                            queryData.append(key, value);
                        }
                    });
                    requestData = queryData.toString();
                    clientType = "TelegramWidget"
                }

                if (!requestData) {
                    throw new Error('Не найдены данные для авторизации');
                }

                console.log("HTTP: ", AUTH_PATH);
                console.log("Request Data: ", requestData);

                const response = await fetch(AUTH_PATH, {
                    method: "POST",
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                        "X-Client-Source": clientType
                    },
                    body: requestData,
                    redirect: 'manual' // Отключаем автоматический редирект
                });

                console.log("Server Response:", response); // Логируем ответ

                // Обрабатываем редиректы вручную
                if (response.status >= 300 && response.status < 400) {
                    const redirectUrl = response.headers.get('Location');
                    if (redirectUrl) {
                        window.location.href = redirectUrl;
                        return;
                    }
                }

                const responseText = await response.text(); // Всегда получаем текст ответа

                if (response.ok) { // status 200-299
                    elements.statusBlock.className = 'status-indicator status-success';
                    elements.statusBlock.textContent = '✅ Проверка пройдена!';
                    window.hideResult();
                } else {
                    elements.statusBlock.className = 'status-indicator status-error';
                    elements.statusBlock.textContent = `❌ Ошибка ${response.status}: ${responseText || 'Нет дополнительной информации'}`;
                }

            } catch (error) {
                console.error('[HTTP] Ошибка:', error);
                elements.statusBlock.className = 'status-indicator status-error';
                elements.statusBlock.textContent = `❌ Ошибка: ${error.message}`;
                window.hideResult();
            }
        }

        await loadContent();

    } catch (error) {
        console.error('Global Error:', error);
    }
});