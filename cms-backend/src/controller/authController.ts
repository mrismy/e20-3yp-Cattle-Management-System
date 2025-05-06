import { error } from 'console';
import User from '../model/UserModel';

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
    const user = await User.login(email, password);
    res.status(200).json({ message: 'Login successful', user });
  } catch (error: any) {
    const errors = handleErrors(error);
    res.status(400).json({ errors });
  }
};

module.exports.signup = async (req: any, res: any) => {
  const { firstName, lastName, email, password } = req.body;
  try {
    const newUser = new User({ firstName, lastName, email, password });
    await newUser.save();
    res
      .status(201)
      .json({ message: 'User created successfully', user: newUser });
  } catch (error: any) {
    const errors = handleErrors(error);
    res.status(400).json({ errors });
  }
};
