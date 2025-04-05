document.addEventListener('DOMContentLoaded', async () => {
    // Конфигурация
    const urlParams = new URLSearchParams(window.location.search);
    const path = window.location.pathname;
    const hasAffirm = path.includes('/affirm');
    const queryString = window.location.search;

    // Настройка API endpoints
    let AUTH_PATH = "/auth";

    try {
        // Инициализация Telegram WebApp
        Telegram.WebApp.ready();
        Telegram.WebApp.expand(); // Разворачиваем экран

        const { statusBlock } = window.elements;

        async function loadContent() {
            try {
                let requestData = null;

                if (Telegram.WebApp.initData) {
                    requestData = Telegram.WebApp.initData;

                } else {
                    requestData = null;
                }

                console.log("HTTP: ", AUTH_PATH)
                let response = null;
                let html = null;

                if (requestData) {
                    response = await fetch(AUTH_PATH, {
                        method: "POST",
                        headers: {'Content-Type': 'application/x-www-form-urlencoded'},
                        body: requestData
                    }).then(response => {
                        if (response.redirect) {
                            window.location.href = response.url;
                        }
                    });

                } else {
                    response = {
                        status: 400,
                        statusText: 'Bad Request'
                    };
                }
                if (response.status.ok) {
                    elements.statusBlock.className = 'status-indicator status-success';
                    elements.statusBlock.textContent = '✅ Проверка пройдена!';
                    window.hideResult();

                } else {
                    elements.statusBlock.className = 'status-indicator status-info';
                    elements.statusBlock.textContent = `🪪 Нужна авторизация`;


                }

            } catch (error) {
                console.error('[HTTP] Ошибка:', error);
                elements.statusBlock.className = 'status-indicator status-error';
                elements.statusBlock.textContent = `❌ Ошибка: ${error.message}`;
                window.hideResult();
            }
        }
        await loadContent()

    } catch (error) {

    }


});