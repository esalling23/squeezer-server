const getAuth = require('../lib/auth');

const requireToken = async (req, res, next) => {
	try {
		const auth = await getAuth();
		const { fromNodeHeaders } = await import('better-auth/node');
		const session = await auth.api.getSession({
			headers: fromNodeHeaders(req.headers),
		});
		if (!session) return res.sendStatus(401);
		// Better Auth stringifies IDs at its API boundary; downstream Prisma
		// queries expect User.id as Int (FK on Site.userId etc.).
		req.user = { ...session.user, id: Number(session.user.id) };
		next();
	} catch (err) {
		next(err);
	}
};

module.exports = requireToken;
