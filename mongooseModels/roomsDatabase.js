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


//#js

//mongodb list methods create, modify and delete
//    mongodb data push and pull in list
//mongodb data add and delete in list

//const mongoose = require('mongoose');

//const mySchema = new mongoose.Schema({
//    name: { type: String, required: true },
//    list: { type: [String], default: [] }
//});

//const MyModel = mongoose.model('MyModel', mySchema);

//module.exports = MyModel;

//const MyModel = require('./myModel');

//// Create new instance without array elements
//const myModel1 = new MyModel({ name: 'example' });
//await myModel1.save();

//// Create new instance with array elements
//const myModel2 = new MyModel({ name: 'example', list: ['element1', 'element2'] });
//await myModel2.save();


///* push data */

//const myModel = new MyModel({ name: 'example' });
//myModel.list.push('element');
//await myModel.save();


///* pull data or delete data */

//const myModel = await MyModel.findOne({ name: 'example' });
//myModel.list.pull('element');
//await myModel.save();