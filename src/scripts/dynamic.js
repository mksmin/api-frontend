// dynamic.js

/**
 * Инициализация функций для динамического контента
 */

function initDynamicContent() {
    console.log('Инициализация динамического контента');

    // Вызываем обновление размеров
    if (typeof window.updateScreenHeight === 'function') {
        window.updateScreenHeight();
        window.addEventListener('resize', window.updateScreenHeight);
    } else {
        console.error('Функция updateScreenHeight не найдена!');
    }

    // Другие инициализации...
}
// Экспорт для использования в других модулях
window.dynamic = { initDynamicContent };