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
    const userId = request.auth.userId;
    console.log(`Middleware [getPieces] ${request.originalUrl}  (userId: ${userId})`);

    const mongoQuery = Piece.find({ userId: userId }).sort({ completionDate: -1 });

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
    const userId = request.auth.userId;
    console.log(`Middleware [getPiece] ${request.originalUrl}  (userId: ${userId})`);

    // get the piece from MongoDB
    Piece.findOne({ _id: pieceId, userId: userId })
        .then(
            (piece) => {
                if (!piece) {
                    return response.status(httpCodes.NOT_FOUND).json({
                        errorType: "Not found",
                        errorMessage: `No piece was found with ID = ${pieceId} for user ${userId}`
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


// middleware to import multiple pieces
// pieces with an existing ID will be updated, pieces with no ID or an ID that does not exist
// will be created with a new ID
// there are a lot of DB operations to perform here (for each piece, check if it exists and update/create it)
// so we use an async handler and await for each DB call
// All operations are in a transactions so they can all be reverted if one fails.
exports.importPieces = async(request, response, _next) => {
    const userId = request.auth.userId;
    console.log(`Middleware [importPieces] ${request.originalUrl}  (userId: ${userId})`);
    const importedPieces = [];

    const session = await Piece.startSession();
    session.startTransaction();

    try {
        for (const piece of request.body.pieces) {
            let dbPiece = await Piece.findOne({ _id: piece._id, userId: userId }, null, { session: session });
            if (!dbPiece) {
                // create mode
                dbPiece = new Piece({ userId: userId });
                dbPiece.$session(session);
            }
            dbPiece.type = piece.type;
            dbPiece.title = piece.title;
            dbPiece.year = piece.year || null;
            dbPiece.genre = piece.genre || null;
            dbPiece.imageUrl = piece.imageUrl || null;
            dbPiece.summary = piece.summary || null;
            dbPiece.completionDate = piece.completionDate || null;
            dbPiece.author = piece.author || null;
            dbPiece.director = piece.director || null;
            dbPiece.actors = piece.actors || [];
            dbPiece.console = piece.console || null;
            dbPiece.season = piece.season || null;
            dbPiece.volume = piece.volume || null;
            const importedPiece = await dbPiece.save();
            importedPieces.push(importedPiece);
        }
        await session.commitTransaction();
        session.endSession();
        return response.status(httpCodes.SUCCESS).json({
            message: "Pieces imported successfully",
            pieces: importedPieces
        });
    } catch (e) {
        await session.abortTransaction();
        session.endSession();

        if (e instanceof mongoose.Error.CastError) {
            // the provided pieceId has an invalid format
            return response.status(httpCodes.BAD_REQUEST).json({
                errorType: "Invalid ID",
                errorMessage: "Failed to cast the ID " + e.value + " into " + e.kind
            });
        }
        // Generic error handler for unexpected errors
        console.log(e);
        return response.status(httpCodes.SERVER_ERROR).json({
            errorType: 'Server error',
            errorMessage: "Failed to import the pieces to the server"
        });
    }
};


// middleware for the piece creation
exports.createPiece = (request, response, _next) => {
    const userId = request.auth.userId;
    console.log(`Middleware [createPiece] ${request.originalUrl}  (userId: ${userId})`);

    const piece = new Piece({
        userId: userId,
        type: request.body.type,
        title: request.body.title || null,
        year: request.body.year || null,
        genre: request.body.genre || null,
        imageUrl: request.body.imageUrl || null,
        summary: request.body.summary || null,
        completionDate: request.body.completionDate || null,
        author: request.body.author || null,
        director: request.body.director || null,
        actors: request.body.actors || null,
        console: request.body.console || null,
        season: request.body.season || null,
        volume: request.body.volume || null,
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
    const userId = request.auth.userId;
    console.log(`Middleware [editPiece] ${request.originalUrl}  (userId: ${userId})`);
    console.log(request.body);

    // check that the piece exists and is owned by the authenticated user
    Piece.findOne({ _id: pieceId, userId: userId }).then(
        (piece) => {
            if (!piece) {
                return response.status(httpCodes.NOT_FOUND).json({
                    errorType: "Not found",
                    errorMessage: `No piece was found with ID = ${pieceId} for user ${userId}`
                });
            }

            // update a piece in MongoDB
            Piece.findOneAndUpdate({ _id: pieceId, userId: userId }, {
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
    const userId = request.auth.userId;
    console.log(`Middleware [deletePiece] ${request.originalUrl}  (userId: ${userId})`);

    Piece.findOne({ _id: pieceId, userId: userId })
        .then(
            (piece) => {
                if (!piece) {
                    return response.status(httpCodes.NOT_FOUND).json({
                        errorType: "Not Found",
                        errorMessage: `No piece was found with ID = ${pieceId} for user ${userId}`
                    });
                }

                // perform deletion
                return Piece.findOneAndRemove({ _id: pieceId, userId: userId });
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