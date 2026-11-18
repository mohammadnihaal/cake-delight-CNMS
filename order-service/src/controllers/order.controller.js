const orderService = require('../services/order.service');

const userOf = (req) => req.header('x-user-id') || 'demo-user';

const wrap = (fn) => async (req, res, next) => {
  try {
    await fn(req, res);
  } catch (err) {
    next(err);
  }
};

exports.getBasket = wrap(async (req, res) => {
  res.json(await orderService.getBasket(userOf(req)));
});

exports.addItem = wrap(async (req, res) => {
  const { cakeId, quantity } = req.body;
  res.status(201).json(await orderService.addItem(userOf(req), cakeId, quantity));
});

exports.updateItem = wrap(async (req, res) => {
  res.json(await orderService.updateItem(userOf(req), req.params.cakeId, req.body.quantity));
});

exports.removeItem = wrap(async (req, res) => {
  res.json(await orderService.removeItem(userOf(req), req.params.cakeId));
});

exports.checkout = wrap(async (req, res) => {
  res.status(201).json(await orderService.checkout(userOf(req), req.body.email));
});

exports.getOrder = wrap(async (req, res) => {
  const order = await orderService.getOrder(req.params.id);
  if (!order) return res.status(404).json({ error: 'Order not found' });
  res.json(order);
});
