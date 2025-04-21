// Объявляем функции в глобальной области видимости
window.dynamicLoadContent = null;
window.elements = {};

document.addEventListener('DOMContentLoaded', () => {
    'use strict';

    window.elements = {
        statusBlock: document.getElementById('statusBlock')
    };

    window.hideResult = () => {

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

            const response = await fetch(`/content?page=${encodedPath}`, {
                method: "GET",
            });
            // Шаг 2: Парсим JSON (но не теряем объект response)
            const data = await response.text();

            if (response.status == 200) {
                document.getElementById('container').innerHTML = data;
                window.elements.statusBlock.className = 'status-indicator status-success';
                window.elements.statusBlock.textContent = '✅ Проверка пройдена!';
                window.hideResult();
                window.initDynamicContent()

            }

        } catch (error) {
            console.error('[HTTP] Ошибка:', error);
            elements.statusBlock.className = 'status-indicator status-error';
            elements.statusBlock.textContent = `❌ Ошибка: ${error.message}`;
            window.hideResult();
        }

    }


    function updateScreenHeight() {
        console.log('--- Вызов updateScreenHeight ---');

        // Проверка наличия элементов
        const heightElement = document.getElementById('screenHeight');
        const widthElement = document.getElementById('screenWidth');

        if (!heightElement || !widthElement) {
            console.error('Элементы не найдены! Проверьте их наличие в DOM');
            return;
        }

        // Получение значений
        const screenHeight = window.innerHeight;
        const screenWidth = window.innerWidth;
        console.log('Получены размеры:', { screenHeight, screenWidth });

        // Обновление данных
        heightElement.textContent = `${screenHeight}px`;
        widthElement.textContent = `${screenWidth}px`;
        console.log('Данные обновлены');
    }

    // Проверка инициализации
    console.log('Скрипт профиля выполняется');
    try {
        updateScreenHeight();
        window.addEventListener('resize', updateScreenHeight);
        console.log('Обработчик resize успешно добавлен');
    } catch (error) {
        console.error('Ошибка инициализации:', error);
    }

});

