const mongoose = require('mongoose');

require('mongoose-currency').loadType(mongoose);
const Currency = mongoose.Types.Currency;

const Schema = mongoose.Schema;

// Created sub-Document Schema.
const commentSchema = new Schema({
    rating: {
        type: Number,
        min: 1,
        max: 5,
        required: true
    },
    comment: {
        type: String,
        required: true
    },
    author: {
        // refering to the Users Document Id.
        type: mongoose.Schema.Types.ObjectId,
        // The ref option is what tells Mongoose which model to use during population.
        ref: 'Users'
    }
}, {
    timestamps: true
});

const dishSchema = new Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    description: {
        type: String,
        required: true
    },
    image: {
        type: String,
        required: true
    },
    category: {
        type: String,
        required: true
    },
    label: {
        type: String,
        default: ''
    },
    price: {
        // Using Currency module.
        type: Currency,
        required: true,
        min: 0
    },
    featured: {
        type: Boolean,
        default: false
    },
    // pass the Comment Schema as a sub-document in dishSchema.
    comments: [commentSchema]
}, {
    timestamps: true
});

// 1st Argument is the name of the collection.
// 2nd Argument is Schema that we created.
var dishes = mongoose.model("Dish", dishSchema);

module.exports = dishes;