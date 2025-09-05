const { defineConfig } = require("cypress");
require('dotenv').config(); // Load .env file

module.exports = defineConfig({
  e2e: {
    setupNodeEvents(on, config) {
      //
      config.env.EMAIL = process.env.EMAIL; // Add EMAIL from .env
      config.env.PASSWORD = process.env.PASSWORD; // Add PASSWORD from .env
      return config;
    },
  },
});
