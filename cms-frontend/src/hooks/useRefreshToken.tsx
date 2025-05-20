import { useContext } from 'react';
import GlobalContext from '../context/GlobalContext';
import axios from 'axios';

const useRefreshToken = () => {
  const { setAuth } = useContext(GlobalContext);
  const refresh = async () => {
    const response = await axios.get('http://localhost:5010/refresh', {
      withCredentials: true,
    });
    setAuth((prev) => {
      console.log(JSON.stringify(prev));
      console.log(response.data.accessToken);
      return {
        ...prev,
        accessToken: response.data.accessToken,
      };
    });
    return response.data.accessToken;
  };
  return refresh;
};

export default useRefreshToken;
