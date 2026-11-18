const router = require('express').Router();
const controller = require('../controllers/rating.controller');
const { validateCreate, validateCakeId } = require('../validators/rating.validator');

router.post('/', validateCreate, controller.create);
router.get('/averages', controller.allAverages); // must be before /:cakeId
router.get('/:cakeId/average', validateCakeId, controller.average);
router.get('/:cakeId', validateCakeId, controller.listByCake);

module.exports = router;
