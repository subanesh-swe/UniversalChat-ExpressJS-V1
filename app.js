const createError = require('http-errors');
const express = require('express');
const path = require('path');
const logger = require('morgan');
const mongoose = require('mongoose');
const session = require('express-session');
const socket = require('socket.io');
// const fs = require('fs');

const indexRouter = require('./routes/index');
const usersRouter = require('./routes/users');

const app = express();

// Subanesh's moongoose database 
require('dotenv').config(); // mongo DB url file

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
app.use(session({ secret: "UniversalChat", resave: false, saveUninitialized: true }));

app.use('/', indexRouter);
app.use('/users', usersRouter);

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
