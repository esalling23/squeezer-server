// an error handling middleware that will run anytime one of the route
// handlers calls `next`, in other words, when an error gets thrown in one of
// the promise chains
const errorHandler = (err, req, res, next) => {
	const { name, code, message } = err;

  // don't log errors in a test environment
  if (!process.env.TESTENV) {
    // log a rudimentary timestamp
    console.log('\n', new Date().toTimeString() + ':')
    // log the original error the terminal running Express
    console.error(name, code, message)
  }


  if (name === 'PrismaClientKnownRequestError') {
    err.status = 422;
  } else if (name === 'PrismaClientValidationError') {
		err.status = 400;
	}

  // if set a status code above, send that status code
  // otherwise, send 500. Also, send the error message as JSON.
  res.status(err.status || 500).json({ ...err, message })
}

module.exports = errorHandler;