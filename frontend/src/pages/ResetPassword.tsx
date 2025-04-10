import axios from "axios"
import { useState } from "react"
import { FaLock } from "react-icons/fa"
import { useNavigate } from "react-router-dom"

export default function ResetPassword(){
    const [newPassword,setNewPassword]=useState("")
    const [confirmPassword, setConfirmPassword] = useState("")
    const [isLoading, setIsLoading] = useState(false)
    const [message, setMessage] = useState({ type: "", text: "" })
    const token2 = decodeURIComponent(window.location.href.split("=")[1])
    const navigate = useNavigate()

    const handleResetPassword=async()=>{
        if (newPassword !== confirmPassword) {
            setMessage({ type: "error", text: "Passwords do not match" })
            return
        }
        try {
            setIsLoading(true)
            setMessage({ type: "", text: "" })
            const response=await axios.post(`http://localhost:3001/api/v1/user/reset-password`,{newPassword,token:token2})
            setMessage({ 
                type: "success", 
                text: "Password reset successfully! You can now log in with your new password." 
            })
        } catch (error: any) {
            setMessage({ 
                type: "error", 
                text: error.response?.data?.error || "Failed to reset password. Please try again." 
            })
        } finally {
            setIsLoading(false)
        }
    }

    return(
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
            <div className="w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden">
                <div className="p-8">
                    <div className="text-center mb-6">
                        <h2 className="text-3xl font-bold text-slate-800 mb-2">
                            Set New Password
                        </h2>
                        <p className="text-sm text-slate-600">
                            Enter your new password below
                        </p>
                    </div>

                    {message.text && (
                        <div className={`p-4 mb-6 rounded-md ${
                            message.type === "success" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"
                        }`}>
                            {message.text}
                        </div>
                    )}

                    {message.type !== "success" ? (
                        <div className="space-y-6">
                            <div className="relative">
                                <FaLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-amber-500" />
                                <input 
                                    type="password" 
                                    placeholder="New Password" 
                                    value={newPassword}
                                    onChange={(e)=>setNewPassword(e.target.value)}
                                    className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                                    required
                                />
                            </div>

                            <div className="relative">
                                <FaLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-amber-500" />
                                <input 
                                    type="password" 
                                    placeholder="Confirm Password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                                    required
                                />
                            </div>

                            <button 
                                onClick={handleResetPassword}
                                disabled={isLoading}
                                className={`w-full py-3 rounded-lg text-white font-semibold transition duration-300 flex items-center justify-center space-x-2 ${
                                    isLoading
                                        ? "bg-slate-400 cursor-not-allowed"
                                        : "bg-amber-500 hover:bg-amber-600 hover:shadow-lg"
                                }`}
                            >
                                {isLoading ? (
                                    <>
                                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Resetting...
                                    </>
                                ) : (
                                    "Reset Password"
                                )}
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <p className="text-center text-slate-600">
                                Your password has been successfully reset. You can now log in with your new password.
                            </p>
                            <button
                                onClick={() => navigate("/signin")}
                                className="w-full py-3 rounded-lg bg-amber-500 text-white font-semibold hover:bg-amber-600 hover:shadow-lg transition duration-300"
                            >
                                Go to Sign In
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
