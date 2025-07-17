import { useContext } from 'react';
import GlobalContext from '../context/GlobalContext';
import Axios from '../services/Axios';

const useRefreshToken = () => {
  const { setAuth } = useContext(GlobalContext);
  const refresh = async () => {
    const response = await Axios.get('/api/auth/refresh', {
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
