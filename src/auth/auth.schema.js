const Joi = require('@hapi/joi');

const schema = Joi.object({
  fullName: Joi.string().min(2).max(30).required(),
  username: Joi.string()
    .regex(/(^[a-zA-Z0-9_]*$)/)
    .min(2)
    .max(30)
    .required(),
  password: Joi.string()
    .trim()
    .min(8)
    .required(),
});

module.exports = schema;
