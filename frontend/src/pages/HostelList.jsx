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
        <h1 className="text-3xl font-bold mb-6 text-gray-800">Hostel Allocation</h1>

        {student && student.isAllocated ? (
          <div className="bg-white p-6 rounded-xl shadow-md mb-8">
            <h2 className="text-xl font-bold mb-3 text-gray-800">Hostel Allocated!</h2>
            <div className="space-y-2 mb-6">
              <p><strong>Name:</strong> {student.name}</p>
              <p><strong>Roll No:</strong> {student.rollNo}</p>
              {/* <p><strong>Allocated Hostel:</strong> {student.preferredHostel.name}</p> */}
              <p className="text-green-600 font-medium">Your hostel has been successfully allocated.</p>
            </div>
            <Button
              text="Go to Dashboard"
              onClick={() => navigate('/dashboard')}
              className="bg-blue-500 hover:bg-blue-600"
            />
          </div>
        ) : student && student.preferredHostel ? (
          <div className="bg-white p-6 rounded-xl shadow-md mb-8">
            <h2 className="text-xl font-bold mb-3 text-gray-800">Registered</h2>
            <p><strong>Name:</strong> {student.name}</p>
            <p><strong>Roll No:</strong> {student.rollNo}</p>
            <p><strong>Preferred Hostel:</strong> {student.preferredHostel.name}</p>
            {student.pendingGroupRequest && (
              <div className="mt-4">
                <p>You chose to add roommates.</p>
                <Button
                  text="Continue Adding Roommates"
                  onClick={() => navigate(`/requests?hostelId=${student.preferredHostel._id}`)}
                />
              </div>
            )}
          </div>
        ) : (
          <div className="bg-white rounded-lg p-6 shadow-md">
            <h2 className="text-xl font-semibold mb-4">Choose Hostel</h2>
            {loading ? (
              <p>Loading hostels...</p>
            ) : error ? (
              <p className="text-red-500">{error}</p>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {filteredHostels.map((hostel) => (
                  <div key={hostel._id} className="p-5 bg-white shadow rounded-xl border">
                    <h3 className="text-lg font-semibold">{hostel.name}</h3>
                    <p>Total Rooms: {hostel.totalRooms}</p>
                    <p>Capacity: {hostel.roomCapacity}</p>
                    <Button
                      text={loadingSelect ? "Processing..." : "Choose This Hostel"}
                      onClick={() => handleHostelSelect(hostel._id)}
                      disabled={loadingSelect}
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

