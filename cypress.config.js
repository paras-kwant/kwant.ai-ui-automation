const { defineConfig } = require("cypress");
require("dotenv").config();
const fs = require("fs");
const path = require("path");
const xlsx = require("xlsx");
const allureWriter = require("@shelex/cypress-allure-plugin/writer");
const Imap = require('imap-simple'); // Add this

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

        // ✅ NEW: Check Gmail using IMAP (永久有效 - Never expires!)
        async checkCompanyGmail({ subject, maxWaitTime = 60000 }) {
          const imapConfig = {
            imap: {
              user: process.env.GMAIL_USER, // paras@kwant.ai
              password: process.env.GMAIL_APP_PASSWORD, // cvplaxhkdhumxpfh
              host: 'imap.gmail.com',
              port: 993,
              tls: true,
              tlsOptions: { rejectUnauthorized: false }
            }
          };

          const startTime = Date.now();
          
          while (Date.now() - startTime < maxWaitTime) {
            try {
              console.log('🔍 Checking Gmail inbox...');
              const connection = await Imap.connect(imapConfig);
              await connection.openBox('INBOX');
              
              // Search for recent emails with subject
              const searchCriteria = [
                ['SINCE', new Date(Date.now() - 10 * 60 * 1000)], // Last 10 minutes
                ['SUBJECT', subject]
              ];
              
              const fetchOptions = {
                bodies: ['HEADER', 'TEXT'],
                markSeen: false
              };
              
              const messages = await connection.search(searchCriteria, fetchOptions);
              connection.end();
              
              if (messages && messages.length > 0) {
                console.log(`✅ Email found! Subject: "${subject}"`);
                return true;
              }
              
              const elapsed = Math.round((Date.now() - startTime) / 1000);
              console.log(`⏳ Waiting for email... (${elapsed}s elapsed)`);
              
              await new Promise(resolve => setTimeout(resolve, 3000));
              
            } catch (error) {
              console.error('❌ Gmail check error:', error.message);
              await new Promise(resolve => setTimeout(resolve, 3000));
            }
          }
          
          console.log(`❌ Email not found after ${maxWaitTime / 1000}s`);
          return false;
        },

        // 🐛 DEBUG: List all recent emails (no subject filter)
        async listRecentEmails() {
          const imapConfig = {
            imap: {
              user: process.env.GMAIL_USER,
              password: process.env.GMAIL_APP_PASSWORD,
              host: 'imap.gmail.com',
              port: 993,
              tls: true,
              tlsOptions: { rejectUnauthorized: false }
            }
          };

          try {
            console.log('🔍 Fetching all recent emails...');
            const connection = await Imap.connect(imapConfig);
            await connection.openBox('INBOX');
            
            // Get emails from last 30 minutes
            const searchCriteria = [
              ['SINCE', new Date(Date.now() - 30 * 60 * 1000)]
            ];
            
            const fetchOptions = {
              bodies: ['HEADER'],
              markSeen: false
            };
            
            const messages = await connection.search(searchCriteria, fetchOptions);
            connection.end();
            
            const emailList = messages.map(msg => {
              const headers = msg.parts.find(p => p.which === 'HEADER').body;
              return {
                subject: headers.subject ? headers.subject[0] : 'No Subject',
                from: headers.from ? headers.from[0] : 'Unknown',
                date: headers.date ? headers.date[0] : 'Unknown'
              };
            });
            
            console.log(`✅ Found ${emailList.length} recent emails`);
            return emailList;
          } catch (error) {
            console.error('❌ Error listing emails:', error.message);
            return [];
          }
        },

        // 🐛 DEBUG: Get most recent email (any subject)
        async getMostRecentEmail() {
          const imapConfig = {
            imap: {
              user: process.env.GMAIL_USER,
              password: process.env.GMAIL_APP_PASSWORD,
              host: 'imap.gmail.com',
              port: 993,
              tls: true,
              tlsOptions: { rejectUnauthorized: false }
            }
          };

          try {
            const connection = await Imap.connect(imapConfig);
            await connection.openBox('INBOX');
            
            const searchCriteria = [
              ['SINCE', new Date(Date.now() - 30 * 60 * 1000)]
            ];
            
            const fetchOptions = {
              bodies: ['HEADER', 'TEXT', ''],
              markSeen: false
            };
            
            const messages = await connection.search(searchCriteria, fetchOptions);
            connection.end();
            
            if (messages && messages.length > 0) {
              // Get the most recent (last in array)
              const message = messages[messages.length - 1];
              const parts = message.parts;
              
              let body = '';
              let headers = {};
              
              parts.forEach(part => {
                if (part.which === 'TEXT' || part.which === '') {
                  body += part.body;
                }
                if (part.which === 'HEADER') {
                  headers = part.body;
                }
              });
              
              return {
                subject: headers.subject ? headers.subject[0] : '',
                from: headers.from ? headers.from[0] : '',
                body: body,
                date: headers.date ? headers.date[0] : ''
              };
            }
            
            return null;
          } catch (error) {
            console.error('❌ Error getting most recent email:', error.message);
            return null;
          }
        },

        // ✅ NEW: Get email content from Gmail
        async getCompanyGmailContent({ subject }) {
          const imapConfig = {
            imap: {
              user: process.env.GMAIL_USER,
              password: process.env.GMAIL_APP_PASSWORD,
              host: 'imap.gmail.com',
              port: 993,
              tls: true,
              tlsOptions: { rejectUnauthorized: false }
            }
          };

          try {
            console.log('📧 Fetching email content...');
            const connection = await Imap.connect(imapConfig);
            await connection.openBox('INBOX');
            
            const searchCriteria = [
              ['SINCE', new Date(Date.now() - 10 * 60 * 1000)],
              ['SUBJECT', subject]
            ];
            
            const fetchOptions = {
              bodies: ['HEADER', 'TEXT', ''],
              markSeen: false
            };
            
            const messages = await connection.search(searchCriteria, fetchOptions);
            connection.end();
            
            if (messages && messages.length > 0) {
              const message = messages[0];
              const parts = message.parts;
              
              let body = '';
              let headers = {};
              
              parts.forEach(part => {
                if (part.which === 'TEXT' || part.which === '') {
                  body += part.body;
                }
                if (part.which === 'HEADER') {
                  headers = part.body;
                }
              });
              
              console.log('✅ Email content retrieved');
              
              return {
                subject: headers.subject ? headers.subject[0] : '',
                from: headers.from ? headers.from[0] : '',
                body: body,
                date: headers.date ? headers.date[0] : ''
              };
            }
            
            return null;
          } catch (error) {
            console.error('❌ Error fetching email:', error.message);
            return null;
          }
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