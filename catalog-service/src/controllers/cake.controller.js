const cakeService = require('../services/cake.service');

exports.list = async (req, res, next) => {
  try {
    res.json(await cakeService.list(req.query));
  } catch (err) {
    next(err);
  }
};

exports.categories = async (req, res, next) => {
  try {
    res.json(await cakeService.categories());
  } catch (err) {
    next(err);
  }
};

exports.getById = async (req, res, next) => {
  try {
    const cake = await cakeService.getById(req.params.id);
    if (!cake) return res.status(404).json({ error: 'Cake not found' });
    res.json(cake);
  } catch (err) {
    next(err);
  }
};
