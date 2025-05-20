import { error } from 'console';
import User from '../model/UserModel';
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

interface UserInterface {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

// handle errors
const handleErrors = (err: any) => {
  console.log(err.message, err.code);
  let errors: UserInterface = {
    firstName: '',
    lastName: '',
    email: '',
    password: '',
  };

  // duplicate error code
  if (err.code === 11000) {
    errors.email = 'Email already registered';
    return errors;
  }

  // validation of errors
  if (err.message.includes('User validation failed')) {
    Object.values(err.errors).forEach((properties: any) => {
      const path = properties.path as keyof UserInterface;
      errors[path] = properties.message;
    });
  }
  return errors;
};

module.exports.login = async (req: any, res: any) => {
  const { email, password } = req.body;
  try {
    // check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'User not found' });
    }
    // check if password is correct
    const auth = await bcrypt.compare(password, user.password);
    if (!auth) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    const accessToken = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: '30s' }
    );
    const refreshToken = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.REFRESH_TOKEN_SECRET,
      { expiresIn: '1d' }
    );
    // save refresh token with current user
    user.refreshToken = refreshToken;
    await user.save();

    res.cookie('jwt', refreshToken, {
      httpOnly: true,
      sameSite: 'None',
      maxAge: 24 * 60 * 60 * 1000,
    });
    return res.status(200).json({ accessToken });
  } catch (error: any) {
    const errors = handleErrors(error);
    res.status(500).json({ errors });
  }
};

module.exports.signup = async (req: any, res: any) => {
  const { firstName, lastName, email, password } = req.body;
  try {
    // Hash the password
    const salt = await bcrypt.genSalt();
    const handledPassword = await bcrypt.hash(password, salt);
    const newUser = new User({
      firstName,
      lastName,
      email,
      password: handledPassword,
    });
    await newUser.save();
    res
      .status(201)
      .json({ message: 'User created successfully', user: newUser });
  } catch (error: any) {
    const errors = handleErrors(error);
    res.status(400).json({ errors });
  }
};

module.exports.logout = async (req: any, res: any) => {
  // On client, also delete the access token
  const cookie = req.cookies;
  if (!cookie?.jwt) {
    return res.sendStatus(204);
  }
  const refreshToken = cookie.jwt;

  // check if refresh token is in db
  const user = await User.findOne({ refreshToken }).exec();
  console.log('User', user);
  if (!user) {
    res.clearCookie('jwt', { httpOnly: true });
    return res.sendStatus(204);
  }

  // delete refresh token in db
  user.refreshToken = '';
  await user.save();
  res.clearCookie('jwt', { httpOnly: true });
  res.sendStatus(204);
};
