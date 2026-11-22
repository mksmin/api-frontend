const workspace = document.querySelector('.lms-workspace');

if (workspace) {
  const activeTab = document.querySelector(
    'nav[aria-label="Разделы проекта"] [aria-current="page"]'
  );
  const tabScroller = activeTab?.closest('.overflow-x-auto');
  if (tabScroller && tabScroller.scrollWidth > tabScroller.clientWidth) {
    const tabBounds = activeTab.getBoundingClientRect();
    const scrollBounds = tabScroller.getBoundingClientRect();
    tabScroller.scrollLeft +=
      tabBounds.left -
      scrollBounds.left -
      (tabScroller.clientWidth - tabBounds.width) / 2;
  }

  const normalize = (value) =>
    value.normalize('NFKC').toLocaleLowerCase('ru').trim();

  workspace.querySelectorAll('[data-lms-open-dialog]').forEach((button) => {
    button.addEventListener('click', () => {
      const dialog = document.getElementById(button.dataset.lmsOpenDialog);
      if (!(dialog instanceof HTMLDialogElement)) return;

      const enrollmentInput = dialog.querySelector(
        '[data-lms-enrollment-uuid]'
      );
      const participantName = dialog.querySelector(
        '[data-lms-participant-name]'
      );
      const flowSelect = dialog.querySelector('[data-lms-transfer-flow]');

      if (enrollmentInput) {
        enrollmentInput.value = button.dataset.enrollmentUuid || '';
      }
      if (participantName) {
        participantName.textContent = button.dataset.participantName || '';
      }
      if (flowSelect) {
        flowSelect.value = '';
        Array.from(flowSelect.options).forEach((option) => {
          option.disabled = option.value === button.dataset.flowUuid;
        });
      }

      dialog.showModal();
    });
  });

  workspace.querySelectorAll('[data-lms-close-dialog]').forEach((button) => {
    button.addEventListener('click', () => button.closest('dialog')?.close());
  });

  workspace.querySelectorAll('dialog').forEach((dialog) => {
    dialog.addEventListener('click', (event) => {
      if (event.target !== dialog) return;
      const bounds = dialog.getBoundingClientRect();
      if (
        event.clientX < bounds.left ||
        event.clientX > bounds.right ||
        event.clientY < bounds.top ||
        event.clientY > bounds.bottom
      ) {
        dialog.close();
      }
    });
  });

  workspace.querySelectorAll('form[data-lms-unavailable]').forEach((form) => {
    form.addEventListener('submit', (event) => event.preventDefault());
    form.querySelectorAll('[type="submit"]').forEach((button) => {
      button.disabled = true;
    });
  });

  workspace.querySelectorAll('[data-lms-filter-scope]').forEach((scope) => {
    const form = scope.querySelector('[data-lms-filter-form]');
    if (!form) return;
    const rows = Array.from(scope.querySelectorAll('[data-lms-filter-row]'));
    const noResults = scope.querySelector('[data-lms-no-results]');
    const visibleCount = scope.querySelector('[data-lms-visible-count]');
    const table = scope.querySelector('.lms-table-scroll');

    const filter = () => {
      const values = {};
      form.querySelectorAll('[data-lms-filter]').forEach((input) => {
        values[input.dataset.lmsFilter] = input.value;
      });

      const query = normalize(values.search || '');
      let visible = 0;
      rows.forEach((row) => {
        const matches =
          (!query || normalize(row.dataset.search || '').includes(query)) &&
          (!values.flow || row.dataset.flow === values.flow) &&
          (!values.status || row.dataset.status === values.status) &&
          (!values['date-from'] || row.dataset.date >= values['date-from']) &&
          (!values['date-to'] || row.dataset.date <= values['date-to']);
        row.hidden = !matches;
        if (matches) visible += 1;
      });

      if (visibleCount) visibleCount.textContent = String(visible);
      if (noResults) noResults.hidden = visible !== 0;
      if (table) table.hidden = visible === 0;
    };

    form.addEventListener('submit', (event) => {
      event.preventDefault();
      filter();
    });
    form.addEventListener('input', filter);
    form.addEventListener('change', filter);
    form.addEventListener('reset', () => window.setTimeout(filter, 0));
    filter();
  });

  workspace.querySelectorAll('[data-lms-session-form]').forEach((form) => {
    const start = form.querySelector('[data-lms-start-time]');
    const end = form.querySelector('[data-lms-end-time]');
    const validate = () => {
      end.setCustomValidity(
        start.value && end.value && end.value <= start.value
          ? 'Время окончания должно быть позже времени начала.'
          : ''
      );
    };
    start.addEventListener('input', validate);
    end.addEventListener('input', validate);
    form.addEventListener('reset', () => window.setTimeout(validate, 0));
  });

  workspace.querySelectorAll('[data-lms-period-form]').forEach((form) => {
    const start = form.querySelector('[data-lms-period-start]');
    const end = form.querySelector('[data-lms-period-end]');
    const validate = () => {
      end.setCustomValidity(
        start.value && end.value && end.value < start.value
          ? 'Дата окончания не может быть раньше даты начала.'
          : ''
      );
    };
    start.addEventListener('input', validate);
    end.addEventListener('input', validate);
    validate();
  });

  workspace.querySelectorAll('input[required]:not([type])').forEach((input) => {
    input.addEventListener('input', () => {
      input.setCustomValidity(
        input.value && !input.value.trim() ? 'Заполни это поле.' : ''
      );
    });
  });

  workspace.querySelectorAll('input[type="file"]').forEach((input) => {
    input.addEventListener('change', () => {
      const file = input.files[0];
      input.setCustomValidity(
        file && !file.name.toLocaleLowerCase().endsWith('.xlsx')
          ? 'Выбери файл в формате XLSX.'
          : ''
      );
    });
  });

  const attendanceForms = Array.from(
    workspace.querySelectorAll('[data-lms-attendance-form]')
  );
  attendanceForms.forEach((form) => {
    const selects = Array.from(form.querySelectorAll('[data-lms-attendance]'));
    const save = form.querySelector('[data-lms-save]');
    const reset = form.querySelector('[data-lms-reset-attendance]');
    const dirtyMessage = form.querySelector('[data-lms-dirty-message]');
    const cleanMessage = form.querySelector('[data-lms-clean-message]');

    const update = () => {
      const counts = { present: 0, absent: 0, unmarked: 0 };
      let changed = 0;
      selects.forEach((select) => {
        select.dataset.status = select.value;
        const key = select.value || 'unmarked';
        counts[key] += 1;
        if (select.value !== select.dataset.originalStatus) changed += 1;
      });
      Object.entries(counts).forEach(([key, value]) => {
        const counter = workspace.querySelector(`[data-lms-count="${key}"]`);
        if (counter) counter.textContent = String(value);
      });
      form.dataset.dirty = changed > 0 ? 'true' : 'false';
      if (save) {
        save.disabled = changed === 0 || form.dataset.lmsSaveEnabled !== 'true';
      }
      if (reset) reset.disabled = changed === 0;
      if (dirtyMessage) {
        dirtyMessage.hidden = changed === 0;
        dirtyMessage.textContent = `Несохранённых изменений: ${changed}`;
      }
      if (cleanMessage) cleanMessage.hidden = changed !== 0;
    };

    form.addEventListener('change', update);
    form.addEventListener('reset', () => window.setTimeout(update, 0));
    form.addEventListener('submit', (event) => {
      if (event.defaultPrevented) return;
      if (
        form.dataset.lmsSaveEnabled !== 'true' ||
        form.dataset.dirty !== 'true'
      ) {
        event.preventDefault();
        return;
      }
      form.dataset.submitting = 'true';
    });
    update();
  });

  window.addEventListener('beforeunload', (event) => {
    if (
      attendanceForms.some(
        (form) =>
          form.dataset.dirty === 'true' && form.dataset.submitting !== 'true'
      )
    ) {
      event.preventDefault();
      event.returnValue = '';
    }
  });
}
