import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import Sidebar from '../components/Sidebar';
import Button from '../components/Button';

const Request = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [statusMsg, setStatusMsg] = useState('');
    const [roommateGroup, setRoommateGroup] = useState([]);
    const [hostelName, setHostelName] = useState('');
    const { student } = useSelector((state) => state.student);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchGroupAndHostelDetails = async () => {
            try {
                setLoading(true);
                if (!student?.groupId) return;

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
            } catch (err) {
                setError(err.response?.data?.message || 'Failed to fetch details');
            } finally {
                setLoading(false);
            }
        };

        fetchGroupAndHostelDetails();
    }, [student?.groupId]);

    const handleRemoveFromGroup = async (rollNo) => {
        try {
            setLoading(true);
            const response = await api.post('/students/remove-from-group', { rollNo });
            if (response.data.success) {
                fetchGroupAndHostelDetails(); // Just refresh the current page
                setStatusMsg('Member removed successfully');
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to remove member');
        } finally {
            setLoading(false);
        }
    };

    const handleLeaveGroup = async () => {
        try {
            setLoading(true);
            const response = await api.post('/students/leave-group');
            if (response.data.success) {
                // Instead of navigating, just clear the group data
                setRoommateGroup([]);
                setHostelName('');
                setStatusMsg('Successfully left the group');
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
                <div className="max-w-4xl mx-auto space-y-6">
                    {/* Hostel Registration Status */}
                    <div className="bg-white p-6 rounded-xl shadow-md">
                        <h2 className="text-xl font-bold mb-4">Your Hostel Registration</h2>
                        {student?.hostelChoice ? (
                            <>
                                <p className="text-green-600 mb-2">You are registered for hostel allocation</p>
                                <p>Preferred Hostel: {hostelName || 'Not selected'}</p>
                            </>
                        ) : (
                            <p className="text-yellow-600">You haven't registered for hostel allocation yet</p>
                        )}
                    </div>

                    {/* Current Roommate Group */}
                    <div className="bg-white p-6 rounded-xl shadow-md">
                        <h2 className="text-xl font-bold mb-4">Your Roommate Group</h2>
                        {roommateGroup.length > 0 ? (
                            <div className="space-y-4">
                                {roommateGroup.map((member) => (
                                    <div key={member.rollNo} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                                        <div>
                                            <p className="font-medium">{member.name}</p>
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
                                {!student?.isLeader && (
                                    <Button
                                        text="Leave Group"
                                        onClick={handleLeaveGroup}
                                        className="mt-4 bg-red-500 hover:bg-red-600"
                                    />
                                )}
                            </div>
                        ) : (
                            <div className="text-center p-4">
                                <p className="text-yellow-600 mb-4">You haven't formed a roommate group yet</p>
                                <Button
                                    text="Find Roommates"
                                    onClick={() => navigate('/requests')}
                                    className="bg-blue-500 hover:bg-blue-600"
                                />
                            </div>
                        )}
                    </div>

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

export default Request;