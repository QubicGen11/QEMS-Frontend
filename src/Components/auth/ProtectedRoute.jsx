import React from 'react';
import { Route } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { useNavigate } from 'react-router-dom';

const ProtectedRoute = ({ component: Component, ...rest }) => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  return (
    <Route {...rest} element={(
      isAuthenticated
        ? <Component />
        : (() => {
          navigate('/login');
          return null;
        })()
    )} />
  );
};

export default ProtectedRoute;
