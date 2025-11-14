export const CONFIG = {
    API: {
        BASE_URL: '/api/v2/users/affirmations',
        SETTINGS_URL: '/api/v2/users/affirmations/settings',
        TIMEOUT: 30000,
    },


    PAGINATION: {
        LIMIT: 15,
        INITIAL_OFFSET: 0,
    },

    ANIMATION: {
        CASCADE_DELAY: 50,
        TRANSITION_DURATION: 300,
        STATUS_DISPLAY_DURATION: 5000,
    },

    TELEGRAM: {
        MAIN_BUTTON_COLOR: '#8774e1',
    },

};


export const MESSAGES = {
    ERROR: {
        SERVER: 'Ошибка сервера',
        DELETE: 'Возникла ошибка при удалении. Попробуйте позже.',
        UPDATE: 'Ошибка при обновлении',
        TEMPORARILY_UNAVAILABLE: 'Временно недоступно',
        REQUEST: 'Ошибка запроса',
    },

    SUCCESS: {
        SETTINGS_SAVED: 'Настройки сохранены',
    },

    BUTTON_TEXT: {
        BACK: 'Назад',
        LOADING: 'Загружаю...',
        LOAD_AFFIRMATIONS: 'Загрузить аффирмации',
        SAVING: 'Сохранение...',
        SAVE: 'Сохранить',
    },
};