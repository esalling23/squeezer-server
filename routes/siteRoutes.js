const express = require('express');
const router = express.Router();
const siteController = require('../controllers/siteController');
const { upload } = require('../lib/cloudinaryService');


router.get('/subdomain/:subdomain', siteController.getSubdomainSite);

router.get('/', siteController.getMySites);
router.post('/', upload.single('heroImage'), siteController.createSite);

router.get('/:id', siteController.getSite);
router.patch('/:id', upload.single('heroImage'), siteController.updateSite);
router.delete('/:id', siteController.deleteSite);

module.exports = router;
