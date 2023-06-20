const mongoose = require('mongoose');

const sessionSchema = new mongoose.Schema({
    _id: String,
    session: {
        cookie: Object,
        deviceDetails: Object,
        createdAt: {
            type: Date,
            default: Date.now
        },
        updatedAt: {
            type: Date,
            default: Date.now
        }
    }
}, { timestamps: true });

module.exports = new mongoose.model('sessions', sessionSchema);


//const sessionSchema = new mongoose.Schema({
//    _id: String,
//    session: {
//        cookie: {
//            expires: Date,
//            originalMaxAge: Number,
//            secure: Boolean,
//            httpOnly: Boolean,
//            path: String,
//        },
//        deviceDetails: Object,
//        createdAt: {
//            type: Date,
//            default: Date.now
//        },
//        updatedAt: {
//            type: Date,
//            default: Date.now
//        }
//    }
//});

//const Session = mongoose.model('Session', sessionSchema);
