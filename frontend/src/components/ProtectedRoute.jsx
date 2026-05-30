import { Navigate } from "react-router-dom";
import { useAuth } from "../store/authStore";

function ProtectedRoute({ children }) {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/" />;
  }

  return children;
}

export default ProtectedRoute;