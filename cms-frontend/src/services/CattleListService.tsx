import qs from 'qs';
import UseAxiosPrivate from '../hooks/UseAxiosPrivate';
import Axios from './Axios';
import { axiosPrivate } from './Axios';
// const axiosPrivate = UseAxiosPrivate();

export const getAllCattle = () => Axios.get('/api/sensor/latestWithCattle');

export const addCattle = (data: any) => {
  return Axios.post('/cattle-add', qs.stringify(data), {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
  });
};
