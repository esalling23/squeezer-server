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

app.use(cors({ origin: process.env.CLIENT_ORIGIN || `http://localhost:${clientDevPort}` }))

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(session({ secret: 'secret', resave: false, saveUninitialized: false }));
app.use(flash());

app.use(auth);

// Serve static files from the React app
app.use(express.static(path.join(__dirname, '../client/build')));

// Routes
app.use('/api/sites', requireToken, requestLogger, require('./routes/siteRoutes'));
app.use('/auth', requestLogger, require('./routes/userRoutes'));

// Catch-all handler to serve the React app
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/build', 'index.html'));
});

app.use(errorHandler)

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
