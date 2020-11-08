// library includes
const mongoose = require('mongoose');

// internal includes
const Piece = require('../models/piece'); // Mongoose model for MongoDB Pieces collections


/*
 * Custom middlewares for the /api/pieces section
 * They are referenced from the router pieces-routes.js
 */


// HTTP response codes
const SUCCESS_CODE = 200;
const BAD_REQUEST_CODE = 400;
const UNAUTHAURIZED_CODE = 401;
const NOT_FOUND_CODE = 404;
const SERVER_ERROR_CODE = 500;


// middleware to get all pieces (no authentication required)
exports.getPieces = (request, response, _next) => {
    console.log('Middleware: GET ' + request.originalUrl);
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
                    response.status(SUCCESS_CODE).json({
                        message: 'Retrieved pieces successfully.',
                        pieces: pieces,
                        total: total
                    });
                }
            );
        }
    ).catch(
        (e) => {
            response.status(SERVER_ERROR_CODE).json({
                message: "Failed to get the pieces from the server.",
                error: e,
                pieces: null
            });
        }
    );
};


// middleware to get a single piece
exports.getPiece = (request, response, _next) => {
    const pieceId = request.params.id;
    console.log('Middleware: GET /api/pieces/' + pieceId);
    // get the piece from MongoDB
    Piece.findOne({ _id: pieceId })
        .then(
            (piece) => {
                // piece must exist
                if (!piece) {
                    return response.status(NOT_FOUND_CODE).json({
                        error: "NotFoundError",
                        message: 'No piece with ID ' + pieceId,
                        piece: null
                    });
                }
                response.status(SUCCESS_CODE).json({
                    message: 'Retrieved piece successfully.',
                    piece: piece
                });
            }
        ).catch(
            (e) => {
                console.log(e);
                if (e instanceof mongoose.Error.CastError) {
                    // the provided pieceId has an invalid format
                    return response.status(BAD_REQUEST_CODE).json({
                        error: "CastError",
                        message: "Failed to cast " + e.value + " to " + e.kind,
                        piece: null
                    });
                }
                // generic error
                response.status(SERVER_ERROR_CODE).json({
                    message: "Failed to get piece " + pieceId + " from the server.",
                    error: e,
                    piece: null
                });
            }
        );
};


// middleware for the piece creation
exports.createPiece = (request, response, _next) => {
    console.log('Middleware: POST /api/pieces');
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
                response.status(SUCCESS_CODE).json({
                    message: 'Created piece successfully.',
                    piece: createdPiece
                });
            }
        ).catch(
            (e) => {
                console.log(e);
                // generic error handler
                response.status(SERVER_ERROR_CODE).json({
                    message: "Failed to create the piece on the server.",
                    error: e,
                    piece: null
                });
            }
        );
};


// // middleware to edit a piece
exports.editPiece = (request, response, _next) => {
    const pieceId = request.params.id;
    console.log('Middleware: PUT /api/pieces/' + pieceId);
    console.log(request.body);

    // check that the piece exists and is owned by the authenticated user
    Piece.findOne({ _id: pieceId }).then(
        (piece) => {
            // piece must exist
            if (!piece) {
                return response.status(NOT_FOUND_CODE).json({
                    error: "NotFoundError",
                    message: 'No piece with ID ' + pieceId,
                    piece: null
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
                }, { new: true } /* to get the updated document */ )
                .then((updatedPiece) => {
                    console.log("GOT AFTER UPDATE :");
                    console.log(updatedPiece);
                    response.status(SUCCESS_CODE).json({
                        message: 'Updated piece successfully.',
                        piece: updatedPiece
                    });
                });
        });
};


// middleware to delete a piece
exports.deletePiece = (request, response, _next) => {
    const pieceId = request.params.id;
    console.log('Middleware: DELETE /api/pieces/' + pieceId);

    Piece.findOne({ _id: pieceId })
        .then(
            (piece) => {
                // piece must exist
                if (!piece) {
                    return response.status(NOT_FOUND_CODE).json({
                        error: "NotFoundError",
                        message: 'No piece with ID ' + pieceId,
                        piece: null
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
                return response.status(SUCCESS_CODE).json({
                    message: 'Deleted piece successfully.',
                    piece: deletedPiece
                });
            }
        ).catch(
            (e) => {
                if (e instanceof mongoose.Error.CastError) {
                    // the provided pieceId has an invalid format
                    return response.status(BAD_REQUEST_CODE).json({
                        error: "CastError",
                        message: "Failed to cast " + e.value + " to " + e.kind,
                        piece: null
                    });
                }
                // Generic error handler for unexpected errors
                return response.status(SERVER_ERROR_CODE).json({
                    message: "Failed to delete piece " + pieceId,
                    error: e,
                    piece: null
                });
            }
        );
};