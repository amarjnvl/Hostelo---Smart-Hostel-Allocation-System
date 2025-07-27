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
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-gray-800 mb-2">Student Dashboard</h1>
                        <p className="text-gray-600">Manage your accommodation preferences and view allocation status</p>
                    </div>

                    {loading ? (
                        <div className="flex items-center justify-center py-12">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                            <span className="ml-3 text-gray-600">Loading your information...</span>
                        </div>
                    ) : error ? (
                        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                            <div className="flex">
                                <div className="flex-shrink-0">
                                    <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                    </svg>
                                </div>
                                <div className="ml-3">
                                    <h3 className="text-sm font-medium">Error Loading Data</h3>
                                    <p className="mt-1 text-sm">{error}</p>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {/* Accommodation Status Card */}
                            <div className="bg-white rounded-xl shadow-md p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <h2 className="text-xl font-semibold text-gray-800">Accommodation Status</h2>
                                    <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                                        allocation?.allocated 
                                            ? 'bg-green-100 text-green-800' 
                                            : 'bg-yellow-100 text-yellow-800'
                                    }`}>
                                        {allocation?.allocated ? 'Allocated' : 'Pending'}
                                    </div>
                                </div>
                                {allocation?.allocated ? (
                                    <div className="bg-green-50 border border-green-200 p-6 rounded-lg">
                                        <div className="flex items-start">
                                            <div className="flex-shrink-0">
                                                <svg className="h-6 w-6 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                </svg>
                                            </div>
                                            <div className="ml-3 flex-1">
                                                <h3 className="text-lg font-semibold text-green-800 mb-3">
                                                    Accommodation Successfully Allocated
                                                </h3>
                                                <div className="grid md:grid-cols-2 gap-4">
                                                    <div className="bg-white p-4 rounded-lg shadow-sm">
                                                        <p className="text-sm text-gray-600 mb-1">Residence Hall</p>
                                                        <p className="font-semibold text-gray-800">{allocation.hostel}</p>
                                                    </div>
                                                    <div className="bg-white p-4 rounded-lg shadow-sm">
                                                        <p className="text-sm text-gray-600 mb-1">Room Number</p>
                                                        <p className="font-semibold text-gray-800">{allocation.roomNumber}</p>
                                                    </div>
                                                </div>
                                                <div className="mt-4">
                                                    <h4 className="font-medium text-gray-800 mb-3">Roommate Information</h4>
                                                    <div className="bg-white p-4 rounded-lg shadow-sm">
                                                        {allocation.roommates.length > 0 ? (
                                                            <div className="space-y-3">
                                                                {allocation.roommates.map((roommate, index) => (
                                                                    <div key={index} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
                                                                        <div className="flex items-center">
                                                                            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                                                                                <span className="text-blue-600 font-medium text-sm">
                                                                                    {roommate.name.charAt(0)}
                                                                                </span>
                                                                            </div>
                                                                            <div>
                                                                                <p className="font-medium text-gray-800">{roommate.name}</p>
                                                                                <p className="text-sm text-gray-600">{roommate.rollNo}</p>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        ) : (
                                                            <div className="text-center py-4">
                                                                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                                                </svg>
                                                                <p className="mt-2 text-gray-500">Single occupancy room</p>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="bg-yellow-50 border border-yellow-200 p-6 rounded-lg">
                                        <div className="flex items-start">
                                            <div className="flex-shrink-0">
                                                <svg className="h-6 w-6 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                                                </svg>
                                            </div>
                                            <div className="ml-3">
                                                <h3 className="text-lg font-semibold text-yellow-800 mb-2">
                                                    Allocation In Progress
                                                </h3>
                                                <p className="text-yellow-700 mb-4">
                                                    Your accommodation request is being processed. The housing administration will complete allocations shortly.
                                                </p>
                                                {!student?.preferredHostel && (
                                                    <Button
                                                        text="Complete Registration"
                                                        onClick={() => navigate('/hostels')}
                                                        className="bg-yellow-600 hover:bg-yellow-700"
                                                    />
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Roommate Group Details */}
                            {!allocation?.allocated && roommateGroup.length > 0 && (
                                <div className="bg-white rounded-xl shadow-md p-6">
                                    <h2 className="text-xl font-semibold text-gray-800 mb-4">Roommate Preferences</h2>
                                    <div className="space-y-4">
                                        {hostelName && (
                                            <div className="bg-blue-50 p-4 rounded-lg">
                                                <p className="text-sm text-blue-600 mb-1">Preferred Residence Hall</p>
                                                <p className="font-semibold text-blue-800">{hostelName}</p>
                                            </div>
                                        )}
                                        <div className="space-y-3">
                                            <h4 className="font-medium text-gray-800">Group Members</h4>
                                            {roommateGroup.map((member) => (
                                                <div key={member.rollNo}
                                                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border">
                                                    <div className="flex items-center">
                                                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                                                            <span className="text-blue-600 font-medium">
                                                                {member.name.charAt(0)}
                                                            </span>
                                                        </div>
                                                        <div>
                                                            <p className="font-medium text-gray-800">{member.name}</p>
                                                            <p className="text-sm text-gray-600">{member.rollNo}</p>
                                                        </div>
                                                    </div>
                                                    {member.isLeader && (
                                                        <span className="text-xs bg-blue-100 text-blue-800 px-3 py-1 rounded-full font-medium">
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
                                                className="mt-4 bg-red-600 hover:bg-red-700"
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