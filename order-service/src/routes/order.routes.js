const router = require('express').Router();
const controller = require('../controllers/order.controller');
const v = require('../validators/order.validator');

router.get('/basket', controller.getBasket);
router.post('/basket/items', v.validateAddItem, controller.addItem);
router.put('/basket/items/:cakeId', v.validateCakeParam, v.validateUpdateItem, controller.updateItem);
router.delete('/basket/items/:cakeId', v.validateCakeParam, controller.removeItem);
router.post('/checkout', v.validateCheckout, controller.checkout);
router.get('/orders/:id', v.validateIdParam, controller.getOrder);

module.exports = router;
