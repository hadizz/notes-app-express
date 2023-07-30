const express = require('express');

const controller = require('./auth.controller');
const middlewares = require('./auth.middlewares');

const router = express.Router();
// any route in here is pre-pended with /auth

const defaultLoginError = 'Unable to login';
const signInError = 'That username is not unique. Please choose another one.';

router.get('/', controller.get);
router.post(
    '/checkUserAccount',
    middlewares.addOTPAttemptRecord('checkUserAccount'),
    controller.checkUserAccount,
);
router.post(
    '/signup',
    // middlewares.addOTPAttemptRecord('signup'),
    middlewares.validateUser('', 'signup'),
    middlewares.findUser(signInError, (user) => !user, 409),
    controller.signup,
);
router.post(
    '/login',
    // middlewares.addOTPAttemptRecord('login'),
    middlewares.validateUser(defaultLoginError, 'login'),
    middlewares.findUser(defaultLoginError, (user) => !(user && user.active)),
    controller.login,
);

module.exports = router;
