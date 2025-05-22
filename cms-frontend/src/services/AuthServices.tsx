import axios from "axios";

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

type ChangePasswordFields = {
  currentPassword: string;
  newPassword: string;
};

// Base URL for the API
const BASE_URL = "http://localhost:5010";

// End points
const SIGN_UP = `${BASE_URL}/api/auth/signup`;
const LOGIN = `${BASE_URL}/api/auth/login`;
const CHANGE_PASSWORD = `${BASE_URL}/api/auth/change-password`;

export const signup = (data: SignUpFormFields) =>
  axios.post(SIGN_UP, data, {
    headers: {
      "Content-Type": "application/json",
    },
  });

export const login = (data: LoginFormFields) =>
  axios.post(LOGIN, data, {
    headers: {
      "Content-Type": "application/json",
    },
  });

export const changePassword = (data: ChangePasswordFields, token: string) =>
  axios.post(CHANGE_PASSWORD, data, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
