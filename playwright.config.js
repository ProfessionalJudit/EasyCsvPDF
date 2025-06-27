// playwright.config.js
/** @type {import('@playwright/test').PlaywrightTestConfig} */
const config = {
    testIgnore: ['jest-tests/**'],
    use: {
        headless: false,  // <--- Aquí deshabilitas headless
        slowMo: 50,       // Opcional: para ralentizar un poco y ver lo que pasa
    },
};

module.exports = config;
