import axios from "axios";

type SignUpFormFields = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  address: string;
};

type LoginFormFields = {
  email: string;
  password: string;
};

type ChangePasswordFields = {
  currentPassword: string;
  newPassword: string;
};

type UserDetailsFields = {
  firstName: string;
  lastName: string;
  email: string;
  address: string;
};

// Base URL for the API
const BASE_URL = "http://localhost:5010";

// End points
const SIGN_UP = `${BASE_URL}/api/auth/signup`;
const LOGIN = `${BASE_URL}/api/auth/login`;
const CHANGE_PASSWORD = `${BASE_URL}/api/auth/change-password`;
const GET_USER_DETAILS = `${BASE_URL}/api/auth/user-details`;
const UPDATE_USER_DETAILS = `${BASE_URL}/api/auth/update-details`;

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

export const getUserDetails = (token: string) =>
  axios.get(GET_USER_DETAILS, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

export const updateUserDetails = (data: UserDetailsFields, token: string) =>
  axios.put(UPDATE_USER_DETAILS, data, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
