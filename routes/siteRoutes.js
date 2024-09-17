const express = require('express');
const router = express.Router();
const siteController = require('../controllers/siteController');
const { upload } = require('../lib/cloudinaryService');
const generateOrUpdate11tySite = require('../lib/generate11tySite');

router.get('/', siteController.getAllSites);
router.get('/user', siteController.getMySites);
router.get('/subdomain/:subdomain', siteController.getSubdomainSite);

router.post('/', upload.single('heroImage'), siteController.createSite);
router.patch('/:id', upload.single('heroImage'), siteController.updateSite, generateOrUpdate11tySite);
router.delete('/:id', siteController.deleteSite);

module.exports = router;
