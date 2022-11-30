const express = require('express');
const router = express.Router();

var controller = require('./controllers.js');

router.get('/firmware/stable.bin', controller.get_stable);
router.get('/firmware/testing.bin', controller.get_testing);
router.get('/firmware/unstable.bin', controller.get_unstable);

module.exports = router;
