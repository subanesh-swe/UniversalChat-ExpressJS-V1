const express = require('express');
const session = require('express-session');
const path = require('path');
const roomsDatabase = require(path.join(__dirname, '..', 'mongooseModels', 'roomsDatabase.js'));

const app = express();
const router = express.Router();

function requireLogin(req, res, next) {
    if (req.session && req.session.name) {
        next();
    } else {
        res.redirect('/users/login');
    }
}

router.get('/', requireLogin, function (req, res, next) {
    res.redirect('/index/rooms')
});


router.get('/index/rooms', requireLogin, function (req, res, next) {
    res.render("rooms", { title: "Rooms" });
});

router.post("/index/rooms", async (req, res) => {
    try {
        console.log(`@/index/rooms [post] : req.body : ${JSON.stringify(req.body)}`);
        var { roomName, createPassword, password } = req.body;
        if (!createPassword || createPassword !== "on") {
            password = "";
        }

        let newRoomId;
        let data;
        do {
            newRoomId = Math.random().toString(36).substring(2) + Date.now().toString(36);
            data = await roomsDatabase.find({ roomId: newRoomId });
        } while (data.length !== 0);

        await roomsDatabase.create({
            roomId: newRoomId,
            roomName: roomName,
            password: password,
            participants: [req.session.name]
        });

        res.json({ result: true, redirect: `/index/rooms/${newRoomId}` });

        //res.json({
        //    result: false, alert: `roomId: ${newRoomId},roomName: ${roomName},password: ${password},createPassword: ${createPassword}, req: ${JSON.stringify(req.body)}`, redirect: "/index/rooms/chat"
        //});
    } catch (error) {
        console.log(`Error @/index/rooms [post] : ${error}`);
        res.json({ result: false, alert: "Something went wrong, try again after sometime or try contacting the admin!!!" });
    }
    //// Create new instance without array elements
    //const myModel1 = new MyModel({ name: 'example' });
    //await myModel1.save();

    //// Create new instance with array elements
    //const myModel2 = new MyModel({ name: 'example', list: ['element1', 'element2'] });
    //await myModel2.save();

});


router.get('/index/rooms/:roomId', requireLogin, async (req, res, next) => {
    try {
        const reqRoomId = req.params.roomId;
        if (reqRoomId == null) {
            return res.redirect('/index/rooms');
        }
        const data = await roomsDatabase.findOne({ roomId: reqRoomId, participants: req.session.name });
        console.log(`@/index/rooms/chat/:roomId [get] : data : ${JSON.stringify(data)}`);
        if (data != null && data.length != 0) {
            console.log(`data.roomName : ${ data.roomName }`)
            res.render('chat', { title: "SWE's world", roomId: data.roomId, roomName: data.roomName, userName: req.session.name });
        } else {
            return res.redirect('/index/rooms');
        }
    } catch (error) {
        console.log(`Error @/index/rooms/chat/:roomId [get] : ${error}`);
    }
});

router.get('/index/rooms/chat_v2', requireLogin, function (req, res, next) {
    res.render('chat_v2', { title: "SWE's world", name: req.session.name });
});

router.get('/index/rooms/chat_v3', requireLogin, function (req, res, next) {
    res.render('chat_v3', { title: "SWE's world", name: req.session.name });
});

router.get('/index/rooms/chat_v4', requireLogin, function (req, res, next) {
    res.render('chat_v4', { title: "SWE's world", name: req.session.name });
});


module.exports = router;
