const express = require('express');
const router = express.Router();

var controller = require('./controllers.js');

router.get('/stable', controller.get_stable);
router.get('/testing', controller.get_testing);
router.get('/unstable', controller.get_unstable);

module.exports = router;
