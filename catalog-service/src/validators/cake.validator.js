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

const listQuery = Joi.object({
  name: Joi.string().trim().max(100),
  category: Joi.string().trim().max(50),
  minPrice: Joi.number().min(0),
  maxPrice: Joi.number().min(0),
});

const idParams = Joi.object({ id: Joi.string().hex().length(24).required() });

module.exports = {
  validateList: validate(listQuery, 'query'),
  validateId: validate(idParams, 'params'),
};
