document.addEventListener('DOMContentLoaded', () => {
    let mainContainer = null;
    let detailContainer = null;
    let deletePopup = null;
    let confirmDeleteBtn = null;
    let cancelDeleteBtn = null;
    let closeAffirmationBtn = null;

    let selectedAffirmationId = null;
    let selectedAffirmationElement = null;

    // Делегирование событий
    document.addEventListener('click', (e) => {
        const section = e.target.closest('.text-section.text-link');
        if (section) {
            mainContainer = document.getElementById('container-affirm');
            detailContainer = document.getElementById('affirmation');
            deletePopup = document.getElementById('deletePopup');
            confirmDeleteBtn = document.getElementById('confirmDelete');
            cancelDeleteBtn = document.getElementById('cancelDelete');
            closeAffirmationBtn = document.getElementById('closeAffirmation');
            handleAffirmationClick(section);
        }

        if (e.target.closest('.back-btn')) {
            closeAffirmation();
        }
    });

    // Обработчик клика по аффирмации
    function handleAffirmationClick(section) {
        selectedAffirmationElement = section;
        selectedAffirmationId = section.dataset.id;

        mainContainer.classList.add('hidden-container');
        mainContainer.addEventListener('transitionend', () => {
            mainContainer.style.display = 'none';
            detailContainer.style.display = 'block';
            detailContainer.classList.add('visible');

            document.getElementById('affirmationText').textContent =
            section.querySelector('.detail-title').textContent;
            document.getElementById('affirmationId').textContent = `ID: ${selectedAffirmationId}`;
        }, { once: true });
    }

    // Удаление аффирмации
    window.deleteAffirmation = () => {
        deletePopup.classList.add('active');
    };

    // Подтверждение удаления
    confirmDeleteBtn.addEventListener('click', async () => {
        try {
            const response = await fetch(`/api/affirmations/${selectedAffirmationId}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': getCSRFToken(),
                },
            });

            if (!response.ok) throw new Error('Ошибка сервера');

            if (selectedAffirmationElement) {
                selectedAffirmationElement.style.opacity = '0';
                setTimeout(() => {
                    selectedAffirmationElement.remove();
                    closeAffirmation();
                }, 300);
            }

            deletePopup.classList.remove('active');

        } catch (error) {
            console.error('Ошибка:', error);
            alert('Не удалось удалить аффирмацию');
            deletePopup.classList.remove('active');
        }
    });

    // Отмена удаления
    cancelDeleteBtn.addEventListener('click', () => {
        deletePopup.classList.remove('active');
    });

    // Закрытие попапа по клику вне области
    deletePopup.addEventListener('click', (e) => {
        if (e.target === deletePopup) {
            deletePopup.classList.remove('active');
        }
    });

    // Закрытие окна деталей
    closeAffirmation.addEventListener('click', () => {
        detailContainer.classList.remove('visible');
        detailContainer.addEventListener('transitionend', () => {
            detailContainer.style.display = 'none';
            mainContainer.style.display = 'block';
            mainContainer.classList.remove('hidden-container');
        }, { once: true });
    });
});

// Получение CSRF-токена (для Django)
function getCSRFToken() {
    return document.querySelector('[name=csrfmiddlewaretoken]').value;
}