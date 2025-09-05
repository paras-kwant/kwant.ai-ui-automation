const axios = require('axios');
const { exec } = require('child_process');

const slackWebhook = process.env.SLACK_WEBHOOK_URL;

let lastTestFailed = false;

async function runTest() {
  exec('npx cypress run --spec "cypress/e2e/check_table.cy.js"', async (err, stdout, stderr) => {
    try {
      // Print Cypress output to Render logs
      console.log(stdout);
      if (stderr) console.error(stderr);

      const currentFailed = !!err;

      if (currentFailed && !lastTestFailed) {
        // Notify only on new failure
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

      if (!currentFailed) {
        console.log('Table check passed ✅');
      }

      lastTestFailed = currentFailed;
    } catch (err) {
      await axios.post(slackWebhook, { text: `🚨 Script error: ${err.message}` });
    }
  });
}

// Run every 30 seconds
setInterval(runTest, 30000);
runTest();
