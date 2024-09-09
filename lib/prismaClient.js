const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

prisma.$use(async (params, next) => {
  const result = await next(params);

  // Exclude password from user queries
  // if (params.model === 'User' && params.action === 'findUnique') {
  //   if (result && result.password) {
  //     delete result.password;
  //   }
  // }

  return result;
});
module.exports = prisma;
