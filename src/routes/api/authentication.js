import express from 'express';
import passport from 'passport';
import crypto from 'crypto';
import { User } from '../../models/index.js';

const router = express.Router();

router.post('/signup', async (req, res, next) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({
            error: 'no email and/or password'
        });
    }
    const user = await User.findOne({ where: { email } });
    if (user !== null) {
        return res.status(400).json({ error: 'email aready exists' });
    }


    const salt = crypto.randomBytes(16);
    crypto.pbkdf2(password, salt, 310000, 32, 'sha256', async (err, hashedPassword) => {
        if (err) { return next(err); }
        const user = await User.create({
            email,
            hashedPassword,
            salt,
        }); 

        req.login(user, (err) => {
            if (err) { return next(err); }
            res.json({
                user: user.email,
                signup: 'success'
            })
        });
    });
})

router.post('/login', passport.authenticate('local'), (req, res) => {
    res.json({ email: req.user.email, status: 'logged in' });
});

router.post('/logout', (req, res, next) => {
    req.logout((err) => {
        if (err) { return next(err); }
        res.json('logged out');
    });
});

export default router;