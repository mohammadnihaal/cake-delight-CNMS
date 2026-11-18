const mongoose = require('mongoose');
const Rating = require('../models/rating.model');

const create = (data) => Rating.create(data);

const listByCake = (cakeId) => Rating.find({ cakeId }).sort({ createdAt: -1 });

const round = (n) => Math.round(n * 10) / 10;

async function averageForCake(cakeId) {
  const [result] = await Rating.aggregate([
    { $match: { cakeId: new mongoose.Types.ObjectId(cakeId) } },
    { $group: { _id: '$cakeId', average: { $avg: '$score' }, count: { $sum: 1 } } },
  ]);
  return { cakeId, average: result ? round(result.average) : 0, count: result ? result.count : 0 };
}

async function allAverages() {
  const rows = await Rating.aggregate([
    { $group: { _id: '$cakeId', average: { $avg: '$score' }, count: { $sum: 1 } } },
  ]);
  return rows.map((r) => ({ cakeId: r._id, average: round(r.average), count: r.count }));
}

module.exports = { create, listByCake, averageForCake, allAverages };
