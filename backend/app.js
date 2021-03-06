// Packages from NPM
const express = require('express');
const bodyParser = require("body-parser");
const mongoose = require('mongoose');

// REST API routes handlers
const piecesRoutes = require('./routes/pieces-routes');
const authRoutes = require('./routes/auth-routes');


// Connect Mongoose to MongoDB
const mongoUser = 'admin';
// Global variables injected from nodemon.json
const mongoPwd = process.env.MONGO_ATLAS_PASSWORD;
const mongoServer = process.env.MONGO_ATLAS_SERVER;
const dbName = process.env.MONGO_DATABASE_NAME;
mongoose.connect('mongodb+srv://' + mongoUser + ':' + mongoPwd + '@' + mongoServer + '/' + dbName)
    .then(() => {
        console.log("Connection to MongoDB succeeded.")
    }).catch(() => {
        console.log("Connection issue !");
    });

// create the express app
const app = express();


/*
 * Express middleware can be called with :
 *  - app.use()  to apply it for every verb
 *  - app.get() / app.post() ... to apply only for a specific verb
 * All these functions can take a URL as 1st argument to only apply for this URL
 *
 * Express applies the middleware in the order they are defined.
 * From one middleware, call next() to jump to the next middleware.
 * If a middleware handles the query then it does not call next() but sends a response.
 */


// Express middleware to parse the POST/PUT requests body and make it available under request.body
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());


// first custom middleware to apply some common headers
app.use((request, response, next) => {
    console.log('Middleware [init] ' + request.originalUrl);

    // All responses will be on JSON format
    response.setHeader('Content-Type', 'application/json');
    // CORS header to allow Cross Origin Resource Sharing (when backend and frontend run on different ports)
    response.setHeader('Access-Control-Allow-Origin', '*');
    // need to allow OPTIONS that is implicitely sent by Angular to check POST validity
    response.setHeader('Access-Control-Allow-Methods', 'GET, PUT, POST, PATCH, DELETE, OPTIONS');
    response.setHeader('Access-Control-Allow-Headers',
        'Origin, ' +
        'Accept, ' +
        'X-Requested-With, ' +
        'Content-Type, ' +
        'Authorization, ' +
        'Access-Control-Allow-Origin, ' +
        'Access-Control-Allow-Methods, ' +
        'Access-Control-Allow-Origin');
    // jump to the next middleware
    next();
});


// REST API routes handlers
app.use('/api/pieces', piecesRoutes);
app.use('/api/auth', authRoutes);


// Fallback middleware called when no other middleware could handle the request
app.use(
    (request, response, _next) => {
        const message = 'No middleware found to handle request URL ' + request.originalUrl;
        console.log(message);
        response.status(404).json({
            message: message
        });
    }
);

// export the Express app to be used in server.js
module.exports = app;