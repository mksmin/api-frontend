document.addEventListener('DOMContentLoaded', () => {
    let selectedAffirmation = null;
    const mainContainer = document.getElementById('container');
    const detailContainer = document.getElementById('affirmation');

    // Обработчик клика по аффирмациям
    document.querySelectorAll('.text-section').forEach(item => {
        item.addEventListener('click', function() {
            selectedAffirmation = this;

            // Запуск анимации скрытия основного контейнера
            mainContainer.classList.add('hidden-container');
            const taskData = {
                id: this.dataset.id,
            }

            // Обработчик завершения анимации
            const handleTransitionEnd = () => {
                mainContainer.style.display = 'none';
                detailContainer.style.display = 'block';
                // Принудительный рефлоу для запуска анимации
                void detailContainer.offsetHeight;
                detailContainer.classList.add('visible');

                // Заполнение данных
                document.getElementById('affirmationText').textContent =
                this.querySelector('.detail-title').textContent;
                document.getElementById('affirmationId').textContent = `ID: ${taskData.id}`;

                mainContainer.removeEventListener('transitionend', handleTransitionEnd);
            };

            mainContainer.addEventListener('transitionend', handleTransitionEnd);
        });
    });

    // Функция закрытия
    window.closeAffirmation = () => {
        detailContainer.classList.remove('visible');

        const handleDetailTransitionEnd = () => {
            detailContainer.style.display = 'none';
            mainContainer.style.display = 'block';
            // Принудительный рефлоу для запуска анимации
            void mainContainer.offsetHeight;
            mainContainer.classList.remove('hidden-container');

            detailContainer.removeEventListener('transitionend', handleDetailTransitionEnd);
        };

        detailContainer.addEventListener('transitionend', handleDetailTransitionEnd);
    };
});