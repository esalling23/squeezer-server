const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

prisma.$extends({
  client: {
    $log: (s) => console.log(s),
	}
});
module.exports = prisma;
