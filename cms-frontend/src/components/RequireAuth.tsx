import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useContext } from 'react';
import GlobalContext from '../context/GlobalContext';
import useRefreshToken from '../hooks/useRefreshToken';

const RequireAuth = () => {
  const { auth } = useContext(GlobalContext);
  const location = useLocation();

  return auth.email ? (
    <Outlet />
  ) : (
    // <Navigate to="/login" state={{ from: location }} replace />
    <Outlet />
  );
};

export default RequireAuth;
