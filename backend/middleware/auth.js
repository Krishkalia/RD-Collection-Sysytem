const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
  const authHeader = req.header('Authorization');
  if (!authHeader) return res.status(401).json({ error: 'Access denied, no token' });

  const token = authHeader.split(' ')[1]; // Format: Bearer <token>
  if (!token) return res.status(401).json({ error: 'Access denied, invalid token format' });

  try {
    const verified = jwt.verify(token, process.env.JWT_SECRET || 'secret');
    req.user = verified; // { userId, userType }
    next();
  } catch (err) {
    console.error('JWT Verification Error:', err.message);
    res.status(401).json({ error: 'Invalid token' });
  }
};

const adminMiddleware = (req, res, next) => {
  // Assuming userType 1 is Admin
  if (req.user && req.user.userType === 1) {
    next();
  } else {
    res.status(403).json({ error: 'Access denied: Requires Admin privileges' });
  }
};

const agentMiddleware = (req, res, next) => {
  // Assuming userType 2 is Agent
  if (req.user && req.user.userType === 2) {
    next();
  } else {
    res.status(403).json({ error: 'Access denied: Requires Agent privileges' });
  }
};

const customerMiddleware = (req, res, next) => {
  // Assuming userType 3 is Customer
  if (req.user && req.user.userType === 3) {
    next();
  } else {
    res.status(403).json({ error: 'Access denied: Requires Customer privileges' });
  }
};

module.exports = { authMiddleware, adminMiddleware, agentMiddleware, customerMiddleware };
