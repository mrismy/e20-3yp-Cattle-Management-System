const jwt = require('jsonwebtoken');
require('dotenv').config();

const verifyJWT = (req: any, res: any, next: any) => {
  const authHeader = req.headers['authorization'];
  if (!authHeader) return res.status(401).json({ message: 'Unauthorized' });
  const token = authHeader.split(' ')[1];
  jwt.verify(
    token,
    process.env.ACCESS_TOKEN_SECRET,
    (err: any, decoded: any) => {
      if (err) return res.status(403).json({ message: 'Forbidden' });
      req.user = decoded;
      next();
    }
  );
};

export default verifyJWT;
