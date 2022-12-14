const express = require('express');
const router = express.Router();

var firmware = require('./firmware.js');
var website = require('./website.js');

router.get('/', website.get_index);
router.get('/firmware/', firmware.get_firmware_index);
router.get('/firmware/stable.bin', firmware.get_stable_firmware_binary);
router.get('/firmware/testing.bin', firmware.get_testing_firmware_binary);
router.get('/firmware/unstable.bin', firmware.get_unstable_firmware_binary);

module.exports = router;
