const jwt = require('jsonwebtoken');

const schema = require('./auth.schema');
const users = require('./auth.model');
const db = require("../db/connection");
const redisClient = require("../redis/connection");
const {ignore} = require("nodemon/lib/rules");

function checkTokenSetUser(req, res, next) {
    const authHeader = req.get('Authorization');
    console.log({authHeader})
    if (authHeader) {
        // const token = authHeader.split(' ')[1];
        // console.log({token})
        if (authHeader) {
            // use jwt lib to decode
            jwt.verify(authHeader, process.env.TOKEN_SECRET, (error, user) => {
                if (error) {
                    console.log(error);
                }
                console.log({user})
                req.user = user;
                next();
            });
        } else {
            next();
        }
    } else {
        next();
    }
}

function isLoggedIn(req, res, next) {
    if (req.user) {
        console.log('isLoggedIn')
        next();
    } else {
        unAuthorized(res, next);
    }
}

function isAdmin(req, res, next) {
    if (req.user.role === 'admin') {
        console.log('is admin')
        next();
    } else {
        console.log('not admin')
        unAuthorized(res, next);
    }
}

function unAuthorized(res, next) {
    const error = new Error('🚫 Un-Authorized 🚫');
    res.status(401);
    next(error);
}

const validateUser = (defaultErrorMessage = '', type) => (req, res, next) => {
    const result = schema.validate({username: req.body.username, fullName: req.body.fullName, password: req.body.password});
    if (!result.error) {
        next();
    } else {
        res.json({result: 'user validation fails', error: defaultErrorMessage ? defaultErrorMessage : result.error})
        // const error = defaultErrorMessage ? new Error(defaultErrorMessage) : result.error;
        // res.status(422);
        next(defaultErrorMessage ? defaultErrorMessage : result.error);
    }
};

const findUser = (defaultLoginError, isError, errorCode = 422) => (req, res, next) => {
    users.findOne({username: req.body.username}, undefined, (err, user) => {
        // todo it should work in login and signup mode
        console.log(user)
        if (isError(user)) {
            res.status(errorCode);
            next(new Error('کاربری یافت نشد'));
        } else {
            req.loggingInUser = user;
            next();
        }
    });
};

const OTPAttemptsDB = db.get('OTPAttempts');

const generateOTP = (limit = 6) => {
    const digits = '0123456789';
    let OTP = '';
    for (let i = 0; i < limit; i++) {
        OTP += digits[Math.floor(Math.random() * 10)];
    }
    return OTP;
}

const REDIS_USER_OTP_BLOCKED = 'BLOCKED';
const REDIS_USER_OTP_HAS_CHANCE = 'HAS_CHANCE';
const REDIS_USER_OTP_NEW_USER = 'NEW_USER';

const canProceedToAuthControllers = async (username) => {
    const value = await redisClient.get(username);
    const parsed = JSON.parse(value)

    if (parsed) {
        if (parsed.tries === 5) {
            return {type: REDIS_USER_OTP_BLOCKED}
        }
        return {type: REDIS_USER_OTP_HAS_CHANCE, value: parsed}
    }

    return {type: REDIS_USER_OTP_NEW_USER}
}
const addOTPAttemptRecord = (type) => async (req, res, next) => {

    const userOtpData = await canProceedToAuthControllers(req.body.username);

    switch (userOtpData.type) {
        case REDIS_USER_OTP_BLOCKED: {
            res.status(422)
            next(new Error('بیش از حد مجاز اقدام به درخواست کرده اید. دسترسی شما بمدت 1 دقیقه محدود شد.🍆'))
            break;
        }
        case REDIS_USER_OTP_HAS_CHANCE: {
            const newParsed = JSON.stringify({otp: userOtpData.value.otp, tries: ++userOtpData.value.tries})
            // await redisClient.set(req.body.username, newParsed, 'KEEPTTL');
            await redisClient.sendCommand(['SET', req.body.username, newParsed, 'KEEPTTL']);
            next();
            break;
        }
        case REDIS_USER_OTP_NEW_USER: {
            try {
                users.findOneAndUpdate(
                    {username: req.body.username},
                    {
                        $set: {
                            username: req.body.username,
                            fullName: null,
                            password: null,
                            role: 'user',
                            active: false,
                            registered: false,
                        }
                    },
                    {upsert: true}
                )
                const otp = generateOTP()
                console.log('otp: ', otp)
                const newValue = JSON.stringify({otp, tries: 1})
                await redisClient.sendCommand(['SET', req.body.username, newValue, 'EX', '60']);
                // await redisClient.set(req.body.username, newValue);
                // redisClient.expireAt(req.body.username, parseInt((+new Date) / 1000) + 10);
                next();
                break;
            } catch (e) {
                res.status(422);
                const error = Error('Unable to login [-100-]');
                next(error);
            }
        }
    }

    // OTPAttemptsDB.find({username: req.body.username}).then(results => {
    //     if (results.length > 5) {
    //         res.status(422)
    //         next(new Error('بیش از حد مجاز اقدام به درخواست کرده اید. دسترسی شما بمدت ۲۰ دقیقه محدود شد.🍆'))
    //     } else {
    //         OTPAttemptsDB
    //             .insert({username: req.body.username, date: new Date().toISOString(), type})
    //             .then(() => {
    //                 next();
    //             });
    //     }
    // })
}

module.exports = {
    checkTokenSetUser,
    isLoggedIn,
    isAdmin,
    validateUser,
    findUser,
    addOTPAttemptRecord
};
