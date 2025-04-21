// dynamic.js

/**
 * Инициализация функций для динамического контента
 */
function initDynamicContent() {
    console.log('Инициализация динамического контента');

    // Вешаем обработчики
    window.addEventListener('resize', updateScreenSize);
    updateScreenSize();

    // Другие функции для динамического контента...
}

// Экспорт для использования в других модулях
window.dynamic = { initDynamicContent };