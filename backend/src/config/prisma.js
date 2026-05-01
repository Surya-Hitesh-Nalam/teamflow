const { PrismaClient } = require('@prisma/client');

// single instance so we don't open multiple connections
const prisma = new PrismaClient();

module.exports = prisma;
