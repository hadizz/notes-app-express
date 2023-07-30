const Joi = require('@hapi/joi');
const bcrypt = require('bcryptjs');
const db = require('../db/connection');
const {notes} = require("../api/notes");

const users = db.get('users');
const schema = Joi.object({
    username: Joi.string()
        .regex(/(^[a-zA-Z0-9_]*$)/)
        .min(2)
        .max(30),
    password: Joi.string()
        .trim()
        .min(10),
    role: Joi.string().valid('user', 'admin'),

    active: Joi.bool(),
});

const list = async (req, res, next) => {
    try {
        let result = await users.find({}, {
            fields: {
                password: 0
            }
        });

        const dbNotes = await db.get('notes').find({})
        console.log({dbNotes})
        let out = result.map(user => ({
            ...user,
            notes: dbNotes.filter(note => note.user_id === user._id.toString())
        }))
        console.log(result)
        res.json(out);
    } catch (error) {
        next(error);
    }
};

const updateOne = async (req, res, next) => {
    const {id: _id} = req.params;
    // validate id params
    try {
        // validate req body
        const result = schema.validate(req.body);
        if (!result.error) {
            // if valid: find user in db with given id
            const query = {_id};
            const user = await users.findOne(query);
            if (user) {
                // update user in db
                const updatedUser = req.body;
                if (updatedUser.password) {
                    updatedUser.password = await bcrypt.hash(updatedUser.password, 12);
                }
                const result = await users.findOneAndUpdate(query, {
                    $set: updatedUser,
                });
                // respond with user
                delete result.password;
                res.json(result);
            } else {
                // if not exists - send 404 (with user not found)
                next();
            }
        } else {
            // if not valid - send an error with the reason
            res.json({result: 'can not make user', error: result.error})
            // res.status();
            // throw new Error(result.error);
        }
    } catch (error) {
        next(error);
    }
};

module.exports = {
    list,
    updateOne,
};
