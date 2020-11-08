const mongoose = require('mongoose');

// TODO link each piece to a user

// definition of the Piece schema in MongoDB
// we do not define the ID field because Moongoose automatically creates an _id field.
const pieceSchema = mongoose.Schema({
    type: { type: String, required: true },
    title: { type: String, required: true },
    year: { type: Number, required: false },
    genre: { type: String, required: false },
    imageUrl: { type: String, required: false },
    summary: { type: String, required: false },
    completionDate: { type: String, required: false },
    author: { type: String, required: false },
    director: { type: String, required: false },
    actors: { type: [String], required: false },
    console: { type: String, required: false },
    season: { type: Number, required: false },
    volume: { type: Number, required: false },
});

// create the Mongoose model used as a handle on the "pieces" collection
module.exports = mongoose.model('Piece', pieceSchema);