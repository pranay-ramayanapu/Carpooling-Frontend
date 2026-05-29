import React, { useState } from "react";
import { X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { GOOGLE_AUTH_URL, LOGIN_URL } from "../utils/apis";
import { notifications } from "@mantine/notifications";
import axios from "axios";


function Login() {
  const [formData, setFormData] = useState({
    email: "",
    password: ""
  });
  const navigate = useNavigate();

  const handleChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(LOGIN_URL, formData);

      if (response.status == 200) {
        notifications.show({
          title: "Succesfully loged in",
          message: `Succesfully loged in`,
          color: "green",
        });
        localStorage.setItem("AuthToken", response.data.jwtToken);
        localStorage.setItem("role", response.data.role);
        if (response.data.role === "ADMIN") navigate("/admin");
        else navigate("/dashboard");
      }
      else if (response.status == 403) {
        notifications.show({
          title: "Failed to signup",
          message: "Email already exists, please try again",
          color: "red",
        });
      }
      else {
        notifications.show({
          title: "Failed to login",
          message: "Failed to login, please try again",
          color: "red",
        });
      }
      console.log("login Data:", formData);
    }
    catch (error) {
      notifications.show({
        title: "Failed to signup",
        message: "Email already exists, please try again",
        color: "red",
      });
      console.error(error);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-emerald-50 px-4">
      <div className="bg-white rounded-2xl p-8 w-full max-w-md shadow-lg">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Welcome Back</h2>
          <button
            onClick={() => navigate("/")}
            className="text-gray-500 hover:text-gray-700"
          >
            <X size={24} />
          </button>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => handleChange("email", e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              placeholder="Enter your email"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              type="password"
              value={formData.password}
              onChange={(e) => handleChange("password", e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              placeholder="Enter your password"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 text-white py-3 rounded-lg font-semibold hover:from-emerald-600 hover:to-emerald-700 transition-all duration-200"
          >
            Sign In
          </button>
        </form>

        <div className="mt-6 text-center">
          <div className="mt-4 text-center">
            <button
              type="button"
              onClick={() => window.location.href = GOOGLE_AUTH_URL}
              className="w-full bg-white text-gray-800 border border-gray-300 py-3 rounded-lg flex items-center justify-center gap-2 hover:bg-gray-100"
            >
              <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="h-5 w-5" />
              Sign up with Google
            </button>
          </div>
          <p className="text-sm text-gray-600">
            Don't have an account?{" "}
            <button
              onClick={() => navigate("/signup")}
              className="text-emerald-600 hover:text-emerald-700 font-semibold"
            >
              Sign up
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;
