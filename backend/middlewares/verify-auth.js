const jwt = require('jsonwebtoken');
const httpCodes = require('../http-codes');


/**
 * Middleware to check the validity of the JSON web token attached to the request
 * If the token is valid, it attaches the user info to the request
 * This info will be used to ensure the user only deletes his own posts for ex
 * It is better than taking the user from the HTTP request because it can not be altered
 *
 * A middleware is just a JS file that exports a function to apply
 * to the incoming request
 */


module.exports = (request, result, next) => {
    try {
        console.log('Middleware [verifyAuth] ' + request.originalUrl);

        // look for the JWT token in the "Authorization" header of the request
        const token = request.headers.authorization;

        // ensure it is not altered (throws if error)
        const decodedToken = jwt.verify(token, process.env.JWT_ENCRYPTION_KEY);

        // enrich the request with the auth info
        request.auth = decodedToken;

        // token is valid, continue to the next middleware
        next();

    } catch (error) {
        console.warn('Authentication failed');
        return result.status(httpCodes.UNAUTHORIZED).json({
            errorType: "Authentication",
            message: "The authentication token is missing, expired or invalid. Please login first."
        });
    }
};