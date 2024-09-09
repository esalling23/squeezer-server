const express = require('express')
const { signUp, signIn, changePassword, signOut } = require('../controllers/userController');
const requireToken = require('../middleware/requireToken');

const router = express.Router()

router.post('/sign-up', signUp);
router.post('/sign-in', signIn)
router.patch('/change-password', requireToken, changePassword)
router.delete('/sign-out', requireToken, signOut)

module.exports = router
