import mongoose from 'mongoose';
const bcrypt = require('bcrypt');
const { isEmail } = require('validator');

interface UserInterface {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

interface UserModelInterface extends mongoose.Model<UserInterface> {
  login(email: string, password: string): Promise<UserInterface & Document>;
}

const userSchema = new mongoose.Schema<UserInterface, UserModelInterface>({
  firstName: {
    type: String,
    required: [true, 'Please enter your first name'],
  },
  lastName: {
    type: String,
    required: [true, 'Please enter your last name'],
  },
  email: {
    type: String,
    required: [true, 'Please enter your email'],
    unique: true,
    validate: [isEmail, 'Please enter a valid email address'],
  },
  password: {
    type: String,
    required: [true, 'Please enter your password'],
    minlength: [8, 'Minimum password length is 8 characters'],
  },
});

// fire a function to encrypt password before doc saved to db
userSchema.pre('save', async function (next) {
  const salt = await bcrypt.genSalt();
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.statics.login = async function (email: string, password: string) {
  const user = await this.findOne({ email });
  if (user) {
    const auth = await bcrypt.compare(password, user.password);
    if (auth) {
      return user;
    }
    throw Error('Incorrect password');
  }
  throw Error('Incorrect email');
};

const User = mongoose.model<UserInterface, UserModelInterface>(
  'User',
  userSchema
);
export default User;
