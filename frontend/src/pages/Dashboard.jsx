import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import Sidebar from '../components/Sidebar';
import api from '../utils/api';
import Button from '../components/Button';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [roommateGroup, setRoommateGroup] = useState([]);
    const [hostelName, setHostelName] = useState('');
    const [allocation, setAllocation] = useState(null);
    const navigate = useNavigate();

    const { student } = useSelector((state) => state.student);

    useEffect(() => {
        const fetchAllDetails = async () => {
            try {
                setLoading(true);

                // Fetch allocation details first
                const allocationResponse = await api.get('/students/allocation');
                setAllocation(allocationResponse.data);

                // If not allocated and has groupId, fetch group details
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

        fetchAllDetails();
    }, [student?.groupId]);

    const handleLeaveGroup = async () => {
        try {
            setLoading(true);
            const response = await api.post('/students/leave-group');
            if (response.data.success) {
                navigate('/hostels');
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to leave group');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen bg-blue-50">
            <Sidebar />
            <div className="flex-1 p-6 md:p-10">
                <div className="max-w-3xl mx-auto">
                    <h1 className="text-3xl font-bold text-gray-800 mb-8">Dashboard</h1>

                    {loading ? (
                        <div className="text-center py-4">Loading...</div>
                    ) : error ? (
                        <div className="text-red-600 bg-red-50 p-4 rounded-lg">{error}</div>
                    ) : (
                        <div className="space-y-6">
                            {/* Room Allocation Status */}
                            <div className="bg-white rounded-xl shadow-md p-6">
                                <h2 className="text-xl font-semibold mb-4">Room Allocation Status</h2>
                                {allocation?.allocated ? (
                                    <div className="bg-green-50 p-6 rounded-lg">
                                        <div className="flex items-center justify-between mb-4">
                                            <h3 className="text-lg font-semibold text-green-800">
                                                Room Allocated Successfully
                                            </h3>
                                            <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">
                                                Allocated
                                            </span>
                                        </div>
                                        <div className="space-y-3">
                                            <p className="text-gray-700">
                                                <span className="font-medium">Hostel:</span> {allocation.hostel}
                                            </p>
                                            <p className="text-gray-700">
                                                <span className="font-medium">Room Number:</span> {allocation.roomNumber}
                                            </p>
                                            <div className="mt-4">
                                                <h4 className="font-medium mb-2">Roommates:</h4>
                                                <div className="bg-white p-4 rounded-lg shadow-sm">
                                                    {allocation.roommates.length > 0 ? (
                                                        <ul className="space-y-2">
                                                            {allocation.roommates.map((roommate, index) => (
                                                                <li key={index} className="flex items-center">
                                                                    <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                                                                    {roommate.name} ({roommate.rollNo})
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    ) : (
                                                        <p className="text-gray-500">No roommates (Single room)</p>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="bg-yellow-50 p-6 rounded-lg">
                                        <p className="text-yellow-800">
                                            Room allocation is pending. Please wait for the administration to complete the allocation process.
                                        </p>
                                        {!student?.preferredHostel && (
                                            <Button
                                                text="Register for Hostel"
                                                onClick={() => navigate('/hostels')}
                                                className="mt-4"
                                            />
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* Group Details (Show only if not allocated and has group) */}
                            {!allocation?.allocated && roommateGroup.length > 0 && (
                                <div className="bg-white rounded-xl shadow-md p-6">
                                    <h2 className="text-xl font-semibold mb-4">Your Roommate Group</h2>
                                    <div className="space-y-4">
                                        {hostelName && (
                                            <p className="text-blue-600">
                                                Preferred Hostel: {hostelName}
                                            </p>
                                        )}
                                        <div className="space-y-2">
                                            {roommateGroup.map((member) => (
                                                <div key={member.rollNo}
                                                    className="flex items-center justify-between p-3 bg-gray-50 rounded">
                                                    <div>
                                                        <p className="font-medium">{member.name}</p>
                                                        <p className="text-sm text-gray-600">{member.rollNo}</p>
                                                    </div>
                                                    {member.isLeader && (
                                                        <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                                                            Leader
                                                        </span>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                        {!student?.isLeader && (
                                            <Button
                                                text="Leave Group"
                                                onClick={handleLeaveGroup}
                                                className="mt-4 bg-red-500 hover:bg-red-600"
                                            />
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Dashboard;