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
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4">
      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-md">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">Email Verification</h1>
          
          {verificationStatus.loading ? (
            <div className="mt-6">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
              <p className="mt-4 text-gray-600">{verificationStatus.message}</p>
            </div>
          ) : (
            <div className="mt-6">
              <div className={`mx-auto flex items-center justify-center h-16 w-16 rounded-full ${verificationStatus.success ? 'bg-green-100' : 'bg-red-100'}`}>
                {verificationStatus.success ? (
                  <svg className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  <svg className="h-8 w-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                )}
              </div>
              
              <p className={`mt-4 text-lg ${verificationStatus.success ? 'text-green-600' : 'text-red-600'}`}>
                {verificationStatus.message}
              </p>
              
              {verificationStatus.success ? (
                <p className="mt-2 text-gray-600"><button onClick={()=>window.location.href="/signin"}>Go to Home</button>You can now close this page and log in to your account.</p>
              ) : (
                <button 
                  className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  onClick={() => window.location.href = "/signin"}
                >
                  Return to Login
                </button>
              )}
            </div>
          )}
        </div>
      </div>
      
      <p className="mt-8 text-center text-gray-500">
        &copy; {new Date().getFullYear()} Auction System. All rights reserved.
      </p>
    </div>
  );
};