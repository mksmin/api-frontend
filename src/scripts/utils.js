// Объявляем функции в глобальной области видимости
window.dynamicLoadContent = null;
window.elements = {};

document.addEventListener('DOMContentLoaded', () => {
    'use strict';

    window.elements = {
        statusBlock: document.getElementById('statusBlock')
    };

    window.hideResult = () => {
        console.log('Скрываем результат!');

        if (!elements?.statusBlock) {
            console.error('Элемент statusBlock не найден!');
            return;
        };

        setTimeout(function() {
            if (!elements.statusBlock) return;

            elements.statusBlock.classList.add('fade-out');

            elements.statusBlock.addEventListener('transitionend', function() {
                this.style.transition = 'transform 0.5s ease';
                this.style.transform = 'scale(0) ';

                this.addEventListener('transitionend', function() {
                    this.remove();
                    window.elements.statusBlock = null;
                }, { once: true });
            });
        }, 5000);
    };

    window.dynamicLoadContent = async () => {
        try {
            // Получаем текущий путь
            const currentPath = window.location.pathname;
            // Кодируем путь для безопасной передачи в URL
            const encodedPath = encodeURIComponent(currentPath);

            console.log("Начинаю динамическое обновление контента...", encodedPath)
            const response = await fetch(`/content?page=${encodedPath}`, {
                method: "GET",
            });
            // Шаг 2: Парсим JSON (но не теряем объект response)
            const data = await response.text();

//            // Шаг 3: Логируем статус и данные
//            console.log("Response Status:", response.status);
//            console.log("Response Data:", data);


            if (response.status == 200) {
                console.log("Сейчас скрою контент...")
                document.getElementById('container').innerHTML = data;
                window.elements.statusBlock.className = 'status-indicator status-success';
                window.elements.statusBlock.textContent = '✅ Проверка пройдена!';
                window.hideResult();

            }

        } catch (error) {
            console.error('[HTTP] Ошибка:', error);
            elements.statusBlock.className = 'status-indicator status-error';
            elements.statusBlock.textContent = `❌ Ошибка: ${error.message}`;
            window.hideResult();
        }

    }


});

