const createError = require('http-errors');
const express = require('express');
const path = require('path');
const logger = require('morgan');
const socket = require('socket.io');
// const fs = require('fs');

const cookieParser = require('cookie-parser');
const session = require('express-session');
const device = require('express-device');
const mongoose = require('mongoose');
const MongoDBStore = require('connect-mongodb-session')(session);

// Subanesh's moongoose database 
require('dotenv').config(); // mongo DB url file

const indexRouter = require('./routes/index');
const usersRouter = require('./routes/users');
const adminRouter = require('./routes/admin');

const app = express();


// connect to mongoose database
// this meight take few sec after APP starts
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true });
mongoose.connection.once('open', () => console.log('connected to the database'));

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
// app.use(express.urlencoded({ extended: false }));
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public', 'stylesheets')));
app.use(express.static(path.join(__dirname, 'public', 'scripts')));

//this will lose all users cookies after server restart
//app.use(session({ secret: "UniversalChat", resave: false, saveUninitialized: true }));
//mongoose will store cookies, so we will not lose all users cookies after server restart
const store = new MongoDBStore({ uri: process.env.MONGO_URI, collection: 'sessions' });

store.on('error', function (error) {
    assert.ifError(error);
    assert.ok(false);
});

app.use(cookieParser());
app.use(device.capture());
app.use(require('express-session')({
    secret: 'This is a secret',
    cookie: {
        maxAge: 1000 * 60 * 60 * 24 * 7 // 1 week
    },
    store: store,
    resave: true,
    saveUninitialized: true
}));
app.get('/', (req, res) => {
    // Get the device details from the request object
    const deviceType = req.device.type;
    const deviceName = req.device.name;
    const deviceVersion = req.device.version;

    // Set a cookie with the device details
    res.cookie('device', `${deviceType} ${deviceName} ${deviceVersion}`);

    // Send a response
    res.send(`Device details stored in cookie: ${deviceType} ${deviceName} ${deviceVersion}`);
});

app.use('/i', indexRouter);
app.use('/users', usersRouter);
app.use('/admin', adminRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: req.app.get('env') === 'development' ? err : {}
    });
});

/*app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', 'http://localhost:4000');
    next();
});*/

// const server = require('http').createServer(app);
// const io = require('socket.io')(server);
// // io.on('connection', () => { /* … */ });
// server.listen(3000);

/*const port = process.env.PORT || '3000';
const io = socket(app.listen(port, () => {
    console.log(`Server started on port ${port}`);
}));*/

const io = socket(4000, {
    cors: {
        origin: ['http://localhost:3000']
    }
});

io.on("connection", (socket) => {
    console.log(socket.id + " a user connected");
    socket.on("disconnect", () => {
        console.log("user disconnected");
    });
    socket.on("chat", (data) => {
        io.sockets.emit("chat", data);
    });
});

/*
const PORT = process.env.PORT || 8081;
app.listen(PORT, () => console.log(`Server listening on port ${PORT}`));
*/
module.exports = app;
