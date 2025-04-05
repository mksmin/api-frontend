document.addEventListener('DOMContentLoaded', () => {
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

        const elements = {
            statusBlock: document.getElementById('statusBlock')
        }

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

        } catch (error) {

        }


    } catch (error) {

    }

});