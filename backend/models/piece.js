const mongoose = require('mongoose');

// TODO link each piece to a user

// definition of the Piece schema in MongoDB
// we do not define the ID field because Moongoose automatically creates an _id field.
const pieceSchema = mongoose.Schema({
    title: { type: String, required: true },
    type: { type: String, required: true },
    genre: { type: String, required: false },
    author: { type: String, required: false },
    director: { type: String, required: false },
    actors: { type: [String], required: false },
    year: { type: Number, required: false },
    imagePath: { type: String, required: false },
    summary: { type: String, required: false },
    doneDate: { type: String, required: false },
});

// create the Mongoose model used as a handle on the "pieces" collection
module.exports = mongoose.model('Piece', pieceSchema);