import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';

const PrivateRoute = ({ children }) => {
    const { token } = useSelector((state) => state.student);
    const location = useLocation();

    // If no token, redirect to login while preserving the intended destination
    if (!token) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    // If token exists, render the protected component
    return children;
};
export default PrivateRoute;