const createError = require('http-errors');
const express = require('express');
const path = require('path');
const logger = require('morgan');
const socket = require('socket.io');
// const fs = require('fs');

//const cookieParser = require('cookie-parser');
const session = require('express-session');
const DeviceDetector = require('node-device-detector');
const mongoose = require('mongoose');
const MongoDBStore = require('connect-mongodb-session')(session);
//const usersSession = require(path.join(__dirname, 'mongooseModels', 'usersSessions.js'));

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
app.use('/socket.io', express.static(path.join(__dirname, 'node_modules', 'socket.io', 'client-dist')));

//this will lose all users cookies after server restart
//app.use(session({ secret: "UniversalChat", resave: false, saveUninitialized: true }));
//mongoose will store cookies, so we will not lose all users cookies after server restart
//const store = new MongoDBStore({ uri: process.env.MONGO_URI, collection: 'sessions' });

const store = new MongoDBStore({
    uri: process.env.MONGO_URI,
    collection: 'sessions',
    expires: 1000 * 60 * 60 * 24 * 7, // 1 week
    touchAfter: 3600, // update every hour
    //schema: sessionSchema // pass your custom schema here
    //model: usersSession // pass your custom model here
});

store.on('error', function (error) {
    console.log("store error :" + error);
    //assert.ifError(error);
    //assert.ok(false);
});

//app.use(cookieParser());
app.use(session({
    secret: 'This is a secret',
    cookie: {
        'cookieName': "Subanesh's_server",
        'cookieValue': "Universal chat by Subanesh",
        maxAge: 1000 * 60 * 60 * 24 * 7, // 1 week
        httpOnly: true,
    },
    store: store,
    resave: true,
    saveUninitialized: true
}));

//app.use('/users/login', (req, res, next) => {
//    const detector = new DeviceDetector({
//        clientIndexes: true,
//        deviceIndexes: true,
//        deviceAliasCode: false,
//    });

//    //const userAgent = 'Mozilla/5.0 (Linux; Android 5.0; NX505J Build/KVT49L) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/43.0.2357.78 Mobile Safari/537.36';
//    //const result = detector.detect(userAgent);

//    const userAgent = req.headers['user-agent'];
//    const result = detector.detect(userAgent);

//    req.session.deviceDetails = result;
//    req.session.updateAt = Date.now();
//    console.log("in update of sessions-----------------------------------");
//    next();
//});

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

//io.on("connection", (socket) => {
//    console.log("Socket --> Connected <-- " + socket.id);
//    socket.on("disconnect", () => {
//        console.log("Socket --> Disconnected <-- " + socket.id);
//    });

//    socket.on("chat", (data) => {
//        io.sockets.emit("chat", data);
//        console.log("new msg ---------->>>>>" + data.sender + "\n" + data.message);
//    });
//});


io.on('connection', socket => {

    const { userId : UserId } = socket.handshake.query;
    socket.join(UserId);

    console.log(`Socket ---> Connected <---   UserId: ${UserId}, SocketId: ${socket.id}, Query:${JSON.stringify(socket.handshake.query)}`);

    socket.on("disconnect", () => {
        console.log(`Socket --> Disconnected <--  UserId: ${UserId}, SocketId: ${socket.id}`);
    });

    socket.on('sendMessage', ( receivedData ) => {
        const { recipientIds, roomId, data } = receivedData;
        console.log(`Received message by UserId: ${UserId}, SocketId: ${socket.id} ==> roomId:'${roomId}', recipientIds:'${recipientIds}', data:'${JSON.stringify(data)}' `);

        recipientIds.forEach(recipientId => {
            socket.broadcast.to(recipientId).emit('receiveMessage', receivedData );
            console.log(`Sending message by UserId: ${UserId}, SocketId: ${socket.id} ==> roomId:'${roomId}', recipientId:'${recipientId}', data:'${JSON.stringify(data)}' `);
        })
        //recipients.forEach(recipient => {
        //    const newRecipients = recipients.filter(r => r !== recipient)
        //    newRecipients.push(id)
        //    socket.broadcast.to(recipient).emit('receiveMessage', {
        //        recipients: newRecipients, sender: id, data
        //    })
        //})
    })
})

//// Make io accessible to our router
//app.use(function (req, res, next) {
//    req.io = io;
//    next();
//});

/*
const PORT = process.env.PORT || 8081;
app.listen(PORT, () => console.log(`Server listening on port ${PORT}`));
*/

app.all('/', function (req, res, next) {
    //res.redirect('/index/rooms');
    if (req.method === 'GET') {
        console.log(`@/ > Main Router [ router.use GET ] :  req[path]: ${req.path}, redir >>> @/users/login`);
        res.redirect('/users/login');
    } else {
        console.log(`@/ > Main Router [ router.use ALL ] :  req[path]: ${req.path}, sending(report)`);
        return res.json({ result: true, redirect: "/users/login", alert: "Access Denied!!! either due to Illegal access to server or communication error, please Login!!!" });
    }
})

app.use('/index', indexRouter);
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

module.exports = app;




///* Original File */
////--------------------------./bin/www---------------------------
//#!/usr/bin/env node

///**
// * Module dependencies.
// */

//var app = require('../app');
//var debug = require('debug')('universalchat-nodejs:server');
//var http = require('http');

///**
// * Get port from environment and store in Express.
// */

//var port = normalizePort(process.env.PORT || '3000');
//app.set('port', port);

///**
// * Create HTTP server.
// */

//var server = http.createServer(app);

///**
// * Listen on provided port, on all network interfaces.
// */

//server.listen(port);
//server.on('error', onError);
//server.on('listening', onListening);

///**
// * Normalize a port into a number, string, or false.
// */

//function normalizePort(val) {
//    var port = parseInt(val, 10);

//    if (isNaN(port)) {
//        // named pipe
//        return val;
//    }

//    if (port >= 0) {
//        // port number
//        return port;
//    }

//    return false;
//}

///**
// * Event listener for HTTP server "error" event.
// */

//function onError(error) {
//    if (error.syscall !== 'listen') {
//        throw error;
//    }

//    var bind = typeof port === 'string'
//        ? 'Pipe ' + port
//        : 'Port ' + port;

//    // handle specific listen errors with friendly messages
//    switch (error.code) {
//        case 'EACCES':
//            console.error(bind + ' requires elevated privileges');
//            process.exit(1);
//            break;
//        case 'EADDRINUSE':
//            console.error(bind + ' is already in use');
//            process.exit(1);
//            break;
//        default:
//            throw error;
//    }
//}

///**
// * Event listener for HTTP server "listening" event.
// */

//function onListening() {
//    var addr = server.address();
//    var bind = typeof addr === 'string'
//        ? 'pipe ' + addr
//        : 'port ' + addr.port;
//    debug('Listening on ' + bind);
//}

////--------------------------app.js---------------------------
//var createError = require('http-errors');
//var express = require('express');
//var path = require('path');
//var cookieParser = require('cookie-parser');
//var logger = require('morgan');

//var indexRouter = require('./routes/index');
//var usersRouter = require('./routes/users');

//var app = express();

//// view engine setup
//app.set('views', path.join(__dirname, 'views'));
//app.set('view engine', 'pug');

//app.use(logger('dev'));
//app.use(express.json());
//app.use(express.urlencoded({ extended: false }));
//app.use(cookieParser());
//app.use(express.static(path.join(__dirname, 'public')));

//app.use('/', indexRouter);
//app.use('/users', usersRouter);

//// catch 404 and forward to error handler
//app.use(function(req, res, next) {
//  next(createError(404));
//});

//// error handler
//app.use(function(err, req, res, next) {
//  // set locals, only providing error in development
//  res.locals.message = err.message;
//  res.locals.error = req.app.get('env') === 'development' ? err : {};

//  // render the error page
//  res.status(err.status || 500);
//  res.render('error');
//});

//module.exports = app;
////--------------------------./routes/index.js---------------------------
//var express = require('express');
//var router = express.Router();

///* GET home page. */
//router.get('/', function (req, res, next) {
//    res.render('index', { title: 'Express' });
//});

//module.exports = router;

////--------------------------./routes/users.js---------------------------
//var express = require('express');
//var router = express.Router();

///* GET users listing. */
//router.get('/', function (req, res, next) {
//    res.send('respond with a resource');
//});

//module.exports = router;

////--------------------------./public/stylesheets/style.css---------------------------
//body {
//    padding: 50px;
//    font: 14px "Lucida Grande", Helvetica, Arial, sans - serif;
//}

//a {
//    color: #00B7FF;
//}

////--------------------------./views/index.pug---------------------------
//extends layout

//block content
//h1 = title
//  p Welcome to #{ title }

////--------------------------./views/layout.pug---------------------------
//doctype html
//html
//head
//title = title
//link(rel = 'stylesheet', href = '/stylesheets/style.css')
//body
//    block content

////--------------------------./views/error.pug---------------------------
//extends layout

//block content
//h1 = message
//h2 = error.status
//  pre #{ error.stack }

////--------------------------./nuget.config---------------------------
//<?xml version="1.0" encoding="utf-8"?>
//<configuration>
//  <packageSources>
//    <clear />
//    <add key="nuget.org" value="https://api.nuget.org/v3/index.json" />
//  </packageSources>
//  <disabledPackageSources>
//    <clear />
//  </disabledPackageSources>
//</configuration>

////--------------------------./package.json---------------------------
//{
//  "name": "universalchat-nodejs",
//  "version": "0.0.0",
//  "private": true,
//  "scripts": {
//    "start": "node ./bin/www"
//  },
//  "dependencies": {
//    "cookie-parser": "~1.4.4",
//    "debug": "~2.6.9",
//    "express": "~4.16.1",
//    "http-errors": "~1.6.3",
//    "morgan": "~1.9.1",
//    "pug": "2.0.0-beta11"
//  }
//}

/* Original Files */