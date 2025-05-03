import User from '../model/UserModel';

module.exports.login = async (req: any, res: any) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'User not found' });
    }
    if (user.password !== password) {
      return res.status(400).json({ message: 'Invalid password' });
    }
    res.status(200).json({ message: 'Login successful', user });
  } catch (error: any) {
    console.log(error);
    res.status(500).json({ message: 'Error logging in', error: error.message });
  }
};

module.exports.signup = async (req: any, res: any) => {
  const { firstName, lastName, email, password } = req.body;

  try {
    // Check if user already exists
    const user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: 'User already exists' });
    }
    const newUser = new User({ firstName, lastName, email, password });
    newUser.save();
    res
      .status(201)
      .json({ message: 'User created successfully', user: newUser });
  } catch (error: any) {
    console.log(error);
    res
      .status(500)
      .json({ message: 'Error creating user', error: error.message });
  }
};
