import axios from 'axios';

type SignUpFormFields = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
};

type LoginFormFields = {
  email: string;
  password: string;
};

// Base URL for the API
const BASE_URL = 'http://localhost:5010';

// End points
const SIGN_UP = `${BASE_URL}/signup`;
const LOGIN = `${BASE_URL}/login`;

export const signup = (data: SignUpFormFields) =>
  axios.post(SIGN_UP, data, {
    headers: {
      'Content-Type': 'application/json',
    },
  });

export const login = (data: LoginFormFields) =>
  axios.post(LOGIN, data, {
    headers: {
      'Content-Type': 'application/json',
    },
  });
