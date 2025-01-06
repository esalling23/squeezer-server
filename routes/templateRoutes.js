const express = require('express');
const router = express.Router();
const templatesController = require('../controllers/templatesController');

// router.get('/:template', templatesController.getSiteTemplate);
router.get('/css/:template', templatesController.getCustomCss);

module.exports = router;
