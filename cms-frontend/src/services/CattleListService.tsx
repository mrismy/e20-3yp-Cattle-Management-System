import axios from 'axios';

// Base URL for the API
const BASE_URL = 'http://localhost:8082/booking';

// End points
const GET_ALL_CATTLE = () => `${BASE_URL}/cattle-all`;
const GET_SAFE_CATTLE = () => `${BASE_URL}/cattle-safe`;
const GET_UNSAFE_CATTLE = () => `${BASE_URL}/cattle-unsafe`;

export const getAllCattle = () => axios.get(`${GET_ALL_CATTLE}`);
export const getSafeCattle = () => axios.get(`${GET_SAFE_CATTLE}`);
export const getUnsafeCattle = () => axios.get(`${GET_UNSAFE_CATTLE}`);
