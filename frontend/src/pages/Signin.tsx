import React, { useState } from "react";
import toast from "react-hot-toast";
import { FaEnvelope, FaLock, FaSignInAlt, FaUser, FaEye, FaEyeSlash } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { signin } from "@/helperFunctions/apiCalls";
import { useAuth } from "@/Contexts/AuthContext";

export const SigninPage: React.FC = () => {
  const [isLogging, setIsLogging] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const { email, setEmail, password, setPassword } = useAuth();
  const [validationErrors, setValidationErrors] = useState<{
    [key: string]: string;
  }>({});

  const validateForm = () => {
    const errors: { [key: string]: string } = {};

    if (!email.trim()) {
      errors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      errors.email = "Email is invalid";
    }

    if (!password) {
      errors.password = "Password is required";
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    if (email === "admin@gmail.com" && password === "adminpassword") {
      navigate("/admin/admindashboard");
      return;
    }

    try {
      setIsLogging(true);
      const data = await signin({ email, password });
      setIsLogging(false);
      if (data.message === "Successfully logged in") {
        sessionStorage.setItem("jwt", data.token);
        toast.success("Successfully logged in!");
        navigate("/");
      }
    } catch (error: any) {
      if (axios.isAxiosError(error)) {
        toast.error(error.response?.data?.message || "Invalid email or password");
      } else {
        toast.error("An unexpected error occurred");
      }
      setIsLogging(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden">
        <div className="p-8">
          <div className="text-center mb-6">
            <h2 className="text-3xl font-bold text-slate-800 mb-2">
              Welcome Back
            </h2>
            <p className="text-sm text-slate-600">
              Sign in to continue to your account
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Input */}
            <div className="relative">
              <FaEnvelope className="absolute left-3 top-1/2 transform -translate-y-1/2 text-amber-500" />
              <input
                type="email"
                placeholder="Email Address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 ${
                  validationErrors.email
                    ? "border-red-500 focus:ring-red-500"
                    : "border-slate-200 focus:ring-amber-500"
                }`}
                required
              />
              {validationErrors.email && (
                <p className="text-red-500 text-sm mt-1">{validationErrors.email}</p>
              )}
            </div>

            {/* Password Input */}
            <div className="relative">
              <FaLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-amber-500" />
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`w-full pl-10 pr-12 py-3 border rounded-lg focus:outline-none focus:ring-2 ${
                  validationErrors.password
                    ? "border-red-500 focus:ring-red-500"
                    : "border-slate-200 focus:ring-amber-500"
                }`}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-amber-500 hover:text-amber-600"
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
              {validationErrors.password && (
                <p className="text-red-500 text-sm mt-1">{validationErrors.password}</p>
              )}
            </div>

            {/* Forgot Password Link */}
            <div className="text-right">
            
              <Link
                to="/reset-password"
                className="text-sm text-amber-600 hover:underline"
              >
                Forgot Password?
              </Link>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLogging}
              className={`w-full py-3 rounded-lg text-white font-semibold transition duration-300 flex items-center justify-center space-x-2 ${
                isLogging
                  ? "bg-slate-400 cursor-not-allowed"
                  : "bg-amber-500 hover:bg-amber-600 hover:shadow-lg"
              }`}
            >
              {isLogging ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Signing in...
                </>
              ) : (
                <>
                  <FaSignInAlt />
                  <span>Sign in</span>
                </>
              )}
            </button>
          </form>

          {/* Signup Link */}
          <div className="text-center mt-6">
            <p className="text-sm text-slate-600">
              Don't have an account?{" "}
              <Link
                to="/signup"
                className="text-amber-600 hover:underline font-semibold flex items-center justify-center space-x-2"
              >
                <FaUser />
                <span>Sign Up</span>
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SigninPage;
