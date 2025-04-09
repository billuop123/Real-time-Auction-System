import axios from "axios";
import { useEffect, useState } from "react";

export const VerifyEmail = () => {
  const [verificationStatus, setVerificationStatus] = useState({
    loading: true,
    success: false,
    message: "Verifying your email address..."
  });

  useEffect(() => {
    const verifyEmail = async () => {
      try {
        const token = window.location.search.split("=")[1];
        
        if (!token) {
          setVerificationStatus({
            loading: false,
            success: false,
            message: "Invalid verification link. Please request a new one."
          });
          return;
        }

        const response = await axios.post(`http://localhost:3001/api/v1/user/verifyemail`, {
          token
        });
        
        setVerificationStatus({
          loading: false,
          success: true,
          message: "Your email has been successfully verified!"
        });
      } catch (error:any) {
        setVerificationStatus({
          loading: false,
          success: false,
          message: error.response?.data?.message || "Invalid token. Please try again."
        });
      }
    };
    
    verifyEmail();
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-4">
      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-xl shadow-lg transform transition-all duration-300 hover:shadow-xl">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Email Verification</h1>
          <p className="text-gray-500 mb-8">Please wait while we verify your email address</p>
          
          {verificationStatus.loading ? (
            <div className="mt-6">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-500 border-t-transparent mx-auto"></div>
              <p className="mt-6 text-gray-600 text-lg">{verificationStatus.message}</p>
            </div>
          ) : (
            <div className="mt-6">
              <div className={`mx-auto flex items-center justify-center h-20 w-20 rounded-full transform transition-all duration-500 ${verificationStatus.success ? 'bg-green-100 scale-110' : 'bg-red-100'}`}>
                {verificationStatus.success ? (
                  <svg className="h-10 w-10 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  <svg className="h-10 w-10 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                )}
              </div>
              
              <p className={`mt-6 text-xl font-semibold ${verificationStatus.success ? 'text-green-600' : 'text-red-600'}`}>
                {verificationStatus.message}
              </p>
              
              {verificationStatus.success ? (
                <div className="mt-8 space-y-4">
                  <p className="text-gray-600">You can now close this page and log in to your account.</p>
                  <button
                    onClick={() => window.location.href = "/signin"}
                    className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-200"
                  >
                    Go to Sign In
                  </button>
                </div>
              ) : (
                <button 
                  className="mt-8 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-200"
                  onClick={() => window.location.href = "/signin"}
                >
                  Return to Login
                </button>
              )}
            </div>
          )}
        </div>
      </div>
      
      <p className="mt-12 text-center text-gray-500 text-sm">
        &copy; {new Date().getFullYear()} Auction System. All rights reserved.
      </p>
    </div>
  );
};
