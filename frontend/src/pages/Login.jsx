import { useState } from "react";

import API from "../api/axios";

import {
  useNavigate,
  Link,
} from "react-router-dom";

import { useAuth } from "../store/authStore";

import toast from "react-hot-toast";

import Header from "../components/Header";

function Login() {
  const navigate = useNavigate();

  const { setUser } = useAuth();

  const [formData, setFormData] =
    useState({
      email: "",
      password: "",
    });

  const handleLogin = async () => {
    try {
      const res = await API.post(
        "/auth/login",
        formData
      );

      localStorage.setItem(
        "token",
        res.data.token
      );

      setUser(res.data.user);

      toast.success("Login successful");

      navigate("/dashboard");
    } catch (err) {
      toast.error(
        err.response?.data?.message ||
          "Login failed"
      );
    }
  };

  return (
    <>
      <Header />

      <div className="h-[80vh] flex justify-center items-center">
        <div className="bg-white p-10 rounded-2xl shadow w-[400px] flex flex-col gap-4">
          <h1 className="text-3xl font-bold text-center">
            Login
          </h1>

          <input
            type="email"
            placeholder="Email"
            className="border p-3 rounded-lg"
            onChange={(e) =>
              setFormData({
                ...formData,
                email: e.target.value,
              })
            }
          />

          <input
            type="password"
            placeholder="Password"
            className="border p-3 rounded-lg"
            onChange={(e) =>
              setFormData({
                ...formData,
                password:
                  e.target.value,
              })
            }
          />

          <button
            onClick={handleLogin}
            className="bg-black text-white p-3 rounded-lg"
          >
            Login
          </button>

          <p className="text-center">
            Don’t have an account?
          </p>

          <Link
            to="/register"
            className="text-blue-500 text-center"
          >
            Register
          </Link>
        </div>
      </div>
    </>
  );
}

export default Login;