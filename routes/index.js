const express = require('express');
const session = require('express-session');
// const socket = require('socket.io');

const app = express();
const router = express.Router();


/* GET home page. */
router.get('/', function (req, res, next) {
    if (req.session.name) {
        res.redirect('/index/chat')
    } else {
        res.redirect('/users/login');
    }
});

router.get('/index/chat', function (req, res, next) {
    if (req.session.name) {
        res.render('chat', { title: "SWE's world", name: req.session.name });
    } else {
        res.redirect('/users/login');
    }
});

router.get('/index/chat_v2', function (req, res, next) {
        res.render('chat_v2', { title: "SWE's world", name: req.session.name });
    /*if (req.session.name) {
        res.render('chat_v2', { title: "SWE's world", name: req.session.name });
    } else {
        res.redirect('/users/login');
    }*/
});


module.exports = router;
