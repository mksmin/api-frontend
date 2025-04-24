document.addEventListener('DOMContentLoaded', () => {
    let mainContainer = null;
    let detailContainer = null;
    let deletePopup = null;
    let editPopup = null;
    let selectedAffirmationId = null;
    let selectedAffirmationElement = null;
    let savedScrollY = 0;

    // Функция автоподстройки высоты textarea
    function autoResize(el) {
        el.style.height = 'auto';
        el.style.height = el.scrollHeight + 'px';
    }

    // Делегированный обработчик кликов
    document.addEventListener('click', async (e) => {
        const section = e.target.closest('.text-section.text-link');
        if (section) {
            // Инициализация контейнеров и попапов при первом клике
            mainContainer = document.getElementById('container-affirm');
            detailContainer = document.getElementById('affirmation');
            deletePopup = document.getElementById('deletePopup');
            editPopup = document.getElementById('editPopup');

            // Сохраняем текущий скролл
            savedScrollY = window.pageYOffset || document.documentElement.scrollTop;

            selectedAffirmationElement = section;
            selectedAffirmationId = section.dataset.id;

            // Показываем детали
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

        // Кнопка "Назад"
        if (e.target.closest('#closeAffirmation')) {
            closeAffirmation();
            return;
        }

        // Кнопка "Удалить"
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

        // Клик вне области удаления
        if (deletePopup && e.target === deletePopup) {
            closeDeletePopup();
            return;
        }

        // Кнопка "Редактировать"
        if (e.target.closest('.edit-btn')) {
            openEditPopup();
            return;
        }

        // Подтвердить редактирование
        if (e.target.closest('#confirmEdit')) {
            await confirmEdit();
            return;
        }

        // Отмена редактирования
        if (e.target.closest('#cancelEdit')) {
            closeEditPopup();
            return;
        }

        // Клик вне области редактирования
        if (editPopup && e.target === editPopup) {
            closeEditPopup();
            return;
        }
    });

    function closeAffirmation() {
        detailContainer.classList.remove('visible');
        detailContainer.addEventListener('transitionend', () => {
            detailContainer.style.display = 'none';
            mainContainer.style.display = 'block';
            mainContainer.classList.remove('hidden-container');
            window.scrollTo(0, savedScrollY);
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
            selectedAffirmationElement.style.opacity = '0';
            setTimeout(() => {
                selectedAffirmationElement.remove();
                closeAffirmation();
            }, 300);
        } catch (err) {
            console.error('Ошибка:', err);
            alert('Не удалось удалить аффирмацию');
        } finally {
            closeDeletePopup();
        }
    }

    function openEditPopup() {
        const textarea = document.getElementById('editTextArea');
        textarea.value = document.getElementById('affirmationText').textContent;
        // Устанавливаем минимальную высоту и скрываем скролл
        textarea.style.minHeight = '100px';
        textarea.style.overflowY = 'hidden';
        // Подключаем авторазмер
        textarea.removeEventListener('input', () => autoResize(textarea));
        textarea.addEventListener('input', () => autoResize(textarea));
        // Первоначальный расчёт размера
        autoResize(textarea);

        editPopup.classList.add('active');
        textarea.focus();
    }

    function closeEditPopup() {
        editPopup.classList.remove('active');
    }

    async function confirmEdit() {
        const textarea = document.getElementById('editTextArea');
        const newText = textarea.value.trim();
        if (!newText) return;
        try {
            const response = await fetch(`/api/affirmations/${selectedAffirmationId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': '123',
                },
                body: JSON.stringify({ text: newText }),
            });
            if (!response.ok) throw new Error('Ошибка сервера');
            document.getElementById('affirmationText').textContent = newText;
            selectedAffirmationElement.querySelector('.detail-title').textContent = newText;
            closeEditPopup();
        } catch (err) {
            console.error('Ошибка:', err);
            alert('Не удалось сохранить изменения');
        }
    }
});