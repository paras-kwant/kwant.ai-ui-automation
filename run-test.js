const axios = require('axios');
const { exec } = require('child_process');

const slackWebhook = process.env.SLACK_WEBHOOK_URL;

async function runTest() {
  try {
    exec('npx cypress run --spec "cypress/e2e/check_table.cy.js"', (err, stdout, stderr) => {
      if (err) {
        axios.post(slackWebhook, { text: `🚨 Cypress script error: ${err.message}` });
        return;
      }
      const totalFailed = stdout.includes('0 failing') ? 0 : 1;
      if (totalFailed > 0) {
        axios.post(slackWebhook, { text: `🚨 Table check failed! Failures: ${totalFailed}` });
      } else {
        console.log('Table check passed ✅');
      }
    });
  } catch (err) {
    await axios.post(slackWebhook, { text: `🚨 Script error: ${err.message}` });
  }
}

// Run every 30 seconds
setInterval(runTest, 30000);
runTest(); // run immediately
const axios = require('axios');
const { exec } = require('child_process');

const slackWebhook = process.env.SLACK_WEBHOOK_URL;

async function runTest() {
  exec('npx cypress run --spec "cypress/e2e/check_table.cy.js"', async (err, stdout, stderr) => {
    try {
      if (err) {
        // Test failed → send Slack notification
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
        return;
      }

      // Test passed
      console.log('Table check passed ✅');
    } catch (err) {
      await axios.post(slackWebhook, { text: `🚨 Script error: ${err.message}` });
    }
  });
}

// Run every 30 seconds
setInterval(runTest, 30000);

// Run immediately on start
runTest();
