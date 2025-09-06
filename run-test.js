const axios = require('axios');
const { exec } = require('child_process');

const slackWebhook = process.env.SLACK_WEBHOOK_URL;
let lastTestFailed = false;

function runTest() {
  console.log('Running Cypress test...');
  
  exec('npx cypress run', async (error, stdout, stderr) => {
    console.log(stdout);
    if (stderr) console.error(stderr);
    
    if (error) {
      console.log('❌ Test FAILED');
      
      // Send Slack notification (only on new failure)
      if (!lastTestFailed) {
        await axios.post(slackWebhook, {
          attachments: [{
            color: "danger",
            title: "🚨 PROD IS DOWN",
            fields: [
              { title: "Status", value: "Test Failed", short: true },
              { title: "Time", value: new Date().toUTCString(), short: true }
            ]
          }]
        });
        console.log('Slack notification sent');
      }
      lastTestFailed = true;
    } else {
      console.log('✅ Test PASSED');
      lastTestFailed = false;
    }
  });
}

// Run every 4 minutes
setInterval(runTest, 4 * 60 * 1000);
runTest(); // Run immediately