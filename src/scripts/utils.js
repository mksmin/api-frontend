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
                this.style.transform = 'scale(0)';

                this.addEventListener('transitionend', function() {
                    this.remove();
                    window.elements.statusBlock = null;
                }, { once: true });
            });
        }, 5000);
    };

    window.updateScreenHeight = () => {
        const heightElement = document.getElementById('screenHeight');
        const widthElement = document.getElementById('screenWidth');

        if (!heightElement || !widthElement) {
            console.error('Элементы не найдены!');
            return;
        }

        const screenHeight = window.innerHeight;
        const screenWidth = window.innerWidth;

        heightElement.textContent = `${screenHeight}px`;
        widthElement.textContent = `${screenWidth}px`;
    }

    window.dynamicLoadContent = async () => {
        try {
            const currentPath = window.location.pathname;
            const encodedPath = encodeURIComponent(currentPath);

            const response = await fetch(`/content?page=${encodedPath}`, {
                method: "GET",
            });

            const data = await response.text();

            if (response.status === 200) {
                document.getElementById('container').innerHTML = data;
                window.elements.statusBlock.className = 'status-indicator status-success';
                window.elements.statusBlock.textContent = '✅ Проверка пройдена!';
                window.hideResult();

                // Вызываем через задержку для гарантии рендера
                setTimeout(() => window.dynamic.initDynamicContent(), 50);
            }

        } catch (error) {
            console.error('[HTTP] Ошибка:', error);
            elements.statusBlock.className = 'status-indicator status-error';
            elements.statusBlock.textContent = `❌ Ошибка: ${error.message}`;
            window.hideResult();
        }
    }

    // Первичная инициализация
    try {
        window.updateScreenHeight();
        window.addEventListener('resize', window.updateScreenHeight);
    } catch (error) {
        console.error('Ошибка инициализации:', error);
    }
});