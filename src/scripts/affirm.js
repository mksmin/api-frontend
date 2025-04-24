document.addEventListener('DOMContentLoaded', () => {
    let mainContainer = null;
    let detailContainer = null;
    let deletePopup = null;
    let selectedAffirmationId = null;
    let selectedAffirmationElement = null;

    // Единственный обработчик кликов через делегирование
    document.addEventListener('click', async (e) => {
        // Нажатие на аффирмацию
        const section = e.target.closest('.text-section.text-link');
        if (section) {
            // Инициализация контейнеров и попапа при первом клике
            mainContainer = document.getElementById('container-affirm');
            detailContainer = document.getElementById('affirmation');
            deletePopup = document.getElementById('deletePopup');

            selectedAffirmationElement = section;
            selectedAffirmationId = section.dataset.id;

            // Показ детали
            mainContainer.classList.add('hidden-container');
            mainContainer.addEventListener('transitionend', () => {
                mainContainer.style.display = 'none';
                detailContainer.style.display = 'block';
                detailContainer.classList.add('visible');

                document.getElementById('affirmationText').textContent =
                section.querySelector('.detail-title').textContent;
                document.getElementById('affirmationId').textContent = `ID: ${selectedAffirmationId}`;
            }, { once: true });

            return;
        }

        // Нажатие на кнопку "Назад"
        if (e.target.closest('#closeAffirmation')) {
            closeAffirmation();
            return;
        }

        // Нажатие на кнопку "Удалить"
        if (e.target.closest('.delete-btn')) {
            openDeletePopup();
            return;
        }

        // Подтвердить удаление
        if (e.target.closest('#confirmDelete')) {
            await confirmDeletion();
            return;
        }

        // Отмена удаления
        if (e.target.closest('#cancelDelete')) {
            closeDeletePopup();
            return;
        }

        // Клик вне попапа для закрытия
        if (e.target === deletePopup) {
            closeDeletePopup();
            return;
        }
    });

    function closeAffirmation() {
        detailContainer.classList.remove('visible');
        detailContainer.addEventListener('transitionend', () => {
            detailContainer.style.display = 'none';
            mainContainer.style.display = 'block';
            mainContainer.classList.remove('hidden-container');
        }, { once: true });
    }

    function openDeletePopup() {
        deletePopup.classList.add('active');
    }

    function closeDeletePopup() {
        deletePopup.classList.remove('active');
    }

    async function confirmDeletion() {
        try {
            const response = await fetch(`/api/affirmations/${selectedAffirmationId}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': '123',
                },
            });

            if (!response.ok) throw new Error('Ошибка сервера');

            // Анимация удаления
            if (selectedAffirmationElement) {
                selectedAffirmationElement.style.opacity = '0';
                setTimeout(() => {
                    selectedAffirmationElement.remove();
                    closeAffirmation();
                }, 300);
            }
        } catch (err) {
            console.error('Ошибка:', err);
            alert('Не удалось удалить аффирмацию');
        } finally {
            closeDeletePopup();
        }
    }
});
