const axios = require('axios');
const { exec } = require('child_process');
const util = require('util');
const execPromise = util.promisify(exec);

const slackWebhook = process.env.SLACK_WEBHOOK_URL;
let lastTestFailed = false;

async function runTest() {
  try {
    // Install Cypress binary first (fixes your Render error)
    console.log('Ensuring Cypress binary is installed...');
    await execPromise('npx cypress install');
    
    // Run your test
    const { stdout, stderr } = await execPromise('npx cypress run --spec "cypress/e2e/check_table.cy.js"');
    
    console.log(stdout);
    if (stderr) console.error(stderr);
    
    console.log('Table check passed ✅');
    lastTestFailed = false;
    
  } catch (err) {
    console.error('Test failed:', err.message);
    
    if (!lastTestFailed) {
      const payload = {
        attachments: [
          {
            color: "danger",
            title: "🚨 PROD IS DOWN",
            fields: [
              { title: "Status", value: "Test Failed", short: true },
              { title: "Last Checked", value: new Date().toUTCString(), short: true }
            ]
          }
        ]
      };
      await axios.post(slackWebhook, payload);
      console.log("Slack notification sent due to failure.");
    }
    
    lastTestFailed = true;
  }
}

// Run every 4 minutes (changed from 30 seconds)
setInterval(runTest, 4 * 60 * 1000);
runTest();