const express = require("express");
const bcrypt = require("bcrypt");
const path = require('path');
const usersDatabase = require(path.join(__dirname, '..', 'mongooseModels', 'usersDatabase.js'));
const session = require("express-session");
const createError = require('http-errors');
const { create } = require("domain");

const router = express.Router();

router.get('/login', function (req, res, next) {
    if (!req.session.name) {
        res.render("login", { title: "Sign Up" });
    } else {
        res.redirect("/");
    }
});

router.post("/login", async (req, res) => {
    try {
        console.log(`@/users/login [post] : req.body : ${JSON.stringify(req.body)}`);
        var { email, password } = req.body;
        email = email.replace(/\s+/g, '').toLowerCase();
        //const data = await usersDatabase.find({ email: email });
        const data = await usersDatabase.findOne({ email: email });
        console.log(`@/users/login [post] : mongodb data : ${data}`);
        if (data != null && data.length != 0) {
            const currPassword = password;
            const userPassword = data.password;
            bcrypt.compare(currPassword, userPassword, (err, result) => {
                if (err) {
                    console.error(err);
                    res.json({ result: false, alert: "Something went wrong. ensure you have entered a valid input, please try again after sometime or try contacting the admin!!!" });
                    //return res.send("Something went wrong!");
                }

                if (result) {
                    res.cookie('cookieName', 'cookieValue', { secure: true });
                    req.session.name = data.username;
                    console.log(req.session);
                    res.json({ result: true, redirect: `/`, alert: "login successful!" });
                    //return res.redirect("/");
                } else {
                    res.json({ result: false, alert: "Invalid Password!!!" });
                    //return res.send("Invalid password!");
                }
            });
        } else {
            res.json({ result: false, alert: "Invalid Username, there is no such user exist!!!" });
            //return res.send("There is no such user!");
        }
    } catch (error) {
        console.log(error);
        res.json({ result: false, alert: "Something went wrong, try again after sometime or try contacting the admin!!!" });
        //next(createError(400, error));
    }
});

router.get('/register', function (req, res, next) {
    if (!req.session.name) {
        res.render("register", { title: "Register" });
    } else {
        res.redirect("/");
    }
});

router.post("/register", async (req, res) => {
    try {
        console.log(`@/users/register [post] : req.body : ${JSON.stringify(req.body)}`);
        var { username, email, password } = req.body;
        email = email.replace(/\s+/g, '').toLowerCase();
        username = username.replace(/\s+/g, '').toLowerCase();
        //const data = await usersDatabase.find({ email: email });
        const data = await usersDatabase.find({
            $or: [
                { email: email },
                { username: username }
            ]
        });
        console.log(`@/users/login [post] : mongodb data : ${data}`);

        if (data.length == 0) {
            const currPassword = password;
            const encryptedNewPassword = await bcrypt.hash(currPassword, 10);
            await usersDatabase.create({
                username: username,
                email: email,
                password: encryptedNewPassword
            });
            res.json({ result: true, redirect: `/`, alert: "registration successful! " });
            //res.redirect('/');
        } else {
            //return res.send();
            if (data[0].email === email) {
                res.json({ result: false, alert: `Your account already exist with mail id : ${email}, please login!` });
            } else if (data[0].username === username) {
                res.json({ result: false, alert: `The Username ${username} is notavailable, try creating new!` });
            }
        }
    } catch (error) {
        console.log(error);
        res.json({ result: false, alert: "Something went wrong, try again after sometime or try contacting the admin!!!" });
    }
});

router.get('/logout', function (req, res) {
    console.log("chearing session cookies....................***********");
    req.session.destroy(function (err) {
        if (err) {
            console.log(err);
        } else {
            res.redirect('/');
        }
    });
    //res.clearCookie('session')
    //res.redirect('/')
})

module.exports = router;
