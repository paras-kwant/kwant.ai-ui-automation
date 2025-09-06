const axios = require('axios');
const { exec } = require('child_process');
const util = require('util');
const execPromise = util.promisify(exec);

// Add this to fix port issue
const http = require('http');
const PORT = process.env.PORT || 10000;

const slackWebhook = process.env.SLACK_WEBHOOK_URL;
let lastTestFailed = false;
let testResults = { status: 'Not started', lastRun: null, details: '' };

// Create simple server for Render
const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ 
    status: 'Monitoring running', 
    testResults: testResults,
    slackConfigured: !!slackWebhook,
    uptime: Math.floor(process.uptime()) + ' seconds'
  }));
});

server.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
  console.log(`🔗 Status page: https://kwant-ai-qa.onrender.com`);
  console.log(`📧 Slack webhook configured: ${!!slackWebhook}`);
});

async function runTest() {
  const startTime = new Date();
  console.log('\n===========================================');
  console.log(`🚀 STARTING CYPRESS TEST at ${startTime.toISOString()}`);
  console.log('===========================================');
  
  try {
    console.log('📦 Installing Cypress binary...');
    await execPromise('npx cypress install');
    console.log('✅ Cypress binary installed successfully');
    
    console.log('\n🧪 Running Cypress tests...');
    const { stdout, stderr } = await execPromise('npx cypress run');
    
    // Log all Cypress output
    console.log('\n📊 CYPRESS OUTPUT:');
    console.log('-------------------');
    console.log(stdout);
    if (stderr) {
      console.log('\n⚠️  STDERR:');
      console.log(stderr);
    }
    console.log('-------------------');
    
    console.log('\n✅ ALL TESTS PASSED!');
    console.log(`⏱️  Test duration: ${Date.now() - startTime.getTime()}ms`);
    
    testResults = {
      status: 'PASSED ✅',
      lastRun: new Date().toISOString(),
      details: 'All tests passed successfully'
    };
    
    if (lastTestFailed) {
      console.log('📢 Previous test had failed, but now recovered!');
    }
    lastTestFailed = false;
    
  } catch (error) {
    console.log('\n❌ TESTS FAILED!');
    console.log('-------------------');
    console.log('Error:', error.message);
    if (error.stdout) {
      console.log('\nCypress output:');
      console.log(error.stdout);
    }
    if (error.stderr) {
      console.log('\nStderr:');
      console.log(error.stderr);
    }
    console.log('-------------------');
    
    testResults = {
      status: 'FAILED ❌',
      lastRun: new Date().toISOString(),
      details: error.message
    };
    
    // Send Slack notification only on NEW failure
    if (!lastTestFailed) {
      console.log('\n📨 SENDING SLACK NOTIFICATION (New failure detected)');
      try {
        await axios.post(slackWebhook, {
          attachments: [{
            color: "danger",
            title: "🚨 PROD IS DOWN",
            fields: [
              { title: "Status", value: "Test Failed", short: true },
              { title: "Time", value: new Date().toUTCString(), short: true },
              { title: "Error", value: error.message.substring(0, 100), short: false }
            ]
          }]
        });
        console.log('✅ Slack notification sent successfully!');
      } catch (slackError) {
        console.log('❌ Failed to send Slack notification:', slackError.message);
      }
    } else {
      console.log('📵 Skipping Slack notification (already notified about this failure)');
    }
    
    lastTestFailed = true;
  }
  
  console.log('\n⏰ Next test will run in 4 minutes...');
  console.log('===========================================\n');
}

// Run every 4 minutes
console.log('🔄 Setting up 4-minute interval for tests...');
setInterval(runTest, 4 * 60 * 1000);

// Run immediately on start
console.log('🎬 Starting first test immediately...');
runTest();