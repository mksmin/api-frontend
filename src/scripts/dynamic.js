// dynamic.js
function initDynamicContent() {
    console.log('Инициализация динамического контента');

    if (typeof window.updateScreenHeight === 'function') {
        window.updateScreenHeight();
        window.addEventListener('resize', window.updateScreenHeight);
    }

    // Добавляем наблюдатель за изменениями DOM
    const observer = new MutationObserver(() => {
        if (document.getElementById('screenHeight')) {
            window.updateScreenHeight();
        }
    });

    observer.observe(document.getElementById('container'), {
        childList: true,
        subtree: true
    });
}

window.dynamic = { initDynamicContent };