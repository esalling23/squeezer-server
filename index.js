// This line must come before importing any instrumented module.
const tracer = require('dd-trace').init()

const express = require('express');
const session = require('express-session');
const path = require('path');
const cors = require('cors')
const flash = require('connect-flash');
require('dotenv').config();

const auth = require('./lib/auth');
const requestLogger = require('./middleware/requestLogger');
const requireToken = require('./middleware/requireToken');
const errorHandler = require('./lib/errorHandler');

const serverDevPort = 8080
const clientDevPort = 3000
const PORT = process.env.PORT || serverDevPort;

const app = express();


if (process.env.ENV === 'production') {
	const allowedOrigins = [process.env.CLIENT_ORIGIN, '*.squeezer.eronsalling.me']
	app.use(cors({ 
		origin: (origin, callback) => {
			if (allowedOrigins.includes(origin) || !origin) {
        callback(null, true);
			} else {
        callback(new Error('Not allowed by CORS'));
			}
    } 
  }))
} else {
	app.use(cors())
}

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(session({ secret: 'secret', resave: false, saveUninitialized: false }));
app.use(flash());

app.use(auth);

app.use('/api/templates', requestLogger, express.static(path.join(__dirname, '11ty/templates')));
app.use('/api/sites', requireToken, requestLogger, require('./routes/siteRoutes'));
app.use('/api/leads/:siteId', requestLogger, require('./routes/leadRoutes'));
app.use('/auth', requestLogger, require('./routes/userRoutes'));

app.use('/public', express.static(path.join(__dirname, 'public')));

if (process.env.ENV === 'dev') {
  app.use('/live', express.static(path.join(__dirname, '../sites')));
}

app.use(express.static(path.join(__dirname, '../client/build')));
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/build', 'index.html'));
});

app.use(errorHandler)

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
