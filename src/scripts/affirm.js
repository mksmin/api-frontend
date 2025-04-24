document.addEventListener('DOMContentLoaded', () => {
    let mainContainer = null;
    let detailContainer = null;
    let selectedAffirmation = null;
    console.log('Script loaded');
    console.log('mainContainer:', mainContainer);

    // Делегирование событий для динамического контента
    document.addEventListener('click', (e) => {
        // Обработка клика по аффирмации
        const section = e.target.closest('.text-section.text-link');
        if (section) {
            mainContainer = document.getElementById('container-affirm');
            detailContainer = document.getElementById('affirmation');
            handleAffirmationClick(section);
        }

        // Обработка клика по кнопке "Назад"
        if (e.target.closest('.back-btn')) {
            closeAffirmation();
        }
    });

    // Функция обработки клика по аффирмации
    function handleAffirmationClick(section) {
        selectedAffirmation = section;
        const taskData = {
            id: section.dataset.id,
            text: section.querySelector('.detail-title').textContent
        };

        // Анимация скрытия основного контейнера
        mainContainer.classList.add('hidden-container');
        mainContainer.addEventListener('transitionend', () => {
            mainContainer.style.display = 'none';
            detailContainer.style.display = 'block';
            void detailContainer.offsetHeight; // Принудительный рефлоу
            detailContainer.classList.add('visible');

            // Заполнение данных
            document.getElementById('affirmationText').textContent = taskData.text;
            document.getElementById('affirmationId').textContent = `ID: ${taskData.id}`;
        }, { once: true });
    }

    // Функция закрытия детального просмотра
    window.closeAffirmation = () => {
        detailContainer.classList.remove('visible');
        detailContainer.addEventListener('transitionend', () => {
            detailContainer.style.display = 'none';
            mainContainer.style.display = 'block';
            void mainContainer.offsetHeight; // Принудительный рефлоу
            mainContainer.classList.remove('hidden-container');
        }, { once: true });
    };

    // Переинициализация для динамического контента
    window.reinitAffirm = () => {
        selectedAffirmation = null;
    };
});