import { useAuth } from "@/Contexts/AuthContext";
import { useInfo } from "@/hooks/loggedinUser";
import axios from "axios";
import { useState } from "react";

export const ResendVerificationEmail = function () {
  const userId = useInfo();
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  const handleResendVerificationEmail = async () => {
    try {
      setIsLoading(true);
      setMessage({ type: "", text: "" });
      
      const response = await axios.post("http://localhost:3001/api/v1/user/resendverificationemail", { userId:Number(userId) });
      
      if (response.status === 200) {
        setMessage({ 
          type: "success", 
          text: "Verification email sent successfully! Please check your inbox." 
        });
      }
    } catch (error) {
      setMessage({ 
        type: "error", 
        text: "Failed to send verification email. Please try again later." 
      });
      console.error("Error sending verification email:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-slate-800 mb-4">Email Verification</h2>
      
      <p className="text-slate-600 mb-6">
        {/* Please verify your email address <span className="font-medium text-slate-800">{userId}</span> to complete your registration and access all features. */}
      </p>
      
      {message.text && (
        <div className={`p-4 mb-6 rounded-md ${
          message.type === "success" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"
        }`}>
          {message.text}
        </div>
      )}
      
      <button 
        onClick={handleResendVerificationEmail}
        disabled={isLoading}
        className="w-full flex justify-center items-center px-4 py-3 bg-amber-500 hover:bg-amber-600 text-white font-medium rounded-md transition duration-300 disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {isLoading ? (
          <>
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Sending...
          </>
        ) : (
          <>
            <svg className="w-5 h-5 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            Resend Verification Email
          </>
        )}
      </button>
      
      <p className="text-sm text-slate-500 mt-4 text-center">
        Didn't receive an email? Check your spam folder or try again in a few minutes.
      </p>
    </div>
  );
};