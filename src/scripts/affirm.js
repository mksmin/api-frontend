// affirm.js
function initAffirmHandlers() {
    // Делегирование кликов для аффирмаций
    document.addEventListener('click', (e) => {
        const section = e.target.closest('.text-section.text-link');
        if (section) {
            handleAffirmationClick(section);
        }

        if (e.target.closest('.back-btn')) {
            closeAffirmation();
        }
    });
}

function handleAffirmationClick(section) {
    const mainContainer = document.getElementById('container-affrim');
    const detailContainer = document.getElementById('affirmation');
    const taskData = {
        id: section.dataset.id,
        text: section.querySelector('.detail-title').textContent
    };

    // Анимация перехода
    mainContainer.classList.add('hidden-container');
    mainContainer.addEventListener('transitionend', () => {
        mainContainer.style.display = 'none';
        detailContainer.style.display = 'block';
        detailContainer.classList.add('visible');
        document.getElementById('affirmationText').textContent = taskData.text;
        document.getElementById('affirmationId').textContent = `ID: ${taskData.id}`;
    }, { once: true });
}

// Экспортируем функцию для переинициализации
window.reinitAffirm = () => {
    initAffirmHandlers();
};

// Инициализация при загрузке
document.addEventListener('DOMContentLoaded', () => {
    initAffirmHandlers();
});