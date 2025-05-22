import { Request, Response } from 'express';
import User from '../model/UserModel';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

interface UserInterface {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

// Error handling utility
const handleErrors = (err: any): Partial<UserInterface> => {
  console.log(err.message, err.code);
  const errors: Partial<UserInterface> = {};

  // Duplicate email error
  if (err.code === 11000) {
    errors.email = 'Email already registered';
    return errors;
  }

  // Validation errors 
  if (err.message.includes('User validation failed')) {
    Object.values(err.errors).forEach(({ properties }: any) => {
      errors[properties.path as keyof UserInterface] = properties.message;
    });
  }

  return errors;
};

// Login user
export const login = async (req: Request, res: Response, next: unknown) => {
  console.log('Login attempt:', req.body);
  console.log('Environment variables:', {
    accessTokenSecret: process.env.ACCESS_TOKEN_SECRET ? 'Set' : 'Not Set',
    refreshTokenSecret: process.env.REFRESH_TOKEN_SECRET ? 'Set' : 'Not Set'
  });

  const { email, password } = req.body;

  try {
    if (!process.env.ACCESS_TOKEN_SECRET || !process.env.REFRESH_TOKEN_SECRET) {
      throw new Error('JWT secrets are not configured');
    }

    const user = await User.findOne({ email });
    console.log('User found:', user ? 'Yes' : 'No');
    
    if (!user) return res.status(400).json({ message: 'User not found' });

    const isPasswordValid = await bcrypt.compare(password, user.password);
    console.log('Password valid:', isPasswordValid);
    
    if (!isPasswordValid) return res.status(400).json({ message: 'Invalid credentials' });

    // Generate tokens
    const accessToken = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: '30m' }
    );

    const refreshToken = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.REFRESH_TOKEN_SECRET,
      { expiresIn: '7d' }
    );

    // Save refreshToken in DB
    user.refreshToken = refreshToken;
    await user.save();
    console.log('Tokens generated and saved');

    res.cookie('jwt', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.status(200).json({ accessToken });
  } catch (error) {
    console.error('Login error:', error);
    const errors = handleErrors(error);
    res.status(500).json({ errors });
  }
};

// Register new user
export const signup = async (req: Request, res: Response) => {
  const { firstName, lastName, email, password } = req.body;

  try {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({
      firstName,
      lastName,
      email,
      password: hashedPassword,
    });

    await newUser.save();
    res.status(201).json({ message: 'User created successfully', user: newUser });
  } catch (error) {
    const errors = handleErrors(error);
    res.status(400).json({ errors });
  }
};

// Logout user
export const logout = async (req: Request, res: Response) => {
  const cookies = req.cookies;
  if (!cookies?.jwt) return res.sendStatus(204); 

  const refreshToken = cookies.jwt;

  // Clear token from DB
  const user = await User.findOne({ refreshToken }).exec();
  if (user) {
  user.refreshToken = '';
  await user.save();
  }

  // Clear HTTP-only cookie
  res.clearCookie('jwt', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
  });

  res.sendStatus(204);
};

// Change password
export const changePassword = async (req: Request, res: Response) => {
  const { currentPassword, newPassword } = req.body;
  const userId = req.user?.userId; // From JWT middleware

  try {
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Verify current password
    const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({ message: 'Current password is incorrect' });
    }

    // Hash and update new password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();

    res.status(200).json({ message: 'Password updated successfully' });
  } catch (error) {
    const errors = handleErrors(error);
    res.status(500).json({ errors });
  }
};