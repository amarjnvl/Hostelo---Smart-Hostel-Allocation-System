import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { sendOtp, verifyOtp } from "../redux/slices/studentSlice";
import { useNavigate } from "react-router-dom";

const Login = () => {
    const [rollNo, setRollNo] = useState("");
    const [otp, setOtp] = useState("");
    const [error, setError] = useState("");
    const [isOtpSent, setIsOtpSent] = useState(false);
    const dispatch = useDispatch();
    const { token, loading } = useSelector((state) => state.student);
    const navigate = useNavigate();

    useEffect(() => {
        // Check if user is already logged in
        const token = localStorage.getItem('token');
        if (token) {
            navigate('/dashboard');
        }
    }, [navigate]);

    useEffect(() => {
        if (token) {
            navigate("/dashboard");
        }
    }, [token, navigate]);

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
                navigate('/dashboard');
            }
        } catch (err) {
            setError(err.message || "Verification failed");
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8">
                <div>
                    <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                        Login to your account
                    </h2>
                </div>
                <form className="mt-8 space-y-6">
                    <div className="rounded-md shadow-sm -space-y-px">
                        <div>
                            <input
                                type="text"
                                required
                                value={rollNo}
                                onChange={(e) => setRollNo(e.target.value)}
                                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                                placeholder="Enter Roll Number"
                                disabled={isOtpSent}
                            />
                        </div>
                        {isOtpSent && (
                            <div>
                                <input
                                    type="text"
                                    required
                                    value={otp}
                                    onChange={(e) => setOtp(e.target.value)}
                                    className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                                    placeholder="Enter OTP"
                                />
                            </div>
                        )}
                    </div>

                    {error && (
                        <div className="text-red-500 text-sm text-center">
                            {error}
                        </div>
                    )}

                    <div>
                        <button
                            type="submit"
                            onClick={isOtpSent ? handleOtpVerify : handleOtpSend}
                            disabled={loading}
                            className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        >
                            {loading ? (
                                "Processing..."
                            ) : isOtpSent ? (
                                "Verify OTP"
                            ) : (
                                "Send OTP"
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Login;

