document.addEventListener('DOMContentLoaded', () => {
  let mainContainer = null;
  let detailContainer = null;
  let deletePopup = null;
  let editPopup = null;
  let selectedAffirmationId = null;
  let selectedAffirmationElement = null;
  let savedScrollY = 0;
  let settingsAffirmation = null;
  const tg = window.Telegram?.WebApp;
  const inTelegram = !!tg && tg.initData !== '';

  const editBlock = document.getElementById('editTextAreaBlock');
  const affirmDetail = document.getElementById('affirmDetail');
  const textarea = document.getElementById('editTextArea');

  tg.ready();
  tg.expand();

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
      settingsAffirmation = document.getElementById('settings');
      profileSection = document.getElementById('profileSection');

      // Сохраняем текущий скролл
      savedScrollY = window.pageYOffset || document.documentElement.scrollTop;

      selectedAffirmationElement = section;
      selectedAffirmationId = section.dataset.id;

      // Показываем детали
      mainContainer.classList.add('hidden-container');
      mainContainer.addEventListener(
        'transitionend',
        () => {
          mainContainer.style.display = 'none';
          detailContainer.style.display = 'block';
          detailContainer.classList.add('visible');
          settingsAffirmation.style.display = 'none';
          profileSection.style.display = 'none';

          document.getElementById('affirmQuoteText').textContent =
            section.querySelector('.detail-title').textContent;

          document.getElementById('affirmationId').textContent = `ID: ${selectedAffirmationId}`;

          if (inTelegram) {
            tg.MainButton.show();
            tg.MainButton.setParams({
              text: 'Назад',
              has_shine_effect: false,
              is_visible: true,
              color: '#8774e1',
              position: 'left',
            });
            tg.MainButton.onClick(closeAffirmation);
          } else {
            const backButtonDiv = document.getElementById('backButton');
            const buttonBack = document.createElement('button');

            buttonBack.type = 'button';
            buttonBack.id = 'closeAffirmation';
            buttonBack.innerText = 'Назад';
            buttonBack.classList.add('btn', 'btn-primary', 'btn-md');
            buttonBack.style = '--bs-btn-padding-y: .5rem;';
            buttonBack.onclick = closeAffirmation;
            backButtonDiv.appendChild(buttonBack);
            backButtonDiv.classList.remove('d-none');
          }
        },
        { once: true },
      );
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
      const url = window.location.pathname;
      await confirmDeletion(url);
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
      openEditArea();
      return;
    }

    // Подтвердить редактирование
    if (e.target.closest('#confirmEdit')) {
      await confirmEdit();
      return;
    }

    // Отмена редактирования
    if (e.target.closest('#cancelEdit')) {
      closeEditArea();
      return;
    }

    // Клик вне области редактирования
    if (editPopup && e.target === editPopup) {
      closeEditArea();
      return;
    }
  });

  function closeAffirmation() {
    if (inTelegram) {
      tg.MainButton.hide();
    } else {
      const backButtonDiv = document.getElementById('backButton');
      const buttonBack = document.getElementById('closeAffirmation')?.remove();
      backButtonDiv.classList.add('d-none');
    }
    detailContainer.classList.remove('visible');
    detailContainer.addEventListener(
      'transitionend',
      () => {
        detailContainer.style.display = 'none';
        mainContainer.style.display = 'block';
        mainContainer.classList.remove('hidden-container');
        window.scrollTo(0, savedScrollY);
        settingsAffirmation.style.display = 'block';
        profileSection.style.display = 'block';
      },
      { once: true },
    );

    setTimeout(() => {
      closeEditArea();
    }, 300);
  }

  function openDeletePopup() {
    deletePopup.classList.add('active');
  }

  function closeDeletePopup() {
    deletePopup.classList.remove('active');
  }

  async function confirmDeletion(url) {
    try {
      const response = await fetch(`${url}/${selectedAffirmationId}`, {
        method: 'DELETE',
        credentials: 'same-origin',
        redirect: 'follow',
      });
      if (!response.ok) throw new Error('Ошибка сервера');
      const data = await response.json();
      console.log('Данные:', data);
      if (data.redirect) window.location.href = data.redirect;
    } catch (err) {
      console.error('Ошибка:', err);
      alert('Возникла ошибка при удалении. Попробуйте позже.');
    } finally {
      closeDeletePopup();
    }
  }

  function openEditArea() {
    textarea.value = document.getElementById('affirmationText').textContent;
    // Устанавливаем минимальную высоту и скрываем скролл
    textarea.style.minHeight = '100px';
    textarea.style.overflowY = 'hidden';

    // Подключаем авторазмер
    textarea.removeEventListener('input', () => autoResize(textarea));
    textarea.addEventListener('input', () => autoResize(textarea));
    autoResize(textarea);

    affirmDetail.classList.add('d-none');
    editBlock.classList.remove('d-none');
    textarea.focus();
  }

  function closeEditArea() {
    affirmDetail.classList.remove('d-none');
    textarea.value = '';
    textarea.classList.add('disabled');
    editBlock.classList.add('d-none');
  }

  async function confirmEdit() {
    const newText = textarea.value.trim();
    if (!newText) return;
    try {
      if (!response.ok) throw new Error('Ошибка сервера');
      document.getElementById('affirmationText').textContent = newText;
      selectedAffirmationElement.querySelector('.detail-title').textContent = newText;
      closeEditPopup();
    } catch (err) {
      console.error('Ошибка:', err);
      alert('Временно недоступно');
    }
  }

  /**
   * Скрипт для динамической подгрузки аффирмаций на страницу.
   *
   * Функционал:
   * - Подгрузка аффирмаций по кнопке.
   * - Автозагрузка при скролле, если кнопка видна.
   * - Плавное появление аффирмаций с анимацией.
   * - Дебаунсинг для предотвращения множества запросов.
   * - Учет уже загруженных аффирмаций.
   */

  // Получаем основные элементы страницы
  const button = document.getElementById('loadAffirmationsBtn'); // Кнопка подгрузки
  const container = document.getElementById('affirm-container'); // Контейнер аффирмаций
  const endButton = document.getElementById('endAffirmationsBtn'); // Кнопка конца

  const LIMIT = 15; // Сколько аффирмаций подгружаем за раз
  let offset = 0; // Смещение для пагинации
  let loading = false; // Флаг, что идет загрузка
  let autoLoading = false; // Флаг, что идет автозагрузка
  let allLoaded = false; // Флаг, что все аффирмации загружены
  const loadedIds = new Set(); // Множество загруженных ID для исключения дубликатов

  // -----------------------
  // Инициализация уже существующих элементов
  // -----------------------
  if (container) {
    const existing = container.querySelectorAll('.text-section[data-id]');
    existing.forEach((el) => {
      if (el.dataset.id) loadedIds.add(el.dataset.id);
    });
    offset = loadedIds.size;
  } else {
    console.warn('⚠️ Контейнер не найден');
  }
  // -----------------------
  // Утилита для задержки
  // -----------------------
  function sleep(ms) {
    return new Promise(function (resolve) {
      setTimeout(resolve, ms);
    });
  }

  // -----------------------
  // Проверка, находится ли элемент в области видимости экрана
  // -----------------------
  function isElementInViewport(el) {
    const rect = el.getBoundingClientRect();
    return rect.top < window.innerHeight && rect.bottom > 0;
  }

  // -----------------------
  // Экранирование HTML, чтобы безопасно вставлять текст
  // -----------------------
  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  // -----------------------
  // Загрузка одной порции аффирмаций (batch)
  // -----------------------
  async function loadBatch() {
    if (loading || allLoaded) return false;
    loading = true;

    try {
      button.classList.add('disabled');
      button.classList.remove('btn-primary');
      button.classList.add('btn-outline-primary');
      button.textContent = 'Загружаю...';
      const url = '/api/v2/users/affirmations/?limit=' + LIMIT + '&offset=' + offset;
      const resp = await fetch(url, { credentials: 'same-origin' });

      if (!resp.ok) {
        console.error('HTTP error', resp.status);
        return false;
      }

      const data = await resp.json();

      // Если данных нет, прекращаем подгрузку
      if (!Array.isArray(data.affirmations) || data.affirmations.length === 0) {
        allLoaded = true;
        button.classList.add('disabled');
        button.classList.add('d-none');
        endButton.classList.remove('d-none');
        return false;
      }
      // Перебираем каждую аффирмацию
      data.affirmations.forEach(function (affirmation, index) {
        const id = affirmation.id ? affirmation.id.toString() : null;
        if (id && loadedIds.has(id)) return; // Пропускаем дубликаты
        if (id) loadedIds.add(id);

        // Создаем элемент
        const div = document.createElement('div');
        div.className = 'text-section text-link';
        if (id) div.dataset.id = id;

        // Начальное состояние для анимации
        div.style.opacity = '0';
        div.style.transform = 'translateY(10px)';

        // Заполняем HTML
        div.innerHTML =
          '<div class="text-title">' +
          '<div class="detail-title">' +
          escapeHtml(affirmation.text_task || '') +
          '</div>' +
          '<div class="detail-info" style="padding-left:5px">' +
          '<svg xmlns="http://www.w3.org/2000/svg" width="7" height="12" fill="none" viewBox="0 0 7 12" class="p_ZQ v61B">' +
          '<path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m1 1 5 5-5 5"/>' +
          '</svg></div></div>';

        // Вставляем в контейнер
        container.appendChild(div);

        // Анимация появления с каскадом
        setTimeout(function () {
          requestAnimationFrame(function () {
            div.style.transition = ' transform 0.3s ease';
            div.style.opacity = '1';
            div.style.transform = 'translateY(0)';
          });
        }, index * 50); // Каскад: каждый следующий элемент появляется чуть позже
      });

      button.classList.remove('disabled');
      button.classList.add('btn-primary');
      button.classList.remove('btn-outline-primary');
      button.textContent = 'Загрузить аффирмации';

      offset += data.affirmations.length;
      return true;
    } catch (err) {
      console.error('Fetch error:', err);
      return false;
    } finally {
      await sleep(100); // Минимальная задержка между запросами
      loading = false;
    }
  }

  // -----------------------
  // Автозагрузка, пока кнопка видна
  // -----------------------
  async function autoLoadWhileVisible() {
    if (autoLoading || allLoaded) return;
    autoLoading = true;
    try {
      while (!allLoaded && isElementInViewport(button)) {
        const ok = await loadBatch();
        if (!ok) break;
        await sleep(100);
      }
    } finally {
      autoLoading = false;
    }
  }

  // -----------------------
  // Дебаунсинг вызова автозагрузки при скролле/resize
  // -----------------------
  let debounceTimer = null;
  function tryAutoLoadDebounced() {
    if (debounceTimer) clearTimeout(debounceTimer);
    debounceTimer = setTimeout(function () {
      if (isElementInViewport(button)) autoLoadWhileVisible();
    }, 100);
  }

  // -----------------------
  // IntersectionObserver для автоматической загрузки при появлении кнопки
  // -----------------------
  const observer = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) autoLoadWhileVisible();
      });
    },
    { root: null, rootMargin: '0px 0px 200px 0px', threshold: 0.01 },
  );

  if (button) observer.observe(button);
  else console.warn('⚠️ Кнопка не найдена');

  // -----------------------
  // События scroll и resize для авто-подгрузки
  // -----------------------
  window.addEventListener('scroll', tryAutoLoadDebounced, { passive: true });
  window.addEventListener('resize', tryAutoLoadDebounced);

  // -----------------------
  // Обработчик клика по кнопке
  // -----------------------
  if (button) {
    button.addEventListener('click', async function () {
      // Увеличиваем margin-top при каждом клике
      const currentMargin = parseInt(window.getComputedStyle(button).marginTop) || 0;
      button.style.marginTop = currentMargin + 20 + 'px';

      // Подгружаем следующую порцию
      await loadBatch();
    });

    // -----------------------
    // Первоначальная проверка видимости кнопки и автозагрузка
    // -----------------------
    if (isElementInViewport(button)) autoLoadWhileVisible();
  }

  const timeEl = document.getElementById('timeSending');
  const [hours, minutes] = timeEl.innerText.split(':');
  timeEl.innerText = `${hours}:${minutes}`;

  const sw = document.getElementById('switchSendingChecked');
  const status = document.getElementById('statusSettings');

  const showStatus = (type, text, duration = 5000) => {
    status.className = 'status-indicator';
    status.classList.add('status-' + type);
    status.classList.remove('d-none');
    status.textContent = text;
    status.style.opacity = 1;
    status.parentElement.style.opacity = 1;
    status.style.transform = 'scaleY(1)';

    clearTimeout(status._timer);
    status._timer = setTimeout(() => {
      status.classList.add('d-none');
    }, duration);
  };

  const hideStatusAnimated = (duration = 300) => {
    status.style.opacity = 0;
    status.parentElement.style.opacity = 0;
    status.style.transform = 'scaleY(0)';

    clearTimeout(status._timer);
    status._timer = setTimeout(() => {
      status.classList.add('d-none');
      status.style.transform = 'scaleY(1)';
      status.style.opacity = 1;
      status.parentElement.style.opacity = 1;
    }, duration);
  };

  hideStatusAnimated(0);

  sw.addEventListener('change', async (e) => {
    const el = e.currentTarget;
    const currentState = el.checked;
    el.disabled = true;

    try {
      const response = await fetch('/api/v2/users/affirmations/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ send_enable: el.checked }),
      });

      if (!response.ok) throw new Error('Ошибка: ' + response.status);
      showStatus('success', 'Настройки сохранены');
    } catch (error) {
      el.checked = !el.checked;
      showStatus('error', error.message || 'Ошибка запроса', 10000);
    } finally {
      el.disabled = false;
    }
  });

  const selectCounTasks = document.getElementById('countTasks');
  const saveCountTasksButton = document.getElementById('saveCountTasksButton');
  const currentDisplay = document.querySelector(
    '[data-bs-target="#affirmations-change-count"] span',
  );

  let newValue = selectCounTasks.value;
  const oldValue = selectCounTasks.value;

  const modalEl = document.getElementById('affirmations-change-count');
  const modal = bootstrap.Modal.getOrCreateInstance(modalEl);

  selectCounTasks.addEventListener('change', function () {
    newValue = this.value;
    saveCountTasksButton.disabled = false;
  });

  saveCountTasksButton.addEventListener('click', async function () {
    saveCountTasksButton.disabled = true;
    saveCountTasksButton.textContent = 'Сохранение...';

    try {
      const response = await fetch('/api/v2/users/affirmations/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ count_tasks: parseInt(newValue) }),
      });

      if (!response.ok) throw new Error('Ошибка при обновлении');
      currentDisplay.textContent = newValue;
      showStatus('success', 'Настройки сохранены');
      modal.hide();
    } catch (error) {
      modal.hide();
      showStatus('error', error.message || 'Ошибка запроса', 10000);
      saveCountTasksButton.disabled = true;
    } finally {
      saveCountTasksButton.textContent = 'Сохранить';
    }
  });

  modalEl.addEventListener('hidden.bs.modal', (event) => {
    selectCounTasks.value = currentDisplay.textContent;
  });

  const timeInput = document.getElementById('affirmation-time');
  const saveTimeButton = document.getElementById('saveTimeButton');
  const timeDisplay = document.getElementById('timeSending');
  const modalTimeEl = document.getElementById('affirmations-change-time-sending');
  const modalTime = bootstrap.Modal.getOrCreateInstance(modalTimeEl);

  let newTime = timeInput.value;

  timeInput.addEventListener('change', function () {
    newTime = this.value;
    saveTimeButton.disabled = false;
  });

  saveTimeButton.addEventListener('click', async function () {
    saveTimeButton.disabled = true;
    saveTimeButton.textContent = 'Сохранение...';

    try {
      const response = await fetch('/api/v2/users/affirmations/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ send_time: newTime }),
      });

      if (!response.ok) throw new Error('Ошибка при обновлении');

      timeDisplay.textContent = newTime;
      showStatus('success', 'Настройки сохранены');
      modalTime.hide();
    } catch (error) {
      modalTime.hide();
      showStatus('error', error.message || 'Ошибка запроса', 10000);
      saveTimeButton.disabled = true;
    } finally {
      saveTimeButton.textContent = 'Сохранить';
    }
  });
  modalTimeEl.addEventListener('hidden.bs.modal', (event) => {
    timeInput.value = timeDisplay.textContent;
  });
});
