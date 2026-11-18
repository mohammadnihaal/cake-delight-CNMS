const crypto = require('crypto');
const Order = require('../models/order.model');
const catalogClient = require('./catalog.client');
const publisher = require('./publisher.service');

const httpError = (status, message) => Object.assign(new Error(message), { status });

const recalc = (order) => {
  order.total =
    Math.round(order.items.reduce((sum, i) => sum + i.price * i.quantity, 0) * 100) / 100;
};

async function getBasket(userId) {
  let basket = await Order.findOne({ userId, status: 'BASKET' });
  if (!basket) basket = await Order.create({ userId });
  return basket;
}

async function addItem(userId, cakeId, quantity) {
  const cake = await catalogClient.getCake(cakeId);
  if (!cake) throw httpError(404, 'Cake not found');
  if (!cake.available) throw httpError(409, 'Cake is not available');

  const basket = await getBasket(userId);
  const existing = basket.items.find((i) => i.cakeId.toString() === cakeId);
  if (existing) {
    existing.quantity += quantity;
    existing.price = cake.price;
  } else {
    basket.items.push({ cakeId, name: cake.name, price: cake.price, quantity });
  }
  recalc(basket);
  return basket.save();
}

async function updateItem(userId, cakeId, quantity) {
  const basket = await getBasket(userId);
  const item = basket.items.find((i) => i.cakeId.toString() === cakeId);
  if (!item) throw httpError(404, 'Item not in basket');
  item.quantity = quantity;
  recalc(basket);
  return basket.save();
}

async function removeItem(userId, cakeId) {
  const basket = await getBasket(userId);
  basket.items = basket.items.filter((i) => i.cakeId.toString() !== cakeId);
  recalc(basket);
  return basket.save();
}

async function checkout(userId, email) {
  const basket = await getBasket(userId);
  if (basket.items.length === 0) throw httpError(400, 'Basket is empty');

  basket.status = 'CONFIRMED';
  basket.email = email;
  recalc(basket);
  await basket.save();

  // Event for the Notification service. A broker problem must not fail the order.
  const event = {
    eventId: crypto.randomUUID(),
    type: 'order.completed',
    occurredAt: new Date().toISOString(),
    orderId: basket._id.toString(),
    userId,
    email,
    items: basket.items.map((i) => ({
      cakeId: i.cakeId.toString(),
      name: i.name,
      quantity: i.quantity,
      price: i.price,
    })),
    total: basket.total,
  };
  try {
    publisher.publishOrderCompleted(event);
  } catch (err) {
    console.error('[order] could not publish order.completed:', err.message);
  }
  return basket;
}

const getOrder = (id) => Order.findOne({ _id: id, status: 'CONFIRMED' });

module.exports = { getBasket, addItem, updateItem, removeItem, checkout, getOrder };
