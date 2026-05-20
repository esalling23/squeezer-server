// This line must come before importing any instrumented module.
const tracer = require('dd-trace').init()

const express = require('express');
const session = require('express-session');
const path = require('path');
const cors = require('cors')
const flash = require('connect-flash');
require('dotenv').config();

const getAuth = require('./lib/auth');
const requestLogger = require('./middleware/requestLogger');
const requireToken = require('./middleware/requireToken');
const errorHandler = require('./lib/errorHandler');

const serverDevPort = 8080
const clientDevPort = 3000
const PORT = process.env.PORT || serverDevPort;

const app = express();

(async () => {
	const auth = await getAuth();
	const { toNodeHandler } = await import('better-auth/node');

	if (process.env.ENV === 'production') {
		const allowedOrigins = [process.env.CLIENT_ORIGIN, '*.squeezer.eronsalling.me']
		app.use(cors({
			origin: (origin, callback) => {
				if (allowedOrigins.includes(origin) || !origin) {
					callback(null, true);
				} else {
					callback(new Error('Not allowed by CORS'));
				}
			},
			credentials: true,
		}))
	} else {
		app.use(cors({
			origin: process.env.CLIENT_ORIGIN || 'http://localhost:3000',
			credentials: true,
		}))
	}

	// Better Auth handler must be mounted BEFORE express.json() so it can
	// read the raw request body for OAuth callbacks, etc.
	app.all('/api/auth/*', requestLogger, toNodeHandler(auth));

	// Middleware
	app.use(express.json());
	app.use(express.urlencoded({ extended: false }));
	app.use(session({ secret: process.env.AUTH_SECRET || 'secret', resave: false, saveUninitialized: false }));
	app.use(flash());

	app.use('/api/templates', requestLogger, express.static(path.join(__dirname, '11ty/templates')));
	app.use('/api/sites', requireToken, requestLogger, require('./routes/siteRoutes'));
	app.use('/api/fonts', requireToken, requestLogger, require('./routes/fontRoutes'));
	app.use('/api/leads/:siteId', requestLogger, require('./routes/leadRoutes'));

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
})().catch((err) => {
	console.error('Failed to start server:', err);
	process.exit(1);
});
