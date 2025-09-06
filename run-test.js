const axios = require('axios');
const { exec } = require('child_process');
const util = require('util');
const execPromise = util.promisify(exec);

// Add this to fix port issue
const http = require('http');
const PORT = process.env.PORT || 10000;

// Create simple server for Render
const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ 
    status: 'Monitoring running', 
    lastTest: lastTestFailed ? 'FAILED' : 'PASSED',
    uptime: process.uptime() 
  }));
});

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

const slackWebhook = process.env.SLACK_WEBHOOK_URL;
let lastTestFailed = false;

async function runTest() {
  try {
    console.log('Installing Cypress binary...');
    await execPromise('npx cypress install');
    
    console.log('Running Cypress test...');
    await execPromise('npx cypress run');
    
    console.log('✅ Test PASSED');
    lastTestFailed = false;
    
  } catch (error) {
    console.log('❌ Test FAILED');
    
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
  }
}

// Run every 4 minutes
setInterval(runTest, 4 * 60 * 1000);
runTest();