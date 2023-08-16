const express = require('express');
const Joi = require('@hapi/joi');

const db = require('./../db/connection');

const notes = db.get('notes');

const schema = Joi.object({
  title: Joi.string().trim().max(100).required(),
  note: Joi.string().trim().required(),
});

const router = express.Router();


router.get('/', (req, res, next) => {
  notes.find({
    user_id: req.user._id,
  }).then((results) => {
    res.json(results);
  }).catch(next);
});

router.post('/', (req, res, next) => {
  const result = schema.validate(req.body);
  if (!result.error) {
    const note = {
      ...req.body,
      user_id: req.user._id,
    };
    notes
      .insert(note)
      .then((createdNote) => {
        res.json(createdNote);
      });
  } else {
    const error = new Error(result.error);
    res.status(422);
    next(error);
  }
});

module.exports = router;
