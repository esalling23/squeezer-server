const bcrypt = require('bcryptjs');
const prisma = require('./prismaClient');
const { PORT } = require('./constants');

const bcryptSaltRounds = 10;

const clientOrigin =
	process.env.CLIENT_ORIGIN ||
	(process.env.ENV === 'production'
		? 'https://squeezer.eronsalling.me'
		: 'http://localhost:3000');

// Better Auth ships as ESM only; load it via dynamic import and cache the
// instance so the rest of the (CommonJS) server can `await getAuth()`.
let authPromise;

const getAuth = () => {
	if (authPromise) return authPromise;
	authPromise = (async () => {
		const { betterAuth } = await import('better-auth');
		const { prismaAdapter } = await import('better-auth/adapters/prisma');
		return betterAuth({
			database: prismaAdapter(prisma, { provider: 'postgresql' }),
			baseURL: process.env.AUTH_URL || `http://localhost:${PORT}`,
			secret: process.env.AUTH_SECRET,
			trustedOrigins: [clientOrigin],
			advanced: {
				// Tell Better Auth all IDs are Int. Matches our schema where
				// User.id + Session/Account/Verification.id are all autoincrement.
				database: {
					generateId: 'serial',
				},
			},
			emailAndPassword: {
				enabled: true,
				// Use bcrypt so pre-existing User.password hashes can be
				// migrated into Account.password and verified as-is.
				password: {
					hash: async (password) => bcrypt.hash(password, bcryptSaltRounds),
					verify: async ({ hash, password }) => bcrypt.compare(password, hash),
				},
			},
			socialProviders: {
				google: {
					clientId: process.env.GOOGLE_CLIENT_ID,
					clientSecret: process.env.GOOGLE_CLIENT_SECRET,
				},
				// Add more providers here — e.g. facebook, github, apple.
			},
			account: {
				accountLinking: {
					enabled: true,
					trustedProviders: ['google'],
				},
			},
		});
	})();
	return authPromise;
};

module.exports = getAuth;
