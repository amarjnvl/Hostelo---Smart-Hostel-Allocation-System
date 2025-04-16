import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { sendOtp, verifyOtp } from "../redux/slices/studentSlice";
import { useNavigate } from "react-router-dom";

const Login = () => {
    const [rollNo, setRollNo] = useState("");
    const [otp, setOtp] = useState("");
    const dispatch = useDispatch();
    const { token, loading, error } = useSelector((state) => state.student);
    const navigate = useNavigate();

    useEffect(() => {
        if (token) {
            navigate("/");
        }
    }, [token, navigate]);

    const handleOtpSend = async () => {
        if (rollNo) {
            try {
                // .unwrap() returns the value of the fulfilled promise, or throws the error if the promise is rejected.
                // It is used here to get the result of the sendOtp action, which is a promise.
                // If the promise is resolved, the result is returned, otherwise the error is thrown.
                const result = await dispatch(sendOtp(rollNo)).unwrap();
            } catch (err) {
                console.error("Failed to send OTP:", err);
            }
        }
    };

    const handleOtpVerify = async () => {
        if (rollNo && otp) {
            try {
                const result = await dispatch(verifyOtp({ rollNo, otp })).unwrap();
                if (result.token) {
                    // Store token in localStorage if not handled in slice
                    localStorage.setItem("token", result.token);
                    localStorage.setItem("rollNo", rollNo);
                }
            } catch (err) {
                console.error("Verification failed:", err?.message || "Unknown error");
            }
        }
    };

    return (
        <div className="login-container">
            <h2>Login</h2>
            <div className="form-group">
                <input
                    type="text"
                    placeholder="Enter Roll No"
                    value={rollNo}
                    onChange={(e) => setRollNo(e.target.value)}
                />
                <button onClick={handleOtpSend} disabled={loading}>
                    Send OTP
                </button>
            </div>

            <div className="form-group">
                <input
                    type="text"
                    placeholder="Enter OTP"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                />
                <button onClick={handleOtpVerify} disabled={loading}>
                    Verify OTP
                </button>
            </div>

            {error && <p className="error-message">{error}</p>}
        </div>
    );
};

export default Login;
