const { defineConfig } = require("cypress");
require("dotenv").config();
const fs = require("fs");
const path = require("path");
const xlsx = require("xlsx");
const allureWriter = require("@shelex/cypress-allure-plugin/writer");
const { google } = require("googleapis");

module.exports = defineConfig({
  e2e: {
    baseUrl: "https://uat.kwant.ai",
    chromeWebSecurity: false,
    defaultCommandTimeout: 30000,
    requestTimeout: 30000,
    responseTimeout: 30000,
    pageLoadTimeout: 30000,
    retries: { runMode: 2, openMode: 0 },
    downloadsFolder: path.join(__dirname, "cypress", "downloads"),
    testIsolation: false,

    setupNodeEvents(on, config) {
      // Clean allure-results before test run
      on('before:run', () => {
        const allureResultsPath = path.join(__dirname, 'allure-results');
        if (fs.existsSync(allureResultsPath)) {
          fs.rmSync(allureResultsPath, { recursive: true, force: true });
          console.log('🧹 Cleaned old allure-results');
        }
      });

      // Allure plugin
      allureWriter(on, config);

      // Environment variables
      config.env.EMAIL = process.env.EMAIL;
      config.env.PASSWORD = process.env.PASSWORD;

      // File management & Gmail tasks
      on("task", {
        getLatestDownloadedFile({ downloadsFolder, prefix = "" }) {
          const files = fs
            .readdirSync(downloadsFolder)
            .filter(
              (f) =>
                f.includes(prefix) &&
                (f.endsWith(".csv") || f.endsWith(".xlsx"))
            )
            .map((file) => ({
              name: file,
              time: fs.statSync(path.join(downloadsFolder, file)).mtime.getTime(),
            }))
            .sort((a, b) => b.time - a.time);

          files.slice(1).forEach((file) =>
            fs.unlinkSync(path.join(downloadsFolder, file.name))
          );

          return files[0]?.name || null;
        },

        parseExcel({ filePath }) {
          const workbook = xlsx.readFile(filePath);
          const sheet = workbook.Sheets[workbook.SheetNames[0]];
          return xlsx.utils.sheet_to_json(sheet, { header: 1 });
        },

        deleteDownloadedFiles({ downloadsFolder, pattern, extension }) {
          if (!fs.existsSync(downloadsFolder)) return 0;

          const filesToDelete = fs
            .readdirSync(downloadsFolder)
            .filter((f) => f.includes(pattern) && f.endsWith(extension));

          filesToDelete.forEach((file) => fs.unlinkSync(path.join(downloadsFolder, file)));

          return filesToDelete.length;
        },

        deleteFile({ filePath }) {
          if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
          return null;
        },

        // ✅ Gmail check task
        async checkGmail({ recipient, subject, maxWaitTime = 60000 }) {
          const oauth2Client = new google.auth.OAuth2(
            process.env.GMAIL_CLIENT_ID,
            process.env.GMAIL_CLIENT_SECRET,
            process.env.GMAIL_REDIRECT_URI
          );

          oauth2Client.setCredentials({
            refresh_token: process.env.GMAIL_REFRESH_TOKEN
          });

          const gmail = google.gmail({ version: "v1", auth: oauth2Client });
          const startTime = Date.now();
          const interval = 3000;

          while (Date.now() - startTime < maxWaitTime) {
            const res = await gmail.users.messages.list({
              userId: "me",
              q: `to:${recipient} subject:${subject} newer_than:5m`,
              maxResults: 10,
            });

            if (res.data.messages?.length > 0) return true;
            await new Promise(r => setTimeout(r, interval));
          }

          return false;
        }
      });

      return config;
    },

    env: {
      allure: true,
      allureResultsPath: "allure-results",
      allureSkipCommands: "wrap",
      allureAddVideoOnPass: false,
      allureSkipAutomaticScreenshots: false,
      allureLogCypress: false,
    },
  },
});
