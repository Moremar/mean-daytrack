// external imports
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const httpCodes = require('../http-codes');

// internal imports
const User = require('../models/user'); // Mongoose model for MongoDB User collection

/*
 * This controller groups all custom middlewares used for auth related endpoints
 * These middlewares are called from the auth routes files (auth-routes.js)
 * We could instead define directly these middlewares in the routes file, but moving
 * them to a dedicated controller file makes the routes file easier to read
 *
 * Notes :
 *  - All error messages are very explicit to make testing easier.
 *    In a real app we should stick to a generic "Invalid credentials" to not give hints on the
 *    existence or not of a user with a given email and of course remove logs showing the password.
 *  - Only the hash should be stored, not the password.
 *    For now we store the password and return it in the "user" object of the API for easy testing
 *    The GUI does not use it and it should be removed once stable
 */

exports.signupUser = (request, response, _next) => {
    console.log('Middleware [signupUser] ' + request.originalUrl);
    const email = request.body.email;
    const password = request.body.password;
    console.log('DEBUG - Create user ' + email + "/" + password);

    if (email === undefined || password === undefined) {
        return response.status(httpCodes.BAD_REQUEST).json({
            errorType: 'Invalid credentials',
            errorMessage: 'An email and a password are needed to signup'
        });
    }

    const salt = +process.env.BCRYPT_SALT; // stored as a string in the env variables
    bcrypt.hash(password, salt).then(
        (hash) => {
            // check no other user with this email
            User.findOne({ email: email }).then(
                (existingUser) => {
                    if (existingUser) {
                        const errorMess = 'There is already an account with email ' + email;
                        console.log('ERROR - ' + errorMess)
                        response.status(httpCodes.BAD_REQUEST).json({
                            errorType: 'Invalid credentials',
                            errorMessage: errorMess,
                        });
                        return;
                    }
                    // the account does not exist, create it
                    const newUser = new User({
                        email: email,
                        password: password, // TODO remove
                        hash: hash
                    });
                    newUser.save().then(
                        (createdUser) => {
                            response.status(httpCodes.CREATED).json({
                                message: "New user successfully created",
                                user: {
                                    // do not send password and hash
                                    _id: createdUser._id,
                                    email: createdUser.email,
                                    password: createdUser.password // TODO remove
                                }
                            });
                        }
                    );
                }
            );
        }
    );
};


exports.loginUser = (request, response, _next) => {
    console.log('Middleware [loginUser] ' + request.originalUrl);
    const email = request.body.email;
    const password = request.body.password;
    console.log('DEBUG - Login with user ' + email + '/' + password);

    if (email === undefined || password === undefined) {
        return response.status(httpCodes.BAD_REQUEST).json({
            errorType: 'Invalid credentials',
            errorMessage: 'An email and a password are needed to login'
        });
    }

    // get the user from MongoDB
    User.findOne({ email: email })
        .then((user) => {
            if (!user) {
                // no user found with the specified email
                const errorMess = 'No user found with email ' + email; // TODO turn into a generic credentials message once stable
                console.log('ERROR - ' + errorMess)
                return response.status(httpCodes.BAD_REQUEST).json({
                    errorType: 'Invalid credentials',
                    errorMessage: errorMess
                });
            }
            bcrypt.compare(password, user.hash)
                .then((bcryptValid) => {
                    if (bcryptValid) {
                        // generate a Web Token
                        const jwtToken = jwt.sign(
                            // object to include in the token
                            { userId: user._id, email: user.email },
                            // key for the JWT encryption
                            process.env.JWT_ENCRYPTION_KEY,
                            // token options
                            { expiresIn: "1h" }
                        );
                        return response.status(httpCodes.SUCCESS).json({
                            message: 'Login user successfully.',
                            token: jwtToken,
                            expiresIn: 3600 * 1000, // number of ms before token expiration
                            user: {
                                // do not send password and hash
                                _id: user._id,
                                email: user.email,
                                password: user.password // TODO remove
                            },
                        });
                    } else {
                        const errorMess = 'The password is not correct'; // TODO turn into a generic credentials message once stable
                        console.log('ERROR - ' + errorMess)
                        return response.status(httpCodes.UNAUTHORIZED).json({
                            errorType: 'Invalid credentials',
                            errorMessage: errorMess
                        });
                    }
                });
        })
        .catch((errorData) => {
            // Hopefully we do not reach here, if we do we need to update the code to handle this specific error
            // to provide a better error message in the response
            const errorMess = 'An unexpected error occured';
            console.log('ERROR - ' + errorMess)
            console.log(errorData);
            return response.status(httpCodes.SERVER_ERROR).json({
                errorType: 'Server error',
                errorMessage: errorMess
            });
        });
}


exports.deleteUser = (request, response, _next) => {
    console.log('Middleware [deleteUser] ' + request.originalUrl);
    const email = request.body.email;
    const password = request.body.password;
    console.log('DEBUG - Delete user ' + email + "/" + password);

    if (email === undefined || password === undefined) {
        return response.status(httpCodes.BAD_REQUEST).json({
            errorType: 'Invalid credentials',
            errorMessage: 'An email and a password are needed to delete a user'
        });
    }

    User.findOne({ email: email }).then(
        (existingUser) => {
            if (!existingUser) {
                const errorMess = 'No user found with email ' + email; // TODO change to a generic error message once stable
                console.log(errorMess);
                return response.status(httpCodes.UNAUTHORIZED).json({
                    errorType: 'Invalid credentials',
                    errorMessage: errorMess
                });
            }
            bcrypt.compare(password, existingUser.hash)
                .then((hashMatches) => {
                    if (!hashMatches) {
                        const errorMess = 'The password is invalid'; // TODO change to a generic error message once stable
                        console.log(errorMess);
                        return response.status(httpCodes.UNAUTHORIZED).json({
                            errorType: 'Invalid credentials',
                            errorMessage: errorMess
                        });
                    }
                    User.deleteOne({ email: email }).then(
                        (user) => {
                            console.log("Deleted User : ");
                            console.log(user);
                            response.status(httpCodes.SUCCESS).json({
                                message: 'Deleted user ' + email + ' successfully.',
                                user: existingUser
                            });
                        }
                    );
                });
        }
    );
}


exports.getUsers = (request, response, _next) => {
    User.find().then(
        (users) => {
            console.log('Middleware [getUsers] ' + request.originalUrl);
            response.status(httpCodes.SUCCESS).json({
                message: "Get users successfully",
                users: users
            });
        }
    );
}