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

        const { statusBlock } = window.elements



        async function loadContent() {
            try {
                elements.statusBlock.className = 'status-indicator status-info';
                elements.statusBlock.textContent = `🪪 Нужна авторизация`;

                let requestData = null;
                let clientType = null;
                console.log("URL PARAMS: ", urlParams);

                if (Telegram.WebApp.initData) {
                    requestData = Telegram.WebApp.initData;
                    clientType = "TelegramMiniApp"
                    console.log("Init Data: ", requestData);
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
                console.log("REQUEST DATA: ", requestData);
                if (!requestData) {
                    return;
                }

                console.log("HTTP: ", AUTH_PATH);


                const response = await fetch(AUTH_PATH, {
                    method: "POST",
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                        "X-Client-Source": clientType
                    },
                    body: requestData,
                    credentials: 'include'
                });

                // Шаг 2: Парсим JSON (но не теряем объект response)
                const data = await response.text();

//                // Шаг 3: Логируем статус и данные
//                console.log("Server Response Status:", response.status);
//                console.log("Server Response Data:", data);

//                // Шаг 4: Обрабатываем редирект
//                if (data.redirect) {
//                    window.history.replaceState({}, document.title, data.redirect);
//                    console.log('Redirect:', data.redirect);
//                }

                // Шаг 5: Проверяем статус
                if (response.status >= 200 && response.status < 300) {
                    elements.statusBlock.className = 'status-indicator status-success';
                    elements.statusBlock.textContent = '✅ Проверка пройдена!';
                    window.history.replaceState({}, document.title, path);
                    window.dynamicLoadContent();
                    window.hideResult();
                } else {
                    elements.statusBlock.className = 'status-indicator status-error';
                    elements.statusBlock.textContent = `❌ Ошибка ${response.status}: ${data.message || 'Нет информации'}`;
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