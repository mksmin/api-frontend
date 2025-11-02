document.addEventListener('DOMContentLoaded', async () => {
    const path = window.location.pathname;
    const botName = path.split('/').pop();
    const tg = Telegram.WebApp;
    let AUTH_PATH = '/auth';

    const elements = {
        statusAuth: document.getElementById('statusAuth'),
        botConfig: document.getElementById('botConfigPath'),
    }

    if (path.includes('/apps/') && botName !== '') {
        AUTH_PATH += `/${botName}`;
    }

    try {
        tg.ready();
        tg.expand();

        if (!tg.initData) {
            elements.statusAuth.className = "status-indicator status-error";
            elements.statusAuth.innerText = "⚠️ Ошибка: не удалось получить данные от Telegram ";
            return;
        };

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
            window.location.href = redirectUrl || '/profile';
        } else {
            const data = await response.json();
            elements.statusAuth.className = 'status-indicator status-error';
            elements.statusAuth.innerText = `❌ Ошибка: ${response.status}, ${data.detail || JSON.stringify(data)}`;
        }
    } catch (error) {
        elements.statusAuth.className = 'status-indicator status-error';
        elements.statusAuth.innerText = `⚠️ Ошибка: ${error.message}`;
    }
});