const passport = require('passport')
const LocalStrategy = require('passport-local').Strategy;
const bearer = require('passport-http-bearer')
const prisma = require('./prismaClient');
const bcrypt = require('bcryptjs/dist/bcrypt');

passport.use(new bearer.Strategy(
  async (token, done) => {
		try {
			const user = await prisma.user.findFirst({ where: { token } });
      if (!user) { 
				return done(null, false); 
			}
			delete user.password
      return done(null, user, { scope: 'read' });
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
		const user = await prisma.user.findUnique({ where: { id } });
		done(null, user);
	} catch (error) {
		done(error);
	}
});

module.exports = passport.initialize()