const { defineConfig } = require("cypress");

module.exports = defineConfig({
  projectId: 'iwk3o6',
  e2e: {
    specPattern: 'payment_gateway/cypress/integration/**/*.js',
    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
  },
});
