// Node built-in packages
const http = require('http');

// Instance of our Express app
const app = require('./app');

// use port 3001 by default (for dev phase) or on port specified in the config
const port = process.env.PORT || 3001;

// start Express app
console.log('Starting DayTrack Express app on port ' + port);
app.listen(port);