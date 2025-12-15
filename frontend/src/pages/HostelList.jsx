import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchProfile } from "../redux/slices/studentSlice";
import { fetchHostels } from "../redux/slices/hostelSlice";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import api from "../utils/api";
import GlassCard from "../components/ui/GlassCard";
import { Building2, Bed, CheckCircle } from "lucide-react";

const HostelList = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [loadingSelect, setLoadingSelect] = useState(false);

  const { student, loading: studentLoading } = useSelector((state) => state.student);
  const { hostels, loading, error } = useSelector((state) => state.hostels);

  useEffect(() => {
    const rollNo = localStorage.getItem("rollNo");
    if (!student && rollNo) {
      dispatch(fetchProfile(rollNo));
    }
  }, [student, dispatch]);

  useEffect(() => {
    const collegeId = student?.college?._id || student?.college;
    if (collegeId) {
      dispatch(fetchHostels(collegeId));
    }
  }, [student, dispatch]);

  const handleHostelSelect = async (hostel) => {
    try {
      if (hostel.roomCapacity > 1) {
        navigate(`/allocation?hostelId=${hostel._id}&capacity=${hostel.roomCapacity}`);
        return;
      }

      setLoadingSelect(true);
      await api.post("/students/register", { hostelId: hostel._id });

      // Update local profile state immediately
      if (student?.rollNo) {
        dispatch(fetchProfile(student.rollNo));
      }
      navigate("/dashboard");
    } catch (err) {
      alert(err.response?.data?.message || "An error occurred");
    } finally {
      setLoadingSelect(false);
    }
  };

  // Debug: Log student and hostels data
  useEffect(() => {
    console.log('Student data:', student);
    console.log('Hostels data:', hostels);
  }, [student, hostels]);

  const filteredHostels = hostels.filter(
    (hostel) => {
      const genderMatch = hostel.gender === student?.gender;
      const yearMatch = hostel.allowedYears ? hostel.allowedYears.includes(student?.year) : true;
      const available = hostel.isAvailableForAllocation !== false; // Allow if undefined or true

      console.log(`Hostel ${hostel.name}: gender=${genderMatch}, year=${yearMatch}, available=${available}`);

      return genderMatch && yearMatch && available;
    }
  );

  if (studentLoading || (!student && localStorage.getItem('rollNo'))) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-academic-navy">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-electric-blue"></div>
          <p className="text-electric-blue animate-pulse">Loading student profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 p-8 overflow-y-auto">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-text-main">Select Your Hostel</h1>
          <p className="text-text-muted">Showing eligible hostels for Year {student?.year}</p>
        </header>

        {student?.preferredHostel ? (
          <GlassCard className="max-w-xl mx-auto text-center py-12">
            <CheckCircle size={64} className="mx-auto text-green-400 mb-4" />
            <h2 className="text-2xl font-bold text-white mb-2">Registered Successfully</h2>
            <p className="text-slate-400 mb-6">
              You have registered for <strong>{student.preferredHostel.name}</strong>.
              Allocation results will be published soon.
            </p>
            <button
              onClick={() => navigate('/dashboard')}
              className="px-6 py-2 bg-electric-blue text-slate-900 font-bold rounded-lg hover:bg-sky-400 transition"
            >
              Go to Dashboard
            </button>
          </GlassCard>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {loading ? (
              <p className="text-electric-blue">Loading hostels...</p>
            ) : filteredHostels.length > 0 ? (
              filteredHostels.map((hostel) => (
                <GlassCard key={hostel._id} className="flex flex-col h-full bg-white/5">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-white">{hostel.name}</h3>
                      <span className="text-xs px-2 py-0.5 rounded bg-nitt-gold/20 text-nitt-gold border border-nitt-gold/30">
                        Year {hostel.allowedYears?.join(', ')}
                      </span>
                    </div>
                    <Building2 className="text-electric-blue opacity-50" />
                  </div>

                  <div className="space-y-2 mb-6 flex-1">
                    <p className="text-sm text-slate-300 flex items-center gap-2">
                      <Bed size={16} /> Capacity: {hostel.roomCapacity} Sharing
                    </p>
                    <p className="text-sm text-slate-300">
                      Rooms: {hostel.totalRooms}
                    </p>
                  </div>

                  <button
                    onClick={() => handleHostelSelect(hostel)}
                    disabled={loadingSelect}
                    className="w-full py-3 bg-gradient-to-r from-electric-blue to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white font-semibold rounded-xl transition-all shadow-lg shadow-blue-500/20 disabled:opacity-50"
                  >
                    {loadingSelect ? "Processing..." : "Select Hostel"}
                  </button>
                </GlassCard>
              ))
            ) : (
              <div className="col-span-full text-center text-slate-400 py-12">
                No hostels available for your criteria.
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default HostelList;
