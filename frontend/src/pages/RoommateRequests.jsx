import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Button from "../components/Button";
import api from "../utils/api";

const RoommateRequest = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const hostelId = new URLSearchParams(location.search).get("hostelId");

  const { student } = useSelector((state) => state.student);
  const [hostel, setHostel] = useState(null);
  const [roommateRequests, setRoommateRequests] = useState([]);
  const [friendRollNo, setFriendRollNo] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState("");
  const [statusMsg, setStatusMsg] = useState("");
  const [loading, setLoading] = useState(false);

  // Fetch hostel details and existing roommate requests on mount
  useEffect(() => {
    // if (!hostelId) {
    //   navigate("/hostels");
    //   return;
    // }

    const fetchHostelDetails = async () => {
      try {
        const res = await api.get(`/hostels/${hostelId}`);
        setHostel(res.data);
      } catch (err) {
        setStatusMsg("Failed to fetch hostel details");
      }
    };

    fetchHostelDetails();
  }, [hostelId, navigate]);

  const canAddMoreRoommates = () => {
    // Include the student themselves in the count
    return hostel && roommateRequests.length + 1 < hostel.roomCapacity;
  };

  const sendOtp = async () => {
    try {
      if (!canAddMoreRoommates()) {
        setStatusMsg(`Maximum capacity of ${hostel.roomCapacity} reached`);
        return;
      }

      setLoading(true);
      setStatusMsg("");

      const res = await api.post("/roommates/send-otp", {
        toRoll: friendRollNo,
        hostelId
      });

      setOtpSent(true);
      setStatusMsg("OTP sent to your friend's email. Ask them for it.");
    } catch (err) {
      setStatusMsg(err.response?.data?.message || "Failed to send OTP.");
    } finally {
      setLoading(false);
    }
  };

  const verifyOtp = async () => {
    try {
      setLoading(true);
      setStatusMsg("");

      const res = await api.post("/roommates/verify-otp", {
        toRoll: friendRollNo,
        otp
      });

      // Add the verified roommate to the list
      setRoommateRequests([...roommateRequests, {
        rollNo: friendRollNo,
        status: 'verified',
        timestamp: new Date()
      }]);

      // Reset form for next roommate
      setFriendRollNo("");
      setOtp("");
      setOtpSent(false);

      setStatusMsg("Roommate verified successfully! You can add another roommate if allowed.");

      // If max capacity reached, show all selected roommates
      if (roommateRequests.length + 1 >= hostel?.roomCapacity) {
        setStatusMsg("Room capacity reached. Roommates selected:");
        roommateRequests.forEach(request => {
          setStatusMsg(prev => `${prev}\n- ${request.rollNo}`);
        });
      }
    } catch (err) {
      setStatusMsg(err.response?.data?.message || "Failed to verify OTP.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-blue-50">
      <Sidebar />
      <div className="flex-1 p-6 md:p-10">
        <div className="max-w-xl mx-auto bg-white p-8 shadow-md rounded-xl">
          <h1 className="text-2xl font-bold mb-6">Add Roommates</h1>

          {!hostelId ? (
            <div className="text-center p-6 bg-yellow-50 rounded-lg">
              <p className="text-yellow-800 mb-4">Please select a hostel first</p>
              <Button
                text="Select Hostel"
                onClick={() => navigate("/hostels")}
              />
            </div>
          ) : (
            <>
              {hostel && (
                <div className="mb-6 p-4 bg-blue-50 rounded-lg">
                  <h2 className="font-semibold text-blue-800">Selected Hostel: {hostel.name}</h2>
                  <p className="text-sm text-blue-600">
                    Room Capacity: {hostel.roomCapacity}
                    {roommateRequests.length >= 0 && ` (${hostel.roomCapacity - roommateRequests.length - 1} spots left)`}
                  </p>
                </div>
              )}

              {/* Display current roommates */}
              {roommateRequests.length > 0 && (
                <div className="mb-6">
                  <h3 className="font-semibold mb-2">Added Roommates:</h3>
                  <div className="space-y-2">
                    {roommateRequests.map((req, index) => (
                      <div key={index} className="p-2 bg-green-50 rounded flex items-center">
                        <span className="text-green-700">{req.rollNo}</span>
                        <span className="ml-2 text-xs bg-green-200 text-green-800 px-2 py-1 rounded">
                          Verified
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {canAddMoreRoommates() ? (
                <>
                  <div className="mb-4">
                    <label className="block mb-1 text-sm font-medium text-gray-700">
                      Friend's Roll Number
                    </label>
                    <input
                      type="text"
                      value={friendRollNo}
                      onChange={(e) => setFriendRollNo(e.target.value)}
                      className="w-full px-4 py-2 border rounded-md"
                      placeholder="Enter friend's roll number"
                      disabled={otpSent}
                    />
                  </div>

                  {!otpSent ? (
                    <Button
                      text="Send OTP"
                      onClick={sendOtp}
                      loading={loading}
                      disabled={!friendRollNo || loading}
                    />
                  ) : (
                    <>
                      <div className="mt-4">
                        <label className="block mb-1 text-sm font-medium text-gray-700">
                          Enter OTP from your friend
                        </label>
                        <input
                          type="text"
                          value={otp}
                          onChange={(e) => setOtp(e.target.value)}
                          className="w-full px-4 py-2 border rounded-md"
                          placeholder="Enter OTP"
                        />
                      </div>
                      <Button
                        text="Verify OTP"
                        onClick={verifyOtp}
                        className="mt-4"
                        loading={loading}
                        disabled={!otp || loading}
                      />
                    </>
                  )}
                </>
              ) : (
                <div className="text-center p-4 bg-yellow-50 rounded-lg">
                  <p className="text-yellow-800">Maximum number of roommates reached.</p>
                  <Button
                    text="Continue to Dashboard"
                    onClick={() => navigate("/hostels")}
                    className="mt-4"
                  />
                </div>
              )}

              {statusMsg && (
                <p className={`mt-4 text-sm ${statusMsg.toLowerCase().includes('error') || statusMsg.toLowerCase().includes('failed')
                  ? 'text-red-600'
                  : 'text-blue-600'
                  }`}>
                  {statusMsg}
                </p>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default RoommateRequest;
