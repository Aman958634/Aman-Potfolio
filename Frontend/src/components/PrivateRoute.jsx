import { Outlet, Navigate, useLocation } from 'react-router-dom';
import { isAuthenticated } from '../services/api';

const PrivateRoute = () => {
  const location = useLocation();
  const authenticated = isAuthenticated();

  if (!authenticated) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  return <Outlet />;
};

export default PrivateRoute;
