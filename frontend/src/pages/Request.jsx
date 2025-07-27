import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../utils/api';
import Sidebar from '../components/Sidebar';
import Button from '../components/Button';

const Request = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [statusMsg, setStatusMsg] = useState('');
    const [roommateGroup, setRoommateGroup] = useState([]);
    const [hostelName, setHostelName] = useState('');
    const [friendRollNo, setFriendRollNo] = useState('');
    const [otpSent, setOtpSent] = useState(false);
    const [otp, setOtp] = useState('');
    const { student } = useSelector((state) => state.student);
    const navigate = useNavigate();
    const location = useLocation();
    const hostelId = new URLSearchParams(location.search).get('hostelId');


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

    const sendOtp = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await api.post('/roommates/send-otp', {
                toRoll: friendRollNo,
                hostelId
            });
            setOtpSent(true);
            setStatusMsg('OTP sent successfully! Ask your friend for the code.');
        } catch (err) {
            console.log(err.response?.data?.message || 'Failed to send OTP');
        } finally {
            setLoading(false);
        }
    };

    const verifyOtp = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await api.post('/roommates/verify-otp', {
                toRoll: friendRollNo,
                otp,
                hostelId
            });
            // setStatusMsg('Roommate verified successfully!');
            setFriendRollNo('');
            setOtp('');
            setOtpSent(false);
            fetchGroupAndHostelDetails();
        } catch (err) {
            console.log(err.response?.data?.message || 'Failed to send OTP');
        } finally {
            setLoading(false);
        }
    };

    const handleRemoveFromGroup = async (rollNo) => {
        try {
            setLoading(true);
            const response = await api.post('/students/remove-from-group', { rollNo });
            if (response.data.success) {
                fetchGroupAndHostelDetails();
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
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-gray-800 mb-2">Roommate Management</h1>
                        <p className="text-gray-600">Add roommates to your housing group and manage preferences</p>
                    </div>

                    {hostelId && (
                        <div className="bg-white p-6 rounded-xl shadow-md">
                            <h2 className="text-xl font-bold text-gray-800 mb-4">Add New Roommate</h2>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Roommate's Student ID
                                    </label>
                                    <input
                                        type="text"
                                        value={friendRollNo}
                                        onChange={(e) => setFriendRollNo(e.target.value)}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        placeholder="Enter your roommate's student ID"
                                        disabled={otpSent}
                                    />
                                    <p className="mt-1 text-sm text-gray-500">
                                        Your roommate will receive a verification code via email
                                    </p>
                                </div>

                                {!otpSent ? (
                                    <Button
                                        text="Send Verification Code"
                                        onClick={sendOtp}
                                        loading={loading}
                                        disabled={!friendRollNo || loading}
                                        className="bg-blue-600 hover:bg-blue-700"
                                    />
                                ) : (
                                    <>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Verification Code
                                            </label>
                                            <input
                                                type="text"
                                                value={otp}
                                                onChange={(e) => setOtp(e.target.value)}
                                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                placeholder="Enter the 6-digit verification code"
                                            />
                                            <p className="mt-1 text-sm text-gray-500">
                                                Ask your roommate for the code they received via email
                                            </p>
                                        </div>
                                        <Button
                                            text="Verify & Add Roommate"
                                            onClick={verifyOtp}
                                            loading={loading}
                                            disabled={!otp || loading}
                                            className="bg-green-600 hover:bg-green-700"
                                        />
                                    </>
                                )}
                            </div>
                        </div>
                    )}



                    {(error || statusMsg) && (
                        <div className={`p-4 rounded-lg ${
                            error 
                                ? 'bg-red-50 border border-red-200 text-red-700' 
                                : 'bg-green-50 border border-green-200 text-green-700'
                        }`}>
                            <div className="flex">
                                <div className="flex-shrink-0">
                                    {error ? (
                                        <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                        </svg>
                                    ) : (
                                        <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                        </svg>
                                    )}
                                </div>
                                <div className="ml-3">
                                    <p className="text-sm font-medium">{error || statusMsg}</p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Request;