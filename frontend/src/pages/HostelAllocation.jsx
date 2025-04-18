import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import Sidebar from '../components/Sidebar';
import Button from '../components/Button';

const HostelAllocation = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [groupDetails, setGroupDetails] = useState(null);
  const [statusMsg, setStatusMsg] = useState('');
  const [roommatePreference, setRoommatePreference] = useState(0);
  const { student } = useSelector((state) => state.student);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAllocationDetails = async () => {
      try {
        setLoading(true);
        if (!student?.groupId) {
          // If not in a group, check if they have roommate preferences saved
          if (student?.roommatePreference?.desiredCount !== undefined) {
            setRoommatePreference(student.roommatePreference.desiredCount);
          }
          setLoading(false);
          return;
        }

        const response = await api.get(`/students/group/${student.groupId}`);
        if (response.data.success) {
          // Get hostel details for the group
          const groupData = response.data.data;
          const hostelId = groupData[0]?.groupHostelChoice;

          if (hostelId) {
            const hostelResponse = await api.get(`/hostels/${hostelId}`);
            if (hostelResponse.data.success) {
              setGroupDetails({
                members: groupData,
                hostelName: hostelResponse.data.data.name,
                hostelId: hostelId,
                capacity: hostelResponse.data.data.roomCapacity
              });
            }
          }
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch allocation details');
      } finally {
        setLoading(false);
      }
    };

    fetchAllocationDetails();
  }, [student]);

  const handleAddRoommates = () => {
    navigate('/requests');
  };

  const handleRoommatePreferenceChange = async (count) => {
    try {
      setLoading(true);
      const response = await api.post('/students/roommate-preference', {
        desiredCount: count
      });

      if (response.data.success) {
        setRoommatePreference(count);
        setStatusMsg('Roommate preference saved successfully');

        // Redirect to requests page if the user wants roommates
        if (count > 0) {
          navigate('/requests');
        }
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save roommate preference');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
  if (error) return <div className="text-red-500 text-center">Error: {error}</div>;

  return (
    <div className="flex min-h-screen bg-blue-50">
      <Sidebar />
      <div className="flex-1 p-6 md:p-10">
        <div className="max-w-4xl mx-auto bg-white p-8 rounded-xl shadow-md">
          <h1 className="text-2xl font-bold mb-6">Hostel Allocation</h1>

          {groupDetails ? (
            <div className="space-y-6">
              <div className="bg-blue-50 p-4 rounded-lg">
                <h2 className="font-semibold text-lg text-blue-800 mb-4">
                  Registered Group Members
                </h2>
                <p className="text-blue-700 mb-2">
                  Preferred Hostel: {groupDetails.hostelName}
                </p>
                <p className="text-blue-700 mb-4">
                  Room Capacity: {groupDetails.capacity} students per room
                </p>

                <div className="space-y-4">
                  {groupDetails.members.map((member) => (
                    <div
                      key={member.rollNo}
                      className="bg-white p-4 rounded-lg shadow-sm"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium">Name: {member.name}</p>
                          <p className="text-gray-600">Roll No: {member.rollNo}</p>
                        </div>
                        {member.isLeader && (
                          <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                            Leader
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Add more roommates button if not at capacity */}
                {student?.isLeader && groupDetails.members.length < groupDetails.capacity && (
                  <div className="mt-6">
                    <Button
                      text="Add More Roommates"
                      onClick={handleAddRoommates}
                      className="bg-blue-500 hover:bg-blue-600"
                    />
                  </div>
                )}
              </div>
            </div>
          ) : (
            // No group allocation registered yet
            <div className="space-y-6">
              <div className="bg-blue-50 p-6 rounded-lg">
                <h2 className="font-semibold text-lg text-blue-800 mb-4">
                  Roommate Preference
                </h2>
                <p className="mb-4">
                  Do you want to share your room with friends?
                </p>

                <div className="space-y-3">
                  <div
                    onClick={() => handleRoommatePreferenceChange(0)}
                    className={`p-4 border rounded-lg cursor-pointer transition-colors ${roommatePreference === 0
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-200 hover:border-blue-300"
                      }`}
                  >
                    <div className="flex items-center">
                      <div className={`w-5 h-5 rounded-full border mr-3 flex items-center justify-center ${roommatePreference === 0 ? "border-blue-500" : "border-gray-300"
                        }`}>
                        {roommatePreference === 0 && <div className="w-3 h-3 bg-blue-500 rounded-full"></div>}
                      </div>
                      <div>
                        <p className="font-medium">No, I want a room for myself</p>
                      </div>
                    </div>
                  </div>

                  <div
                    onClick={() => handleRoommatePreferenceChange(1)}
                    className={`p-4 border rounded-lg cursor-pointer transition-colors ${roommatePreference === 1
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-200 hover:border-blue-300"
                      }`}
                  >
                    <div className="flex items-center">
                      <div className={`w-5 h-5 rounded-full border mr-3 flex items-center justify-center ${roommatePreference === 1 ? "border-blue-500" : "border-gray-300"
                        }`}>
                        {roommatePreference === 1 && <div className="w-3 h-3 bg-blue-500 rounded-full"></div>}
                      </div>
                      <div>
                        <p className="font-medium">Yes, I want to share with 1 friend</p>
                      </div>
                    </div>
                  </div>

                  <div
                    onClick={() => handleRoommatePreferenceChange(2)}
                    className={`p-4 border rounded-lg cursor-pointer transition-colors ${roommatePreference === 2
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-200 hover:border-blue-300"
                      }`}
                  >
                    <div className="flex items-center">
                      <div className={`w-5 h-5 rounded-full border mr-3 flex items-center justify-center ${roommatePreference === 2 ? "border-blue-500" : "border-gray-300"
                        }`}>
                        {roommatePreference === 2 && <div className="w-3 h-3 bg-blue-500 rounded-full"></div>}
                      </div>
                      <div>
                        <p className="font-medium">Yes, I want to share with 2 friends</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {statusMsg && (
            <p className={`mt-4 text-sm ${statusMsg.toLowerCase().includes('error') ||
                statusMsg.toLowerCase().includes('failed')
                ? 'text-red-600'
                : 'text-green-600'
              }`}>
              {statusMsg}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default HostelAllocation;