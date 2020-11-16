// Libraries
const express = require('express'); // backend framework

// Middlewares
const verifyAuth = require('../middlewares/verify-auth');
const PiecesController = require('../middlewares/pieces');

// TODO check the user authentication fot all endpoints


/*
 * All REST API routes for the /api/pieces section
 *
 * We create a "router" and define all the routes, then in app.js we add this router as a middleware.
 * The "/api/pieces/" prefix is given in app.js when registering the router, so it does not need
 * to be provided again in each route in this file
 */

const router = express.Router();


// middleware to get all pieces
router.get('/',
    verifyAuth,
    PiecesController.getPieces);

// middleware to get a single piece
router.get('/:id',
    verifyAuth,
    PiecesController.getPiece);

// middleware to create a piece
router.post('/',
    verifyAuth,
    PiecesController.createPiece);

// middleware to edit a piece
router.put('/:id',
    verifyAuth,
    PiecesController.editPiece);

// middleware to delete a piece
router.delete('/:id',
    verifyAuth,
    PiecesController.deletePiece);

// export the router containing all routes handlers for /api/pieces section
module.exports = router;