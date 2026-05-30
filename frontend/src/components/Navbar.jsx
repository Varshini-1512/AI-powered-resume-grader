import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../store/authStore";

function Navbar() {
  const { logout } = useAuth();

  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <div className="bg-black text-white p-4 flex justify-between">
      <h1 className="text-xl font-bold">
        ATS Checker AI
      </h1>

      <div className="flex gap-4">
        <Link to="/dashboard">
          Dashboard
        </Link>

        <Link to="/upload">
          Upload
        </Link>

        <button onClick={handleLogout}>
          Logout
        </button>
      </div>
    </div>
  );
}

export default Navbar;
