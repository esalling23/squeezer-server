const express = require('express');
const router = express.Router();
const fontController = require('../controllers/fontController');

router.get('/', fontController.getFonts);

module.exports = router;
