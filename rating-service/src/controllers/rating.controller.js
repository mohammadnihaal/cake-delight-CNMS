const ratingService = require('../services/rating.service');

const userOf = (req) => req.header('x-user-id') || 'demo-user';

exports.create = async (req, res, next) => {
  try {
    const rating = await ratingService.create({ ...req.body, userId: userOf(req) });
    res.status(201).json(rating);
  } catch (err) {
    next(err);
  }
};

exports.listByCake = async (req, res, next) => {
  try {
    res.json(await ratingService.listByCake(req.params.cakeId));
  } catch (err) {
    next(err);
  }
};

exports.average = async (req, res, next) => {
  try {
    res.json(await ratingService.averageForCake(req.params.cakeId));
  } catch (err) {
    next(err);
  }
};

exports.allAverages = async (req, res, next) => {
  try {
    res.json(await ratingService.allAverages());
  } catch (err) {
    next(err);
  }
};
