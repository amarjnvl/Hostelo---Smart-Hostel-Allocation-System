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
    const navigate = useNavigate();

    const { student } = useSelector((state) => state.student);

    useEffect(() => {
        const fetchGroupAndHostelDetails = async () => {
            try {
                setLoading(true);
                if (!student?.groupId) return;

                // Fetch group details
                const groupResponse = await api.get(`/students/group/${student.groupId}`);
                if (groupResponse.data.success) {
                    setRoommateGroup(groupResponse.data.data);

                    // Get the hostel ID from the first group member
                    const hostelId = groupResponse.data.data[0]?.groupHostelChoice;

                    // Only fetch hostel if we have a valid hostel ID
                    if (hostelId && typeof hostelId === 'string') {
                        const hostelResponse = await api.get(`/hostels/${hostelId}`);
                        if (hostelResponse.data.success) {
                            setHostelName(hostelResponse.data.name);
                        }
                    }
                }
            } catch (err) {
                setError(err.response?.data?.message || 'Failed to fetch details');
            } finally {
                setLoading(false);
            }
        };

        fetchGroupAndHostelDetails();
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
                        <div className="bg-white rounded-xl shadow-md p-6">
                            <div className="mb-6">
                                <h2 className="text-xl font-semibold mb-4">Your Hostel Registration</h2>
                                {student?.preferredHostel ? (
                                    <div className="bg-green-50 p-4 rounded-lg">
                                        <p className="text-green-700">You are registered for hostel allocation</p>
                                        <p className="text-sm text-green-600 mt-1">
                                            Preferred Hostel: {student.preferredHostel.name}
                                        </p>
                                    </div>
                                ) : (
                                    <div className="bg-yellow-50 p-4 rounded-lg">
                                        <p className="text-yellow-700">You haven't registered for a hostel yet</p>
                                        <Button
                                            text="Register Now"
                                            onClick={() => navigate('/hostels')}
                                            className="mt-2"
                                        />
                                    </div>
                                )}
                            </div>

                            <div className="bg-white p-6 rounded-xl shadow-md">
                                <h2 className="text-xl font-bold mb-4">Your Hostel Registration</h2>
                                {roommateGroup.length > 0 ? (
                                    <div className="space-y-4">
                                        <p className="text-green-600">Group Registration Status</p>

                                        <div className="space-y-2">
                                            <h3 className="font-medium">Group Members:</h3>
                                            {roommateGroup.map((member) => (
                                                <div key={member.rollNo} className="flex items-center justify-between">
                                                    <div>
                                                        <p>{member.name}</p>
                                                        <p className="text-sm text-gray-600">{member.rollNo}</p>
                                                    </div>
                                                    {member.isLeader ? (
                                                        <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                                                            Leader
                                                        </span>
                                                    ) : student?.isLeader && (
                                                        <button
                                                            onClick={() => handleRemoveFromGroup(member.rollNo)}
                                                            className="text-sm text-red-600 hover:text-red-800"
                                                        >
                                                            Remove from group
                                                        </button>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ) : (
                                    <p className="text-yellow-600">No group registration found</p>
                                )}
                            </div>
                            <button
                                onClick={handleLeaveGroup}
                                className="bg-red-500 text-white px-4 py-2 rounded"
                            >
                                Leave Group
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Dashboard;