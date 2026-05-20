// One-time migration: copy legacy User.password bcrypt hashes into
// Account rows (providerId: "credential") so existing users can sign
// in through Better Auth's /api/auth/sign-in/email.
//
// Safe to re-run: skips users that already have a credential account.
//
// Usage:  node scripts/migrateLegacyPasswords.js

require('dotenv').config();
const prisma = require('../lib/prismaClient');

(async () => {
	const users = await prisma.user.findMany({
		where: { password: { not: null } },
		include: { accounts: { where: { providerId: 'credential' } } },
	});

	let migrated = 0;
	let skipped = 0;

	for (const user of users) {
		if (user.accounts.length > 0) {
			skipped += 1;
			continue;
		}
		await prisma.account.create({
			data: {
				accountId: String(user.id),
				providerId: 'credential',
				userId: user.id,
				password: user.password,
			},
		});
		migrated += 1;
		console.log(`Migrated password for user ${user.id} (${user.email})`);
	}

	console.log(`\nDone. Migrated: ${migrated}, already had credential account: ${skipped}`);
	await prisma.$disconnect();
})().catch((err) => {
	console.error(err);
	process.exit(1);
});
