import React from "react";
import { Navigate } from "react-router-dom";

function PrivateRoute({ children }) {
  const token = localStorage.getItem("token");

  // 🔥 If no token → redirect to login
  if (!token) {
    return <Navigate to="/login" />;
  }

  // ✅ If token exists → allow access
  return children;
}

export default PrivateRoute;