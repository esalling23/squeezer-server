const passport = require('passport')
const LocalStrategy = require('passport-local').Strategy;
const bearer = require('passport-http-bearer')
const prisma = require('./prismaClient');
const bcrypt = require('bcryptjs/dist/bcrypt');

passport.use(new bearer.Strategy(
  async (token, done) => {
		// console.log(token);
		try {
			const user = await prisma.user.findFirst({ where: { token } });
			return done(null, user, { scope: 'all' })
		}
		catch (err)
		{
			return done(err)
		}
  }
));

passport.serializeUser((user, done) => {
	done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
	try {
		// const user = await prisma.user.findUnique({ where: { id } });
		done(null, id);
	} catch (error) {
		done(error);
	}
});

module.exports = passport.initialize()