const jwt = require('jsonwebtoken');
const prisma = require('../config/prisma');

const authenticate = async (req, res, next) => {
  const token = req.cookies.token;

  if (!token) {
    return res.status(401).json({ message: 'Not authenticated' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // check if this token was blacklisted (user logged out but token hasn't expired yet)
    const blacklisted = await prisma.blacklistedToken.findUnique({
      where: { token }
    });

    if (blacklisted) {
      return res.status(401).json({ message: 'Token has been invalidated' });
    }

    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
};

module.exports = authenticate;
