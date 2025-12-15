import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-dom';
import { UserPlus, KeyRound, Users, X, Loader2 } from 'lucide-react';
import api from '../utils/api';
import Sidebar from '../components/Sidebar';
import GlassCard from '../components/ui/GlassCard';

const Request = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [statusMsg, setStatusMsg] = useState('');
    const [roommateGroup, setRoommateGroup] = useState([]);
    const [hostelName, setHostelName] = useState('');
    const [friendRollNo, setFriendRollNo] = useState('');
    const [otpSent, setOtpSent] = useState(false);
    const [otp, setOtp] = useState('');
    const { student } = useSelector((state) => state.student);
    const navigate = useNavigate();
    const location = useLocation();
    const hostelId = new URLSearchParams(location.search).get('hostelId');

    const fetchGroupAndHostelDetails = async () => {
        try {
            setLoading(true);
            if (!student?.groupId) return;

            const groupResponse = await api.get(`/students/group/${student.groupId}`);
            if (groupResponse.data.success) {
                setRoommateGroup(groupResponse.data.data);
                const hId = groupResponse.data.data[0]?.groupHostelChoice;
                if (hId && typeof hId === 'string') {
                    const hostelResponse = await api.get(`/hostels/${hId}`);
                    if (hostelResponse.data.success) {
                        setHostelName(hostelResponse.data.data.name);
                    }
                }
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to fetch details');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchGroupAndHostelDetails();
    }, [student?.groupId]);

    const sendOtp = async () => {
        try {
            setLoading(true);
            setError(null);
            await api.post('/roommates/send-otp', { toRoll: friendRollNo, hostelId });
            setOtpSent(true);
            setStatusMsg('OTP sent! Ask your friend for the code.');
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to send OTP');
        } finally {
            setLoading(false);
        }
    };

    const verifyOtp = async () => {
        try {
            setLoading(true);
            setError(null);
            await api.post('/roommates/verify-otp', { toRoll: friendRollNo, otp, hostelId });
            setFriendRollNo('');
            setOtp('');
            setOtpSent(false);
            setStatusMsg('Roommate added successfully!');
            fetchGroupAndHostelDetails();
        } catch (err) {
            setError(err.response?.data?.message || 'Verification failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen">
            <Sidebar />
            <main className="flex-1 p-8 overflow-y-auto">
                <header className="mb-8">
                    <h1 className="text-3xl font-bold text-text-main">Roommate Requests</h1>
                    <p className="text-text-muted">Invite friends to your group</p>
                </header>

                <div className="max-w-2xl mx-auto space-y-6">
                    {/* Add Roommate Section */}
                    {hostelId ? (
                        student?.groupId && !student?.isLeader ? (
                            <GlassCard className="text-center py-8 border-electric-blue/30 bg-electric-blue/5">
                                <Users size={32} className="mx-auto text-electric-blue mb-3" />
                                <h2 className="text-xl font-semibold text-white mb-2">Member View</h2>
                                <p className="text-slate-300">
                                    You are a member of this group. Only the <span className="text-electric-blue font-bold">Group Leader</span> can add new roommates.
                                </p>
                            </GlassCard>
                        ) : (
                            <GlassCard>
                                <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                                    <UserPlus className="text-electric-blue" /> Add Roommate
                                </h2>
                                <div className="space-y-4">
                                    <div>
                                        <label className="text-xs font-medium text-slate-300 uppercase tracking-wider">Friend's Roll Number</label>
                                        <input
                                            type="text"
                                            value={friendRollNo}
                                            onChange={(e) => setFriendRollNo(e.target.value)}
                                            className="w-full mt-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-electric-blue/50 focus:bg-white/10 transition-all font-mono"
                                            placeholder="Enter roll number"
                                            disabled={otpSent}
                                        />
                                    </div>

                                    {!otpSent ? (
                                        <button
                                            onClick={sendOtp}
                                            disabled={!friendRollNo || loading}
                                            className="w-full py-3 bg-electric-blue hover:bg-sky-400 text-slate-900 font-bold rounded-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                                        >
                                            {loading ? <Loader2 className="animate-spin" /> : 'Send OTP'}
                                        </button>
                                    ) : (
                                        <>
                                            <div>
                                                <label className="text-xs font-medium text-slate-300 uppercase tracking-wider">Enter OTP</label>
                                                <input
                                                    type="text"
                                                    value={otp}
                                                    onChange={(e) => setOtp(e.target.value)}
                                                    className="w-full mt-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-electric-blue/50 focus:bg-white/10 transition-all font-mono tracking-widest text-lg"
                                                    placeholder="• • • • • •"
                                                />
                                            </div>
                                            <button
                                                onClick={verifyOtp}
                                                disabled={!otp || loading}
                                                className="w-full py-3 bg-nitt-gold hover:bg-yellow-400 text-slate-900 font-bold rounded-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                                            >
                                                {loading ? <Loader2 className="animate-spin" /> : 'Verify & Add'}
                                            </button>
                                        </>
                                    )}
                                </div>
                            </GlassCard>
                        )
                    ) : (
                        <GlassCard className="text-center py-12">
                            <Users size={48} className="mx-auto text-text-muted mb-4" />
                            <h2 className="text-xl font-semibold text-text-main mb-2">No Active Hostel Registration</h2>
                            <p className="text-text-muted mb-6">You need to select a hostel first to invite roommates.</p>
                            <button
                                onClick={() => navigate('/hostels')}
                                className="px-6 py-2 bg-electric-blue hover:bg-sky-400 text-slate-900 font-bold rounded-xl transition-all"
                            >
                                Select Hostel
                            </button>
                        </GlassCard>
                    )}

                    {/* Current Group */}
                    {roommateGroup.length > 0 && (
                        <GlassCard>
                            <h2 className="text-xl font-semibold text-text-main mb-4 flex items-center gap-2">
                                <Users className="text-nitt-gold" /> Your Group
                            </h2>
                            {hostelName && <p className="text-electric-blue mb-4">Hostel: {hostelName}</p>}
                            <div className="space-y-2">
                                {roommateGroup.map((member) => (
                                    <div key={member._id} className="flex items-center justify-between p-3 bg-glass-bg rounded-lg border border-glass-border">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-xs text-white">
                                                {member.name[0]}
                                            </div>
                                            <div>
                                                <p className="font-medium text-sm text-text-main">{member.name}</p>
                                                <p className="text-xs text-text-muted">{member.rollNo}</p>
                                            </div>
                                        </div>
                                        {member.isLeader && <span className="text-[10px] bg-electric-blue/20 text-electric-blue px-2 py-1 rounded">Leader</span>}
                                    </div>
                                ))}
                            </div>
                        </GlassCard>
                    )}

                    {/* Messages */}
                    {(error || statusMsg) && (
                        <div className={`p-4 rounded-xl text-sm text-center ${error ? 'bg-red-500/10 border border-red-500/30 text-red-300' : 'bg-green-500/10 border border-green-500/30 text-green-300'}`}>
                            {error || statusMsg}
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};

export default Request;