const express = require("express");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const crypto = require("crypto");
const db = require("../db");
const router = express.Router();

// configure the LocalStrategy
passport.use(
  new LocalStrategy(function verify(username, password, cb) {
    db.get(
      "SELECT * from users WHERE username = ?",
      [username],
      function (err, row) {
        if (err) {
          return cb(err);
        }
        if (!row) {
          return cb(null, false, {
            message: "Incorrect username or password.",
          });
        }

        crypto.pbkdf2(
          password,
          row.salt,
          310000,
          32,
          "sha256",
          (err, hashedPassword) => {
            if (err) {
              return cb(err);
            }
            if (
              !crypto.timingSafeEqual(
                row.hashed_password,
                hashedPassword
              )
            ) {
              return cb(null, false, {
                message: "incorrect username or password.",
              });
            }
            return cb(null, row);
          }
        );
      }
    );
  })
);
/* This configures the LocalStrategy to fetch the user record from the app's database and 
   verify the hashed password against the password submitted by the user. If that succeeds, 
   the password is valid and the user is authenticated.*/

passport.serializeUser((user, cb) => {
  process.nextTick(() => {
    cb(null, { id: user.id, username: user.username });
  });
});

passport.deserializeUser((user, cb) => {
  process.nextTick(() => {
    cb(null, user);
  });
});

router.get("/login", (req, res, next) => {
  res.render("login");
});

router.post(
  "/login/password",
  passport.authenticate("local", {
    successRedirect: "/",
    failureRedirect: "login",
  })
);

module.exports = router;
