import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../utils/api';
import Sidebar from '../components/Sidebar';
import { fetchProfile } from '../redux/slices/studentSlice';
import GlassCard from '../components/ui/GlassCard';
import { Users, User, ArrowRight, Loader2 } from 'lucide-react';

const HostelAllocation = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [roommatePreference, setRoommatePreference] = useState(0);
  const { student } = useSelector((state) => state.student);
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();

  const searchParams = new URLSearchParams(location.search);
  const hostelId = searchParams.get('hostelId');
  const capacity = parseInt(searchParams.get('capacity') || '1');

  // If no hostelId, redirect back
  useEffect(() => {
    if (!hostelId) {
      navigate('/hostels');
    }
  }, [hostelId, navigate]);

  const handleConfirm = async () => {
    try {
      setLoading(true);
      setError(null);

      // 1. Set Preference
      await api.post('/students/roommate-preference', {
        desiredCount: roommatePreference
      });

      // 2. Register for Hostel
      const regResponse = await api.post('/students/register', { hostelId });

      // 3. Update Profile State
      if (student?.rollNo) {
        dispatch(fetchProfile(student.rollNo));
      }

      // 4. Navigate
      if (roommatePreference > 0) {
        // Go to requests page to add friends
        navigate(`/requests?hostelId=${hostelId}`);
      } else {
        navigate('/dashboard');
      }

    } catch (err) {
      console.error('Registration failed:', err);
      setError(err.response?.data?.message || 'Failed to complete registration');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-academic-navy">
      <Sidebar />
      <div className="flex-1 p-6 md:p-10 flex items-center justify-center">
        <GlassCard className="max-w-2xl w-full p-8">
          <header className="mb-8 text-center">
            <h1 className="text-3xl font-bold text-white mb-2">Roommate Preferences</h1>
            <p className="text-slate-400">
              This room has a capacity of <span className="text-electric-blue font-bold">{capacity}</span>.
              How would you like to proceed?
            </p>
          </header>

          <div className="space-y-4 mb-8">
            <div
              onClick={() => setRoommatePreference(0)}
              className={`p-6 rounded-xl border-2 cursor-pointer transition-all flex items-center gap-4 ${roommatePreference === 0
                  ? 'bg-electric-blue/20 border-electric-blue shadow-lg shadow-electric-blue/10'
                  : 'bg-white/5 border-white/10 hover:border-white/20 hover:bg-white/10'
                }`}
            >
              <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${roommatePreference === 0 ? 'border-electric-blue' : 'border-slate-500'
                }`}>
                {roommatePreference === 0 && <div className="w-3 h-3 bg-electric-blue rounded-full" />}
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                  <User size={20} /> Solo / Random
                </h3>
                <p className="text-sm text-slate-400">
                  I don't have a group. Allocate me a room randomly or with random roommates.
                </p>
              </div>
            </div>

            {capacity > 1 && (
              <div
                onClick={() => setRoommatePreference(1)}
                className={`p-6 rounded-xl border-2 cursor-pointer transition-all flex items-center gap-4 ${roommatePreference === 1
                    ? 'bg-electric-blue/20 border-electric-blue shadow-lg shadow-electric-blue/10'
                    : 'bg-white/5 border-white/10 hover:border-white/20 hover:bg-white/10'
                  }`}
              >
                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${roommatePreference === 1 ? 'border-electric-blue' : 'border-slate-500'
                  }`}>
                  {roommatePreference === 1 && <div className="w-3 h-3 bg-electric-blue rounded-full" />}
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                    <Users size={20} /> I have 1 friend
                  </h3>
                  <p className="text-sm text-slate-400">
                    Create a group for me and 1 friend.
                  </p>
                </div>
              </div>
            )}

            {capacity > 2 && (
              <div
                onClick={() => setRoommatePreference(2)}
                className={`p-6 rounded-xl border-2 cursor-pointer transition-all flex items-center gap-4 ${roommatePreference === 2
                    ? 'bg-electric-blue/20 border-electric-blue shadow-lg shadow-electric-blue/10'
                    : 'bg-white/5 border-white/10 hover:border-white/20 hover:bg-white/10'
                  }`}
              >
                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${roommatePreference === 2 ? 'border-electric-blue' : 'border-slate-500'
                  }`}>
                  {roommatePreference === 2 && <div className="w-3 h-3 bg-electric-blue rounded-full" />}
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                    <Users size={20} /> I have 2 friends
                  </h3>
                  <p className="text-sm text-slate-400">
                    Create a group for me and 2 friends.
                  </p>
                </div>
              </div>
            )}
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/50 text-red-200 rounded-xl text-center">
              {error}
            </div>
          )}

          <button
            onClick={handleConfirm}
            disabled={loading}
            className="w-full py-4 bg-gradient-to-r from-electric-blue to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white font-bold rounded-xl shadow-lg shadow-blue-500/20 disabled:opacity-50 transition-all flex items-center justify-center gap-2 text-lg"
          >
            {loading ? <Loader2 className="animate-spin" /> : 'Confirm & Register'} <ArrowRight size={20} />
          </button>
        </GlassCard>
      </div>
    </div>
  );
};

export default HostelAllocation;
