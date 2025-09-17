const { defineConfig } = require("cypress");
require("dotenv").config();
const fs = require("fs");
const path = require("path");
const xlsx = require("xlsx");

module.exports = defineConfig({
  e2e: {
    baseUrl: "https://uat.kwant.ai",
    chromeWebSecurity: false,
    defaultCommandTimeout: 60000,
    requestTimeout: 60000,
    responseTimeout: 60000,
    pageLoadTimeout: 60000,
    retries: { runMode: 2, openMode: 0 },
    downloadsFolder: path.join(__dirname, "cypress", "downloads"),


    experimentalSessionAndOrigin: true,

    setupNodeEvents(on, config) {
      config.env.EMAIL = process.env.EMAIL;
      config.env.PASSWORD = process.env.PASSWORD;

      // File management tasks
      on("task", {
        getLatestDownloadedFile({ downloadsFolder, prefix = "" }) {
          const files = fs
            .readdirSync(downloadsFolder)
            .filter(f => f.includes(prefix) && (f.endsWith(".csv") || f.endsWith(".xlsx")))
            .map(file => ({
              name: file,
              time: fs.statSync(path.join(downloadsFolder, file)).mtime.getTime(),
            }))
            .sort((a, b) => b.time - a.time);

          // Clean up older files
          files.slice(1).forEach(file => 
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
            .filter(f => f.includes(pattern) && f.endsWith(extension));
          
          filesToDelete.forEach(file => {
            fs.unlinkSync(path.join(downloadsFolder, file));
            console.log(`Deleted: ${file}`);
          });

          return filesToDelete.length;
        },

        deleteFile({ filePath }) {
          if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
          return null;
        },
      });

      return config;
    },
    testIsolation: false,
  },
});
