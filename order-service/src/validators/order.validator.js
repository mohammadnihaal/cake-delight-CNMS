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

const addItemBody = Joi.object({
  cakeId: objectId,
  quantity: Joi.number().integer().min(1).max(50).default(1),
});
const updateItemBody = Joi.object({
  quantity: Joi.number().integer().min(1).max(50).required(),
});
const checkoutBody = Joi.object({ email: Joi.string().email().required() });
const cakeParams = Joi.object({ cakeId: objectId });
const idParams = Joi.object({ id: objectId });

module.exports = {
  validateAddItem: validate(addItemBody, 'body'),
  validateUpdateItem: validate(updateItemBody, 'body'),
  validateCheckout: validate(checkoutBody, 'body'),
  validateCakeParam: validate(cakeParams, 'params'),
  validateIdParam: validate(idParams, 'params'),
};
