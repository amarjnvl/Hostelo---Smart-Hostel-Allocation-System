import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import api from '../utils/api';
import Sidebar from '../components/Sidebar';

const HostelAllocation = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [groupDetails, setGroupDetails] = useState(null);
  const { student } = useSelector((state) => state.student);

  useEffect(() => {
    const fetchAllocationDetails = async () => {
      try {
        setLoading(true);
        if (!student?.groupId) return;

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
                hostelName: hostelResponse.data.data.name
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
  }, [student?.groupId]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

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
              </div>
            </div>
          ) : (
            <p className="text-yellow-600">
              No hostel allocation registration found
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default HostelAllocation;