const router = require('express').Router();
const controller = require('../controllers/cake.controller');
const { validateList, validateId } = require('../validators/cake.validator');

router.get('/', validateList, controller.list);
router.get('/categories', controller.categories);
router.get('/:id', validateId, controller.getById);

module.exports = router;
