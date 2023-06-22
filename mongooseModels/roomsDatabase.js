const mongoose = require('mongoose');

const roomsSchema = mongoose.Schema({
    roomId: {
        type: String,
        require: true
    },
    roomName: {
        type: String,
        require: true
    },
    password: {
        type: String,
        require: true
    },
    participants: {
        type: [String],
        default: []
    },
}, { timestamps: true });

module.exports = new mongoose.model('rooms', roomsSchema);


//const participantsSchema = mongoose.Schema({
//    name: String,
//});

//const roomsSchema = mongoose.Schema({
//    roomId: {
//        type: String,
//        require: true
//    },
//    roomName: {
//        type: String,
//        require: true
//    },
//    password: {
//        type: String,
//        require: true
//    },
//    participants: [participantsSchema],
//}, { timestamps: true });