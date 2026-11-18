const Joi = require('joi');

const validate = (schema, source) => (req, res, next) => {
  const { error, value } = schema.validate(req[source], {
    abortEarly: false,
    stripUnknown: true,
  });
  if (error) {
    return res
      .status(400)
      .json({ error: 'Validation failed', details: error.details.map((d) => d.message) });
  }
  req[source] = value;
  next();
};

const objectId = Joi.string().hex().length(24).required();

const createBody = Joi.object({
  cakeId: objectId,
  score: Joi.number().integer().min(1).max(5).required(),
  comment: Joi.string().trim().allow('').max(500),
});

const cakeParams = Joi.object({ cakeId: objectId });

module.exports = {
  validateCreate: validate(createBody, 'body'),
  validateCakeId: validate(cakeParams, 'params'),
};
