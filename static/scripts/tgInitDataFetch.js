document.addEventListener('DOMContentLoaded', async () => {
    const path = window.location.pathname;
    const botName = path.split('/').pop();

    const elements = {
        statusAuth: document.getElementById('statusAuth'),
//        tgInitData: document.getElementById('telegramInitData'),
        botConfig: document.getElementById('botConfigPath'),
    }

    // Настройка API endpoints
    let AUTH_PATH = '/auth';
    if (path.includes('/apps/') && botName !== '') {
        AUTH_PATH += `/${botName}`;
    }

    try {
        // Инициализация Telegram WebApp
        Telegram.WebApp.ready();
        Telegram.WebApp.expand();

        const botName = location.pathname.split('/').pop();
//        elements.tgInitData.innerText = Telegram.WebApp.initData || 'null';
        elements.botConfig.innerText = botName;

        // Отправка InitData на сервер
        const response = await fetch(AUTH_PATH, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'X-Client-Source': 'TelegramMiniApp'
            },
            body: Telegram.WebApp.initData,
            credentials: 'include'
        });

        const data = await response.json();

        // Обработка ответа
        if (response.ok) {
            window.location.replace(response.url || '/profile');
        } else {
            elements.statusAuth.className = 'status-indicator status-error';
            elements.statusAuth.innerText = `❌ Ошибка: ${response.status}, ${data.detail || JSON.stringify(data)}`;
        }
    } catch (error) {
        elements.statusAuth.className = 'status-indicator status-error';
        elements.statusAuth.innerText = `⚠️ Ошибка: ${error.message}`;
    }
});