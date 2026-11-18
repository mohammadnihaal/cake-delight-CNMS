const Cake = require('../models/cake.model');

const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

async function list({ name, category, minPrice, maxPrice }) {
  const query = {};
  if (name) query.name = { $regex: escapeRegex(name), $options: 'i' };
  if (category) query.category = { $regex: `^${escapeRegex(category)}$`, $options: 'i' };
  if (minPrice !== undefined || maxPrice !== undefined) {
    query.price = {};
    if (minPrice !== undefined) query.price.$gte = minPrice;
    if (maxPrice !== undefined) query.price.$lte = maxPrice;
  }
  return Cake.find(query).sort({ name: 1 });
}

const getById = (id) => Cake.findById(id);

const categories = () => Cake.distinct('category');

module.exports = { list, getById, categories };
