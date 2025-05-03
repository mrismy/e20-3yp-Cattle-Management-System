import mongoose from 'mongoose';
const { isEmail } = require('validator');

const userSchema = new mongoose.Schema({
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
    minlength: [6, 'Minimum password length is 6 characters'],
  },
});

const User = mongoose.model('User', userSchema);
export default User;
