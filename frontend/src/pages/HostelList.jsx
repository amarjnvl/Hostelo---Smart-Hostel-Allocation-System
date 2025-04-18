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
    if (student?.college?._id) {
      dispatch(fetchHostels(student.college._id));
    }
  }, [student, dispatch]);

  const handleHostelSelect = async (hostelId) => {
    if (!student?.rollNo) return;

    try {
      setLoadingSelect(true);

      // 1. Register preferred hostel
      try {
        await api.post("/students/register", {
          preferredHostel: hostelId,
        });
      } catch (error) {
        const message = error.response?.data?.message || "Failed to register hostel preference";
        alert(message);
        setLoadingSelect(false);
        return;
      }

      // 2. Ask if they want roommates
      const wantsRoommate = window.confirm("Would you like to add roommates?");

      if (wantsRoommate) {
        // Navigate to roommate request page
        navigate(`/requests?hostelId=${hostelId}`);
      } else {
        // If no roommates wanted, inform user and navigate to dashboard
        alert("You'll be allocated a room with random roommates later.");
        navigate("/dashboard");
      }

    } catch (err) {
      alert(err.response?.data?.message || "An error occurred");
    } finally {
      setLoadingSelect(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-blue-50">
      <Sidebar />
      <div className="flex-1 p-6 md:p-10">
        <h1 className="text-3xl font-bold mb-6 text-gray-800">Hostel Allocation</h1>

        {student && student.preferredHostel ? (
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
                {hostels.map((hostel) => (
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
