const mongoose = require('mongoose');
const schema = mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    eAdmin: {
        type: Number,
        default: 0
    },
    password: {
        type: String,
        required: true
    }
});

const User = mongoose.model('users', schema);

module.exports = User;