import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchProfile } from "../redux/slices/studentSlice";
import { fetchHostels } from "../redux/slices/hostelSlice";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Button from "../components/Button";
import api from "../utils/api";

const HostelList = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [loadingSelect, setLoadingSelect] = useState(false);

  const { student } = useSelector((state) => state.student);
  const { hostels, loading, error } = useSelector((state) => state.hostels);

  useEffect(() => {
    const rollNo = localStorage.getItem("rollNo");
    if (!student && rollNo) {
      dispatch(fetchProfile(rollNo));
    }
  }, [student, dispatch]);

  useEffect(() => {
    if (student?.college) {
      dispatch(fetchHostels(student.college));
    }
  }, [student, dispatch]);

  const handleHostelSelect = async (hostelId) => {
    if (!hostelId) {
      console.error("Hostel ID is undefined", hostelId);
      return;
    }

    try {
      setLoadingSelect(true);
      await api.post("/students/register", {
        hostelId: hostelId, // <-- send hostelId as required by backend
      });

      console.log("Hostel selected successfully", hostelId);

      // 2. Ask if they want roommates
      const wantsRoommate = window.confirm("Would you like to add roommates?");

      if (wantsRoommate) {
        navigate(`/requests?hostelId=${hostelId}`);
      } else {
        alert("You'll be allocated a room with random roommates later.");
        navigate("/dashboard");
      }
    } catch (err) {
      console.error(err.response?.data?.message || "An error occurred");
      alert(err.response?.data?.message || "An error occurred");
    } finally {
      setLoadingSelect(false);
    }
  };

  const filteredHostels = hostels.filter(
    (hostel) =>
      hostel.gender === student?.gender &&
      hostel.isAvailableForAllocation // Only show available hostels
  );

  return (
    <div className="flex min-h-screen bg-blue-50">
      <Sidebar />
      <div className="flex-1 p-6 md:p-10">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Student Housing</h1>
          <p className="text-gray-600">Select your preferred residence hall and manage accommodation preferences</p>
        </div>

        {student && student.isAllocated ? (
          <div className="bg-white p-6 rounded-xl shadow-md mb-8">
            <div className="flex items-center mb-4">
              <div className="flex-shrink-0">
                <svg className="h-8 w-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h2 className="ml-3 text-xl font-bold text-gray-800">Housing Successfully Allocated</h2>
            </div>
            <div className="space-y-2 mb-6">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Student Name</p>
                  <p className="font-semibold text-gray-800">{student.name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Student ID</p>
                  <p className="font-semibold text-gray-800">{student.rollNo}</p>
                </div>
              </div>
              <div className="mt-4 p-4 bg-green-50 rounded-lg">
                <p className="text-green-800 font-medium">Your accommodation has been successfully processed and allocated.</p>
              </div>
            </div>
            <Button
              text="View Allocation Details"
              onClick={() => navigate('/dashboard')}
              className="bg-blue-600 hover:bg-blue-700"
            />
          </div>
        ) : student && student.preferredHostel ? (
          <div className="bg-white p-6 rounded-xl shadow-md mb-8">
            <div className="flex items-center mb-4">
              <div className="flex-shrink-0">
                <svg className="h-8 w-8 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h2 className="ml-3 text-xl font-bold text-gray-800">Registration Complete</h2>
            </div>
            <div className="grid md:grid-cols-3 gap-4 mb-6">
              <div>
                <p className="text-sm text-gray-600">Student Name</p>
                <p className="font-semibold text-gray-800">{student.name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Student ID</p>
                <p className="font-semibold text-gray-800">{student.rollNo}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Preferred Residence</p>
                <p className="font-semibold text-gray-800">{student.preferredHostel.name}</p>
              </div>
            </div>
            {student.pendingGroupRequest && (
              <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                <p className="text-blue-800 mb-3">You have indicated interest in roommate matching.</p>
                <Button
                  text="Manage Roommate Preferences"
                  onClick={() => navigate(`/requests?hostelId=${student.preferredHostel._id}`)}
                  className="bg-blue-600 hover:bg-blue-700"
                />
              </div>
            )}
          </div>
        ) : (
          <div className="bg-white rounded-xl p-8 shadow-md">
            <div className="mb-6">
              <h2 className="text-2xl font-semibold text-gray-800 mb-2">Select Residence Hall</h2>
              <p className="text-gray-600">Choose your preferred accommodation from the available options below</p>
            </div>
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <span className="ml-3 text-gray-600">Loading available accommodations...</span>
              </div>
            ) : error ? (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                <p>{error}</p>
              </div>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {filteredHostels.map((hostel) => (
                  <div key={hostel._id} className="p-6 bg-white shadow-md rounded-xl border border-gray-200 hover:shadow-lg transition-shadow">
                    <div className="mb-4">
                      <h3 className="text-xl font-semibold text-gray-800 mb-2">{hostel.name}</h3>
                      <div className="space-y-2 text-sm text-gray-600">
                        <div className="flex justify-between">
                          <span>Total Rooms:</span>
                          <span className="font-medium">{hostel.totalRooms}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Room Capacity:</span>
                          <span className="font-medium">{hostel.roomCapacity} students</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Type:</span>
                          <span className="font-medium capitalize">{hostel.gender} residence</span>
                        </div>
                      </div>
                    </div>
                    <Button
                      text={loadingSelect ? "Processing..." : "Select This Residence"}
                      onClick={() => handleHostelSelect(hostel._id)}
                      disabled={loadingSelect}
                      className="w-full bg-blue-600 hover:bg-blue-700"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default HostelList;

