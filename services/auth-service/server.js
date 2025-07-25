const App = require('./src/app');

// Create and initialize the application
const app = new App();

// Start the application
app.init().catch(error => {
  console.error('Failed to start application:', error);
  process.exit(1);
});

// Export for testing
module.exports = app.getApp();