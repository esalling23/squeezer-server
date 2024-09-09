const requestLogger = function (req, res, next) {
  console.log('\n===== Incoming Request =====\n')
  console.log(`${new Date()}`)
  console.log(`${req.method} ${req.url}`)
  console.log(`user ${JSON.stringify(req.user)}`)
  console.log(`body ${JSON.stringify(req.body)}`)
  console.log('\n============================\n')
  next()
}

module.exports = requestLogger
