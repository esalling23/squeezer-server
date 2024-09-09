const passport = require('passport')

const requireToken = passport.authenticate('bearer', { session: false })

module.exports = requireToken
