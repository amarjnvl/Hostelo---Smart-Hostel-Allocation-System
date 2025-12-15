import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Home, Users, BedDouble, LogOut, ShieldCheck, AlertCircle } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import api from '../utils/api';
import GlassCard from '../components/ui/GlassCard';

const Dashboard = () => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [roommateGroup, setRoommateGroup] = useState([]);
    const [hostelName, setHostelName] = useState('');
    const [allocation, setAllocation] = useState(null);
    const navigate = useNavigate();

    const { student, loading: studentLoading } = useSelector((state) => state.student);

    useEffect(() => {
        const fetchAllDetails = async () => {
            try {
                setLoading(true);
                const allocationResponse = await api.get('/students/allocation');
                setAllocation(allocationResponse.data);

                if (!allocationResponse.data.allocated && student?.groupId) {
                    const groupResponse = await api.get(`/students/group/${student.groupId}`);
                    if (groupResponse.data.success) {
                        setRoommateGroup(groupResponse.data.data);
                        const hostelId = groupResponse.data.data[0]?.groupHostelChoice;
                        if (hostelId && typeof hostelId === 'string') {
                            const hostelResponse = await api.get(`/hostels/${hostelId}`);
                            if (hostelResponse.data.success) {
                                setHostelName(hostelResponse.data.data.name);
                            }
                        }
                    }
                }
            } catch (err) {
                setError(err.response?.data?.message || 'Failed to fetch details');
            } finally {
                setLoading(false);
            }
        };

        if (student) fetchAllDetails();
    }, [student, student?.groupId]);

    const handleLeaveGroup = async () => {
        try {
            await api.post('/students/leave-group');
            navigate(0); // Refresh
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to leave group');
        }
    };

    if (loading || studentLoading || !student) return (
        <div className="min-h-screen flex items-center justify-center bg-academic-navy text-electric-blue">
            <div className="flex flex-col items-center gap-4">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-electric-blue"></div>
                <p className="animate-pulse">Loading dashboard...</p>
            </div>
        </div>
    );

    return (
        <div className="flex min-h-screen">
            <Sidebar />
            <main className="flex-1 p-8 overflow-y-auto">
                <header className="mb-8 flex justify-between items-end">
                    <div>
                        <h1 className="text-4xl font-bold bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
                            Hello, {student?.name.split(' ')[0]}
                        </h1>
                        <p className="text-slate-400 mt-2">Year {student?.year} • {student?.rollNo}</p>
                    </div>
                    <div className="text-right">
                        <span className={`px-4 py-1 rounded-full text-sm font-medium border ${allocation?.allocated
                            ? 'bg-green-500/10 border-green-500/50 text-green-400'
                            : 'bg-nitt-gold/10 border-nitt-gold/50 text-nitt-gold'
                            }`}>
                            {allocation?.allocated ? 'Allocated' : 'Registration Open'}
                        </span>
                    </div>
                </header>

                {error && (
                    <div className="mb-6 p-4 bg-red-500/10 border border-red-500/50 text-red-200 rounded-xl flex items-center gap-3">
                        <AlertCircle size={20} />
                        {error}
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Status Card - Large */}
                    <GlassCard className="col-span-2 md:row-span-2 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-32 bg-electric-blue/5 rounded-full blur-3xl group-hover:bg-electric-blue/10 transition-all" />

                        <div className="relative z-10 h-full flex flex-col justify-between">
                            <div>
                                <h2 className="text-2xl font-semibold mb-2 flex items-center gap-2">
                                    <ShieldCheck className="text-electric-blue" />
                                    Allocation Status
                                </h2>
                                <p className="text-slate-400">Current status of your hostel room application.</p>
                            </div>

                            <div className="mt-8">
                                {allocation?.allocated ? (
                                    <div className="space-y-4">
                                        <div className="text-5xl font-bold text-white">{allocation.roomNumber}</div>
                                        <div className="text-2xl text-electric-blue">{allocation.hostel}</div>
                                        <div className="inline-block px-3 py-1 bg-green-500/20 text-green-400 rounded-md text-sm">Confirmed</div>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                                            <p className="text-nitt-gold mb-2">Pending Allocation</p>
                                            <p className="text-sm text-slate-300">
                                                {student?.isRegistered
                                                    ? "You have registered. Waiting for admin allocation."
                                                    : "You haven't registered yet."}
                                            </p>
                                        </div>
                                        {!student?.isRegistered && (
                                            <button
                                                onClick={() => navigate('/hostels')}
                                                className="px-6 py-2 bg-electric-blue hover:bg-sky-400 text-slate-900 font-bold rounded-lg transition-all"
                                            >
                                                Register Now
                                            </button>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </GlassCard>

                    {/* Roommates / Group Card */}
                    <GlassCard className="col-span-1 md:row-span-2" delay={0.1}>
                        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                            <Users className="text-nitt-gold" />
                            {allocation?.allocated ? "Roommates" : "Group"}
                        </h2>

                        <div className="space-y-3">
                            {allocation?.allocated ? (
                                allocation.roommates.length > 0 ? (
                                    allocation.roommates.map((mate, i) => (
                                        <div key={i} className="flex items-center gap-3 p-3 bg-white/5 rounded-lg border border-white/5">
                                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-electric-blue to-blue-600 flex items-center justify-center text-xs font-bold">
                                                {mate.name[0]}
                                            </div>
                                            <div>
                                                <p className="font-medium text-sm">{mate.name}</p>
                                                <p className="text-xs text-slate-400">{mate.rollNo}</p>
                                            </div>
                                        </div>
                                    ))
                                ) : <p className="text-slate-500 italic">Single Room</p>
                            ) : roommateGroup.length > 0 ? (
                                <>
                                    {roommateGroup.map((member) => (
                                        <div key={member._id} className="flex items-center justify-between p-3 bg-glass-bg rounded-lg border border-glass-border">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-xs text-white">
                                                    {member.name[0]}
                                                </div>
                                                <div>
                                                    <p className="font-medium text-sm text-text-main">{member.name}</p>
                                                    {member.isLeader && <span className="text-[10px] bg-electric-blue/20 text-electric-blue px-1 rounded">Leader</span>}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                    <div className="pt-4 border-t border-glass-border">
                                        <p className="text-xs text-text-muted mb-2">Preference: {hostelName || "None"}</p>
                                    </div>
                                </>
                            ) : (
                                <div className="text-center py-8 text-text-muted">
                                    <Users size={32} className="mx-auto mb-2 opacity-50" />
                                    <p>No group formed.</p>
                                    <button
                                        onClick={() => navigate('/requests')}
                                        className="mt-4 text-electric-blue text-sm hover:underline"
                                    >
                                        Create/Join Group
                                    </button>
                                </div>
                            )}
                        </div>
                    </GlassCard>

                    {/* Quick Info / Stats */}
                    <GlassCard delay={0.2}>
                        <h3 className="text-sm text-slate-400 mb-1">Hostel Eligibility</h3>
                        <p className="text-xl font-semibold uppercase tracking-wider">
                            Year {student?.year} Only
                        </p>
                    </GlassCard>

                    <GlassCard delay={0.3}>
                        <h3 className="text-sm text-slate-400 mb-1">Session</h3>
                        <p className="text-xl font-semibold">2025-2026</p>
                    </GlassCard>

                    <GlassCard delay={0.4} className="md:col-span-1">
                        <h3 className="text-sm text-slate-400 mb-1">Mess Menu</h3>
                        <div className="flex justify-between items-center">
                            <p className="text-lg font-medium">South Indian</p>
                            <span className="text-xs px-2 py-1 bg-green-500/20 text-green-400 rounded">Today</span>
                        </div>
                    </GlassCard>
                </div>
            </main>
        </div>
    );
};

export default Dashboard;