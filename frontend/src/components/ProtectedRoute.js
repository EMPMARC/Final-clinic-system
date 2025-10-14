import React from "react";
import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children, requiredRole }) => {
  const storedRole = localStorage.getItem("role");

  if (!storedRole) {
    return <Navigate to="/" replace />;
  }

  if (requiredRole && storedRole !== requiredRole) {
    return <Navigate to ="/" replace />;
  }

  return children;
};

export default ProtectedRoute;