import axios from 'axios';
import qs from 'qs';

// Base URL for the API
const BASE_URL = 'http://localhost:5010';

// End points
const GET_ALL_CATTLE = `${BASE_URL}/api/sensor/latestWithCattle`;
const ADD_CATTLE = `${BASE_URL}/cattle-add`;

export const getAllCattle = () => axios.get(`${GET_ALL_CATTLE}`);

export const addCattle = (data: any) => {
  return axios.post(`${ADD_CATTLE}`, qs.stringify(data), {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
  });
};
