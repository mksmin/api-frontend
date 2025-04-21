// dynamic.js
function initDynamicContent() {
    console.log('Инициализация динамического контента');

    if (typeof window.updateScreenHeight === 'function') {
        window.updateScreenHeight();
        window.addEventListener('resize', window.updateScreenHeight);
    }

    // Добавляем наблюдатель за изменениями DOM
    if (document.getElementById('screenHeight')) {
        window.updateScreenHeight();
    }

}

window.dynamic = { initDynamicContent };