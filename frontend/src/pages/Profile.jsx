import React, { useEffect } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProfile } from '../redux/slices/studentSlice';
import { User, Mail, Hash, Building2 } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import GlassCard from '../components/ui/GlassCard';

const Profile = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { student, loading, error } = useSelector((state) => state.student);

  useEffect(() => {
    if (student === null) {
      const rollNo = localStorage.getItem('rollNo');
      if (rollNo) {
        dispatch(fetchProfile(rollNo));
      }
    }
  }, [dispatch, student]);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center text-electric-blue">Loading Profile...</div>;
  }

  if (error) {
    return <div className="min-h-screen flex items-center justify-center text-red-400">Error: {error}</div>;
  }

  if (!student && !loading) {
    localStorage.removeItem('token');
    localStorage.removeItem('rollNo');
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 p-8 overflow-y-auto">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-text-main">Student Profile</h1>
          <p className="text-text-muted">Your account details</p>
        </header>

        <GlassCard className="max-w-2xl mx-auto">
          <div className="flex flex-col items-center mb-8">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-electric-blue to-blue-600 flex items-center justify-center mb-4 shadow-lg shadow-blue-500/30">
              <User size={48} className="text-white" />
            </div>
            <h2 className="text-2xl font-bold text-text-main">{student?.name}</h2>
            <span className="text-sm px-3 py-1 rounded-full bg-nitt-gold/20 text-nitt-gold border border-nitt-gold/30 mt-2">
              Year {student?.year}
            </span>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="p-4 bg-glass-bg rounded-xl border border-glass-border">
              <div className="flex items-center gap-3 text-text-muted mb-1">
                <Mail size={16} /> Email
              </div>
              <p className="text-text-main font-medium">{student?.email}</p>
            </div>
            <div className="p-4 bg-glass-bg rounded-xl border border-glass-border">
              <div className="flex items-center gap-3 text-text-muted mb-1">
                <Hash size={16} /> Roll Number
              </div>
              <p className="text-text-main font-medium font-mono">{student?.rollNo}</p>
            </div>
          </div>

          <div className="mt-8 text-center">
            <button
              onClick={() => navigate('/hostels')}
              className="px-8 py-3 bg-electric-blue hover:bg-sky-400 text-slate-900 font-bold rounded-xl transition-all shadow-lg shadow-blue-500/20 inline-flex items-center gap-2"
            >
              <Building2 size={18} />
              Go to Hostel Allotment
            </button>
          </div>
        </GlassCard>
      </main>
    </div>
  );
};

export default Profile;
