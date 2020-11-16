// library includes
const mongoose = require('mongoose');

// internal includes
const Piece = require('../models/piece'); // Mongoose model for MongoDB Pieces collections
const httpCodes = require('../http-codes');


/*
 * Custom middlewares for the /api/pieces section
 * They are referenced from the router pieces-routes.js
 */


// middleware to get all pieces (no authentication required)
exports.getPieces = (request, response, _next) => {
    console.log('Middleware [GetPieces] ' + request.originalUrl);
    const mongoQuery = Piece.find();

    // Use query parameters for pagination
    const pageIndex = +request.query.pageIndex;
    const pageSize = +request.query.pageSize;
    if (pageIndex !== undefined && pageSize !== undefined) {
        mongoQuery.skip(pageSize * pageIndex)
            .limit(pageSize);
    }

    // get pieces from MongoDB
    mongoQuery.then(
        (pieces) => {
            Piece.countDocuments().then(
                (total) => {
                    response.status(httpCodes.SUCCESS).json({
                        message: 'Retrieved pieces successfully.',
                        pieces: pieces,
                        total: total
                    });
                }
            );
        }
    ).catch(
        (e) => {
            // Hopefully we do not reach here, if we do we need to update the code to handle this specific error
            // to provide a better error message in the response
            console.log(e);
            response.status(httpCodes.SERVER_ERROR).json({
                errorMessage: "Failed to get the pieces from the server.",
                error: e
            });
        }
    );
};


// middleware to get a single piece
exports.getPiece = (request, response, _next) => {
    const pieceId = request.params.id;
    console.log('Middleware [getPiece] ' + request.originalUrl);
    // get the piece from MongoDB
    Piece.findOne({ _id: pieceId })
        .then(
            (piece) => {
                // piece must exist
                if (!piece) {
                    return response.status(httpCodes.NOT_FOUND).json({
                        errorType: "Not found",
                        errorMessage: 'No piece was found with ID = ' + pieceId
                    });
                }
                response.status(httpCodes.SUCCESS).json({
                    message: 'Retrieved piece successfully.',
                    piece: piece
                });
            }
        ).catch(
            (e) => {
                console.log(e);
                if (e instanceof mongoose.Error.CastError) {
                    // the provided pieceId has an invalid format
                    return response.status(httpCodes.BAD_REQUEST).json({
                        errorType: "Invalid ID",
                        errorMessage: "Failed to cast piece ID " + e.value + " into " + e.kind
                    });
                }
                // generic error
                response.status(httpCodes.SERVER_ERROR).json({
                    errorType: 'Server Error',
                    errorMessage: "Failed to get piece " + pieceId + " from the server."
                });
            }
        );
};


// middleware for the piece creation
exports.createPiece = (request, response, _next) => {
    console.log('Middleware [createPiece] ' + request.originalUrl);
    console.log(request.body);

    const piece = new Piece({
        // TODO add the user to the piece object
        // take user info from the decoded token (so it can not be altered)
        // userId: request.auth.userId,
        // username: request.auth.username,
        // take piece info from the request
        type: request.body.type,
        title: request.body.title,
        year: request.body.year,
        genre: request.body.genre,
        imageUrl: request.body.imageUrl,
        summary: request.body.summary,
        completionDate: request.body.completionDate,
        author: request.body.author,
        director: request.body.director,
        actors: request.body.actors,
        console: request.body.console,
        season: request.body.season,
        volume: request.body.volume,
    });

    // save in MongoDB in the "pieces" collection (lower-case plurial name of the model)
    console.log('Creating new piece in MongoDB Pieces collection :\n' + piece);
    piece.save()
        .then(
            (createdPiece) => {
                response.status(httpCodes.SUCCESS).json({
                    message: 'Created piece successfully.',
                    piece: createdPiece
                });
            }
        ).catch(
            (e) => {
                console.log(e);
                // generic error handler
                response.status(httpCodes.SERVER_ERROR).json({
                    errorType: 'Server error',
                    errorMessage: "Failed to create the piece on the server."
                });
            }
        );
};


// // middleware to edit a piece
exports.editPiece = (request, response, _next) => {
    const pieceId = request.params.id;
    console.log('Middleware [editPiece] ' + request.originalUrl);
    console.log(request.body);

    // check that the piece exists and is owned by the authenticated user
    Piece.findOne({ _id: pieceId }).then(
        (piece) => {
            // piece must exist
            if (!piece) {
                return response.status(httpCodes.NOT_FOUND).json({
                    errorType: "Not found",
                    errorMessage: 'No piece was found with ID = ' + pieceId
                });
            }
            // piece must belong to authenticated user
            // if (piece.userId != request.auth.userId) {
            //    return response.status(UNAUTHORIZED_CODE).json({
            //        error: "PermissionError",
            //        message: 'Piece with ID ' + pieceId + ' belongs to another user.',
            //        id: null
            //    });
            // }

            // update a piece in MongoDB
            Piece.findOneAndUpdate({ _id: pieceId }, {
                    // the user info are not editable
                    type: request.body.type,
                    title: request.body.title,
                    year: request.body.year,
                    genre: request.body.genre,
                    imageUrl: request.body.imageUrl,
                    summary: request.body.summary,
                    completionDate: request.body.completionDate,
                    author: request.body.author,
                    director: request.body.director,
                    actors: request.body.actors,
                    console: request.body.console,
                    season: request.body.season,
                    volume: request.body.volume,
                }, { new: true } /* to return the updated document */ )
                .then((updatedPiece) => {
                    response.status(httpCodes.SUCCESS).json({
                        message: 'Updated piece successfully.',
                        piece: updatedPiece
                    });
                });
        });
};


// middleware to delete a piece
exports.deletePiece = (request, response, _next) => {
    const pieceId = request.params.id;
    console.log('Middleware [deletePiece] ' + request.originalUrl);

    Piece.findOne({ _id: pieceId })
        .then(
            (piece) => {
                // piece must exist
                if (!piece) {
                    return response.status(httpCodes.NOT_FOUND).json({
                        errorType: "Not Found",
                        errorMessage: 'No piece was found with ID = ' + pieceId
                    });
                }
                // piece must belong to authenticated user
                // if (piece.userId != request.auth.userId) {
                //    return response.status(UNAUTHORIZED_CODE).json({
                //        error: "PermissionError",
                //        message: 'Piece with ID ' + pieceId + ' belongs to another user.',
                //        id: null
                //    });
                // }

                // perform deletion
                return Piece.findOneAndRemove({ _id: pieceId });
            }
        ).then(
            (deletedPiece) => {
                return response.status(httpCodes.SUCCESS).json({
                    message: 'Deleted piece successfully.',
                    piece: deletedPiece
                });
            }
        ).catch(
            (e) => {
                console.log(e);
                if (e instanceof mongoose.Error.CastError) {
                    // the provided pieceId has an invalid format
                    return response.status(httpCodes.BAD_REQUEST).json({
                        errorType: "Invalid ID",
                        errorMessage: "Failed to cast the ID " + e.value + " into " + e.kind
                    });
                }
                // Generic error handler for unexpected errors
                return response.status(httpCodes.SERVER_ERROR).json({
                    errorType: 'Server error',
                    errorMessage: "Failed to delete piece " + pieceId
                });
            }
        );
};