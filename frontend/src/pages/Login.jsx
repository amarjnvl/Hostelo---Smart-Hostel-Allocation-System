import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { sendOtp, verifyOtp } from "../redux/slices/studentSlice";
import { useNavigate, Navigate } from "react-router-dom";

const Login = () => {
    const [rollNo, setRollNo] = useState("");
    const [otp, setOtp] = useState("");
    const [error, setError] = useState("");
    const [isOtpSent, setIsOtpSent] = useState(false);
    const dispatch = useDispatch();
    const { loading } = useSelector((state) => state.student);
    const navigate = useNavigate();

    // Check if already authenticated
    const token = localStorage.getItem('token');
    if (token) {
        return <Navigate to="/" replace />;
    }

    const handleOtpSend = async (e) => {
        e.preventDefault();
        if (!rollNo) {
            setError("Please enter roll number");
            return;
        }

        try {
            setError("");
            await dispatch(sendOtp(rollNo)).unwrap();
            setIsOtpSent(true);
        } catch (err) {
            setError(err.message || "Failed to send OTP");
        }
    };

    const handleOtpVerify = async (e) => {
        e.preventDefault();
        if (!rollNo || !otp) {
            setError("Please enter both roll number and OTP");
            return;
        }

        try {
            setError("");
            const response = await dispatch(verifyOtp({ rollNo, otp })).unwrap();
            if (response.token) {
                localStorage.setItem("token", response.token);
                localStorage.setItem("rollNo", rollNo);
                navigate('/', { replace: true });
            }
        } catch (err) {
            setError(err.message || "Verification failed");
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8">
                <div className="text-center">
                    <div className="mx-auto h-16 w-16 bg-blue-600 rounded-full flex items-center justify-center mb-4">
                        <svg className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-4m-5 0H3m2 0h4M9 7h6m-6 4h6m-6 4h6" />
                        </svg>
                    </div>
                    <h2 className="text-3xl font-extrabold text-gray-900 mb-2">
                        ResidenceHub Portal
                    </h2>
                    <p className="text-gray-600">Sign in to access your student housing account</p>
                </div>
                <div className="bg-white py-8 px-6 shadow-xl rounded-xl">
                    <form className="space-y-6">
                        <div>
                            <label htmlFor="rollNo" className="block text-sm font-medium text-gray-700 mb-2">
                                Student ID
                            </label>
                            <input
                                id="rollNo"
                                type="text"
                                required
                                value={rollNo}
                                onChange={(e) => setRollNo(e.target.value)}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                placeholder="Enter your student ID"
                                disabled={isOtpSent}
                            />
                        </div>
                        {isOtpSent && (
                            <div>
                                <label htmlFor="otp" className="block text-sm font-medium text-gray-700 mb-2">
                                    Verification Code
                                </label>
                                <input
                                    id="otp"
                                    type="text"
                                    required
                                    value={otp}
                                    onChange={(e) => setOtp(e.target.value)}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                    placeholder="Enter the 6-digit code"
                                />
                                <p className="mt-2 text-sm text-gray-600">
                                    Check your email for the verification code
                                </p>
                            </div>
                        )}

                        {error && (
                            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                                <div className="flex">
                                    <div className="flex-shrink-0">
                                        <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                        </svg>
                                    </div>
                                    <div className="ml-3">
                                        <p className="text-sm">{error}</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        <button
                            type="submit"
                            onClick={isOtpSent ? handleOtpVerify : handleOtpSend}
                            disabled={loading}
                            className="w-full flex justify-center items-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            {loading && (
                                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V8l4 4-4 4V8a8 8 0 11-8 8z"></path>
                                </svg>
                            )}
                            {loading ? (
                                "Processing..."
                            ) : isOtpSent ? (
                                "Verify Code & Sign In"
                            ) : (
                                "Send Verification Code"
                            )}
                        </button>
                    </form>
                </div>
                
                <div className="text-center">
                    <p className="text-sm text-gray-600">
                        Need help? Contact{' '}
                        <a href="mailto:housing@university.edu" className="font-medium text-blue-600 hover:text-blue-500">
                            housing support
                        </a>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Login;

