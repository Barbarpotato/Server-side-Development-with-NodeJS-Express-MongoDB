const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const passportLocalMongoose = require('passport-local-mongoose');

// username and password field, automatically added by the passportLocalMongoose.
const Users = new Schema({
    firstname: {
        type: String,
        default: ""
    },
    lastname: {
        type: String,
        default: ""
    },
    facebookId: {
        type: String
    },
    admin: {
        type: Boolean,
        default: false
    }
});

// Adding support for username and password to be hashed and salt.
Users.plugin(passportLocalMongoose);

module.exports = mongoose.model("Users", Users);