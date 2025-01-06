const express = require('express');
const router = express.Router({ mergeParams: true });
const leadsController = require('../controllers/leadsController');
const requireToken = require('../middleware/requireToken');

router.get('/', requireToken, leadsController.getAllLeads);
router.post('/', leadsController.createLead);
router.get('/:leadId', requireToken, leadsController.getLead);

module.exports = router;
