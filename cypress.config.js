const { defineConfig } = require("cypress");
require('dotenv').config();

module.exports = defineConfig({
  e2e: {
    setupNodeEvents(on, config) {
      config.env.EMAIL = process.env.EMAIL;
      config.env.PASSWORD = process.env.PASSWORD;
      return config;
    },
    
    defaultCommandTimeout: 60000,
    requestTimeout: 60000,
    responseTimeout: 60000,
    pageLoadTimeout: 60000,
    
    baseUrl: 'https://app.kwant.ai',
    
    retries: {
      runMode: 2,
      openMode: 1
    }
  },
});