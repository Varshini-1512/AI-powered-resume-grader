import { useState } from "react";

import API from "../api/axios";

import toast from "react-hot-toast";

import {
  useNavigate,
  Link,
} from "react-router-dom";

import Header from "../components/Header";

function Register() {
  const navigate = useNavigate();

  const [formData, setFormData] =
    useState({
      name: "",
      email: "",
      password: "",
    });

  const handleRegister = async () => {
    try {
      await API.post(
        "/auth/register",
        formData
      );

      toast.success(
        "Registration successful"
      );

      navigate("/login");
    } catch (err) {
      toast.error(
        err.response?.data?.message ||
          "Registration failed"
      );
    }
  };

  return (
    <>
      <Header />

      <div className="h-[80vh] flex justify-center items-center">
        <div className="bg-white p-10 rounded-2xl shadow w-[400px] flex flex-col gap-4">
          <h1 className="text-3xl font-bold text-center">
            Register
          </h1>

          <input
            placeholder="Name"
            className="border p-3 rounded-lg"
            onChange={(e) =>
              setFormData({
                ...formData,
                name: e.target.value,
              })
            }
          />

          <input
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
            onClick={handleRegister}
            className="bg-black text-white p-3 rounded-lg"
          >
            Register
          </button>

          <p className="text-center">
            Already have an account?
          </p>

          <Link
            to="/login"
            className="text-blue-500 text-center"
          >
            Login
          </Link>
        </div>
      </div>
    </>
  );
}

export default Register;