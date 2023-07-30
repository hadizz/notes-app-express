const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const users = require('./auth.model');

const createTokenSendResponse = (user, res, next, restJson = {}) => {
    const payload = {
        _id: user._id,
        username: user.username,
        role: user.role,
        active: user.active,
    };
    jwt.sign(
        payload,
        process.env.TOKEN_SECRET, {
            expiresIn: '1h',
        }, (err, token) => {
            if (err) {
                res.status(422);
                const error = Error('Unable to login');
                next(error);
            } else {
                // login all good
                res.json({token, ...restJson});
            }
        },
    );
};

const get = (req, res) => {
    res.json({
        message: 'Hello Auth! 🔐',
    });
};

const signup = async (req, res, next) => {
    console.log('signup')
    try {
        console.log(req.body)
        const hashed = await bcrypt.hash(req.body.password, 12);
        const insertedUser = await users.findOneAndUpdate(
            {username: req.body.username},
            {
                $set: {
                    username: req.body.username,
                    fullName: req.body.fullName,
                    password: hashed,
                    role: 'user',
                    active: true,
                    registered: true,
                }
            },
            {upsert: true}
        )
        createTokenSendResponse(insertedUser, res, next, {message: 'کاربر با موفقیت ساخته شد'});
    } catch (error) {
        res.status(500);
        next(error);
    }
};

const login = async (req, res, next) => {
    try {
        const result = await bcrypt.compare(
            req.body.password,
            req.loggingInUser.password,
        );
        if (result) {
            createTokenSendResponse(req.loggingInUser, res, next);
        } else {
            res.json({result: 'can not login user', error: 'Unable to login', resultError: result.error})
            // res.status(422);
            // throw new Error('Unable to login');
        }
    } catch (error) {
        res.status(res.statusCode === 200 ? 500 : res.statusCode);
        next(error);
    }
};

// 100 new user
// 101 user has account
const checkUserAccount = async (req, res, next) => {
    console.log('checkUserAccount', req.body.username)
    users.findOne({username: req.body.username}, undefined, (err, user) => {
        if (!user) {
            // new user
            console.log('new user')
            res.json({message: 'کاربری با این شماره تلفن یافت نشد، می‌توانید جهت ثبت نام اقدام نمایید.', userType: 100})
        } else {
            if (!user.registered) {
                // user has already send its phonenumber to the system and we record it
                res.json({message: 'می‌توانید جهت ثبت نام اقدام نمایید.', userType: 102})
            } else {
                // user has account
                console.log('user has account')
                res.json({message: 'کاربر اکانت دارد.', userType: 101})
            }
        }
    });
}

module.exports = {
    get,
    login,
    signup,
    checkUserAccount
};
