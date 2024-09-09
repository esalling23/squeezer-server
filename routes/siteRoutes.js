const express = require('express');
const router = express.Router();
const siteController = require('../controllers/siteController');
const { upload } = require('../lib/cloudinaryService');
const requireToken = require('../middleware/requireToken');

// Public routes
router.get('/', siteController.getAllSites);

// Routes requiring authentication
router.post('/', upload.single('heroImage'), siteController.createSite);
router.get('/user', siteController.getMySites);
router.patch('/:id', upload.single('heroImage'), siteController.updateSite);
router.delete('/:id', siteController.deleteSite);

module.exports = router;
