/* eslint-disable no-shadow */
/* eslint-disable consistent-return */
import express from 'express';
import passport from 'passport';
import LocalStrategy from 'passport-local';
import crypto from 'crypto';
import { User } from '../models/index.js';
// import db from '../../db';

passport.use(new LocalStrategy(async (email, password, cb) => {
  try {
    const user = await User.findOne({ where: { email } });
    if (user === null) {
      return cb(null, false, { message: 'Incorrect username or password.' });
    }
    crypto.pbkdf2(password, user.salt, 310000, 32, 'sha256', (err, hashedPassword) => {
      if (err) { return cb(err); }
      if (!crypto.timingSafeEqual(user.hashedPassword, hashedPassword)) {
        return cb(null, false, { message: 'Incorrect email or password.' });
      }
      return cb(null, user);
    });  
  } catch(e) {
    cb(e);
  }
  
  // db.get('SELECT * FROM users WHERE username = ?', [username], (err, row) => {
  //   if (err) { return cb(err); }
  //   if (!row) { return cb(null, false, { message: 'Incorrect username or password.' }); }

  //   crypto.pbkdf2(password, row.salt, 310000, 32, 'sha256', (err, hashedPassword) => {
  //     if (err) { return cb(err); }
  //     if (!crypto.timingSafeEqual(row.hashed_password, hashedPassword)) {
  //       return cb(null, false, { message: 'Incorrect username or password.' });
  //     }
  //     return cb(null, row);
  //   });
  // });
}));

passport.serializeUser((user, cb) => {
  process.nextTick(() => {
    cb(null, { id: user.id, email: user.email });
  });
});

passport.deserializeUser((user, cb) => {
  process.nextTick(() => cb(null, user));
});

const router = express.Router();

router.get('/login', (_, res) => {
  res.render('login');
});

router.post('/login/password', passport.authenticate('local', {
  successRedirect: '/',
  failureRedirect: '/login',
}));

router.post('/logout', (req, res, next) => {
  req.logout((err) => {
    if (err) { return next(err); }
    res.redirect('/');
  });
});

router.get('/signup', (req, res) => {
  res.render('signup');
});

router.post('/signup', (req, res, next) => {
  const salt = crypto.randomBytes(16);
  console.log(salt);
  crypto.pbkdf2(req.body.password, salt, 310000, 32, 'sha256', async (err, hashedPassword) => {
    if (err) { return next(err); }
    const user = await User.create({
      email: req.body.email,
      hashedPassword,
      salt,
    });

    req.login(user, (err) => {
      if (err) { return next(err); }
      res.redirect('/');
    });

    // db.run('INSERT INTO users (username, hashed_password, salt) VALUES (?, ?, ?)', [
    //   req.body.username,
    //   hashedPassword,
    //   salt,
    // ], (err) => {
    //   if (err) { return next(err); }
    //   const user = {
    //     id: this.lastID,
    //     username: req.body.username,
    //   };
    //   req.login(user, (err) => {
    //     if (err) { return next(err); }
    //     res.redirect('/');
    //   });
    // });
  });
});
export default router;
