const { error } = require('console');
const express = require('express');
const bcrypt = require("bcrypt");
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

router.get('/index/rooms', requireLogin, async (req, res, next) => {
    var roomListData;
    var roomListLabel;
    try {
        //roomListData = await roomsDatabase.find({ participants: req.session.name });
        roomListData = await roomsDatabase.find({ participants: { $in: [req.session.name] } });
        //console.log(`rooms : ${roomListData}`);
        if (roomListData.length === 0) {
            roomListLabel = "You haven't joined any rooms yet. Please create a new room or join a room";
            console.log('No data found.');
        } else {
            roomListLabel = "List of rooms you have joined";
            console.log("data found");
        }
    } catch (err) {
        roomListData = [];
        roomListLabel = "Error while finding the rooms, If you have already joined any team please try again after something.";
        console.log(err);
    } finally {
        res.render("rooms", {
            title: "Rooms",
            userName: req.session.name,
            roomListLabel: roomListLabel,
            roomList: roomListData,
        });
    }
});

router.post("/index/rooms", async (req, res) => {
    try {

        //let resultJson = {};
        console.log(`@/index/rooms [post] : req.body : ${JSON.stringify(req.body)}`);
        var { formTitleSender, roomNameOrId, enabelPassword, password } = req.body;

        //console.log(`formTitleSender: ${formTitleSender}, roomNameOrId: ${roomNameOrId}, enabelPassword: ${enabelPassword}, password: ${password} `)

        if (roomNameOrId == null || formTitleSender == null || (formTitleSender !== "Create new Room" && formTitleSender !== "Join new Room")) {
            // throw new Error("Input field invalid !!! either due to invalid access to server or communication error");
            return res.json({ result: false, alert: "Input field invalid !!! either due to invalid access to server or communication error, try again after sometime or try contacting the admin!!!" });
        }

        let currRoomId;
        let data;
        let currPassword;

        if (enabelPassword != null) {  // enabelPassword === "on"
            currPassword = password;
        } else {
            currPassword = "";
        }

        if (formTitleSender === "Create new Room") {
            /**************************************************** Create new Room ****************************************/
            do {
                currRoomId = Math.random().toString(36).substring(2) + Date.now().toString(36);
                data = await roomsDatabase.find({ roomId: currRoomId });
                console.log(`@/index/rooms [post] : [Create room] mongodb data : ${data}`);
            } while (data.length !== 0);

            const encryptedNewPassword = await bcrypt.hash(currPassword, 10);

            await roomsDatabase.create({
                roomId: currRoomId,
                roomName: roomNameOrId,
                password: encryptedNewPassword,
                participants: [req.session.name]
            });
            return res.json({ result: true, redirect: `/index/rooms/${currRoomId}`, alert: `New room '${roomNameOrId}' created with ID: '${currRoomId}', Password: '${password}' ` });


        } else if (formTitleSender === "Join new Room") {
            /**************************************************** Join new Room ****************************************/
            currRoomId = roomNameOrId;
            data = await roomsDatabase.findOne({ roomId: currRoomId });
            console.log(`@/index/rooms [post] : [join room] mongodb data : ${data}`);
            if (data != null && data.length != 0) {

                const roomPassword = data.password;
                bcrypt.compare(currPassword, roomPassword, async (err, result) => {
                    if (err) {
                        console.error(err);
                        return res.json({ result: false, alert: "Something went wrong. ensure you have entered a valid input, please try again after sometime or try contacting the admin!!!" });
                    } else if (result) {
                        data.participants.push(req.session.name);
                        await data.save();
                        return res.json({ result: true, redirect: `/index/rooms/${currRoomId}`, alert: "Join successful!" });
                    } else {
                        return res.json({ result: false, alert: "Invalid Password!!!" });
                    }
                });
            } else {
                return res.json({ result: false, alert: "Invalid Room Id, there is no such room exist!!!" });
            }

        }

        //return res.json({ result: false, alert: "if- else end -->>> Input field invalid !!! either due to invalid access to server or communication error, try again after sometime or try contacting the admin!!!" });

    } catch (error) {
        console.log(`Error @/index/rooms [post] : ${error}`);
        return res.json({ result: false, alert: "Something went wrong, try again after sometime or try contacting the admin!!!" });
    }
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
