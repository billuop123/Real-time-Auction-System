import { Navigate, useLocation } from 'react-router-dom';

interface AdminRouteProps {
  children: React.ReactNode;
}

export const AdminRoute: React.FC<AdminRouteProps> = ({ children }) => {
  const location = useLocation();
  const userRole = sessionStorage.getItem('userRole');

  if (userRole !== 'ADMIN') {
    // Redirect to home page if not admin
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}; 