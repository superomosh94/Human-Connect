// Application constants
module.exports = {
    // XP and Leveling
    XP_PER_LEVEL: 500,
    DEFAULT_XP_REWARD: 100,
    DRILL_XP: 20,
    SIMULATION_XP: 50,
    JOURNAL_XP: 30,

    // Simulation
    SIMULATION_HISTORY_LIMIT: 10,
    MAX_MESSAGE_LENGTH: 1000,

    // Validation
    MIN_USERNAME_LENGTH: 2,
    MAX_USERNAME_LENGTH: 50,
    MIN_PASSWORD_LENGTH: 6,
    MAX_PASSWORD_LENGTH: 128,
    MAX_BIO_LENGTH: 500,
    MAX_JOURNAL_TITLE: 255,
    MAX_JOURNAL_CONTENT: 10000,
    MAX_COMMENT_LENGTH: 1000,

    // AI Configuration
    AI_MODEL: 'llama-3.1-8b-instant',
    AI_TEMPERATURE: 0.7,
    AI_MAX_TOKENS: 1000,

    // Score ranges
    MIN_SCORE: 1,
    MAX_SCORE: 4,

    // Pagination
    DEFAULT_PAGE_SIZE: 20,
    MAX_PAGE_SIZE: 100
};
