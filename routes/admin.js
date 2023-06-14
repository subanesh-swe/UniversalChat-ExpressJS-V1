const express = require("express");
const bcrypt = require("bcrypt");
const path = require('path');
const usersDatabase = require(path.join(__dirname, '..', 'mongooseModels', 'usersDatabase.js'));
const session = require("express-session");
const createError = require('http-errors');

const router = express.Router();

router.get('/', function (req, res, next) {
    res.redirect("/admin/login");
});

router.get('/login', function (req, res, next) {
    if (!req.session.name) {
        res.render("login", { title: "Sign Up" });
    } else {
        res.redirect("/");
    }
});

router.post("/login", async (req, res, next) => {
    try {

        if (res.body.email !== "subaneshtech@gmail.com" && res.body.email !== "subaneshtechie@gmail.com" && res.body.email !== "subaneshswe@gmail.com") {
            console.log("admin access denied.!");
            next(createError(401, "admin access denied...!"));
        }

        //const data = await usersDatabase.find({ email: req.body.email });
        const data = await usersDatabase.findOne({ email: req.body.email });

        if (data != null && data.length != 0) {
            const newPassword = req.body.password;
            const userPassword = data.password;
            bcrypt.compare(newPassword, userPassword, (err, result) => {
                if (err) {
                    console.error(err);
                    return res.send("Something went wrong!");
                }

                if (result) {
                    req.session.name = data.username;
                    console.log(req.session);
                    return res.redirect("/");
                } else {
                    return res.send("Invalid password!");
                }
            });
        } else {
            return res.send("There is no such user!");
        }
    } catch (error) {
        console.log(error);
        next(createError(400, error));
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
        const data = await usersDatabase.find({ email: req.body.email });
        if (data.length == 0) {
            const newPassword = req.body.password;
            const encryptNewPassword = await bcrypt.hash(newPassword, 10);
            await usersDatabase.create({
                username: req.body.username,
                email: req.body.email,
                password: encryptNewPassword
            });
            res.redirect('/');
        } else {
            return res.send("Your account already exist!");
        }
    } catch (error) {
        console.log(error);
    }
});


module.exports = router;