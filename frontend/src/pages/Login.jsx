import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { sendOtp, verifyOtp } from "../redux/slices/studentSlice";
import { useNavigate, Navigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, ArrowRight, Loader2, ShieldCheck, School } from "lucide-react";
import GlassCard from "../components/ui/GlassCard";

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
        return <Navigate to="/dashboard" replace />;
    }

    const handleOtpSend = async (e) => {
        e.preventDefault();
        if (!rollNo) {
            setError("Please enter your Roll Number");
            return;
        }

        try {
            setError("");
            await dispatch(sendOtp(rollNo)).unwrap();
            setIsOtpSent(true);
        } catch (err) {
            setError(err.message || "Failed to send OTP. Check Roll No.");
        }
    };

    const handleOtpVerify = async (e) => {
        e.preventDefault();
        if (!rollNo || !otp) {
            setError("Please enter both Roll Number and OTP");
            return;
        }

        try {
            setError("");
            const response = await dispatch(verifyOtp({ rollNo, otp })).unwrap();
            if (response.token) {
                localStorage.setItem("token", response.token);
                localStorage.setItem("rollNo", rollNo);
                navigate('/dashboard', { replace: true });
            }
        } catch (err) {
            setError(err.message || "Invalid OTP. Please try again.");
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
            {/* Background elements are handled by body style in index.css, adding overlay here */}
            <div className="absolute inset-0 bg-academic-navy/40 backdrop-blur-[2px] z-0" />

            <GlassCard className="w-full max-w-md relative z-10 !p-8 border-white/10 shadow-2xl shadow-black/50">
                <div className="text-center mb-10">
                    <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="w-16 h-16 bg-gradient-to-tr from-electric-blue to-blue-600 rounded-2xl mx-auto mb-6 flex items-center justify-center shadow-lg shadow-blue-500/30"
                    >
                        <School className="text-white w-8 h-8" />
                    </motion.div>

                    <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">
                        Hostelo <span className="text-electric-blue">Enterprise</span>
                    </h1>
                    <p className="text-slate-400 text-sm font-light">
                        NIT Trichy Hostels • Secure Access
                    </p>
                </div>

                <AnimatePresence mode="wait">
                    {!isOtpSent ? (
                        <motion.form
                            key="roll-form"
                            initial={{ x: -20, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            exit={{ x: -20, opacity: 0 }}
                            className="space-y-6"
                            onSubmit={handleOtpSend}
                        >
                            <div className="space-y-2">
                                <label className="text-xs font-medium text-slate-300 uppercase tracking-wider ml-1">Roll Number</label>
                                <div className="relative group">
                                    <input
                                        type="text"
                                        value={rollNo}
                                        onChange={(e) => setRollNo(e.target.value)}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 pl-11 text-white placeholder-slate-500 focus:outline-none focus:border-electric-blue/50 focus:bg-white/10 transition-all font-mono"
                                        placeholder="Enter your student ID"
                                    />
                                    <Mail className="absolute left-3.5 top-3.5 text-slate-500 w-5 h-5 group-focus-within:text-electric-blue transition-colors" />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-electric-blue hover:bg-sky-400 text-slate-900 font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2 group"
                            >
                                {loading ? <Loader2 className="animate-spin" /> : "Send Secure OTP"}
                                {!loading && <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />}
                            </button>
                        </motion.form>
                    ) : (
                        <motion.form
                            key="otp-form"
                            initial={{ x: 20, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            exit={{ x: 20, opacity: 0 }}
                            className="space-y-6"
                            onSubmit={handleOtpVerify}
                        >
                            <div className="text-center mb-6">
                                <p className="text-slate-300 text-sm">
                                    We sent a code to your registered email <br />
                                    <span className="text-electric-blue font-mono">@{rollNo}@example.com</span>
                                </p>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-medium text-slate-300 uppercase tracking-wider ml-1">One-Time Password</label>
                                <div className="relative group">
                                    <input
                                        type="text"
                                        value={otp}
                                        onChange={(e) => setOtp(e.target.value)}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 pl-11 text-white placeholder-slate-500 focus:outline-none focus:border-electric-blue/50 focus:bg-white/10 transition-all font-mono tracking-widest text-lg"
                                        placeholder="• • • • • •"
                                        autoFocus
                                    />
                                    <ShieldCheck className="absolute left-3.5 top-3.5 text-slate-500 w-5 h-5 group-focus-within:text-electric-blue transition-colors" />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-nitt-gold hover:bg-yellow-400 text-slate-900 font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-yellow-500/20 flex items-center justify-center gap-2"
                            >
                                {loading ? <Loader2 className="animate-spin" /> : "Verify & Login"}
                            </button>

                            <button
                                type="button"
                                onClick={() => setIsOtpSent(false)}
                                className="w-full text-sm text-slate-400 hover:text-white transition-colors"
                            >
                                ← Back to Roll Number
                            </button>
                        </motion.form>
                    )}
                </AnimatePresence>

                {error && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-6 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-200 text-sm text-center"
                    >
                        {error}
                    </motion.div>
                )}
            </GlassCard>

            <div className="absolute bottom-6 text-slate-500 text-xs text-center w-full z-10">
                &copy; 2025 Hostelo Inc. | Authorized Access Only
            </div>
        </div>
    );
};

export default Login;
