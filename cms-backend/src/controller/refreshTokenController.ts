import User from '../model/UserModel';
const jwt = require('jsonwebtoken');

module.exports.handleRefreshToken = async (req: any, res: any) => {
  const cookie = req.cookies;
  if (!cookie?.jwt) {
    return res.status(401);
  }
  console.log(cookie.jwt);
  const refreshToken = cookie.jwt;
  const user = await User.findOne({ refreshToken: cookie.jwt }).exec();
  if (!user) {
    return res.status(403);
  }

  jwt.verify(
    refreshToken,
    process.env.REFRESH_TOKEN_SECRET,
    (err: any, decoded: any) => {
      if (err) {
        return res.status(403).json({ message: 'Forbidden' });
      }
      const accessToken = jwt.sign(
        { userId: decoded.userId, email: decoded.email },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: '30s' }
      );
      return res.status(200).json({ accessToken });
    }
  );
};
