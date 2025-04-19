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
                    {hostelId && (
                        <div className="bg-white p-6 rounded-xl shadow-md">
                            <h2 className="text-xl font-bold mb-4">Add Roommate</h2>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
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
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Enter OTP
                                            </label>
                                            <input
                                                type="text"
                                                value={otp}
                                                onChange={(e) => setOtp(e.target.value)}
                                                className="w-full px-4 py-2 border rounded-md"
                                                placeholder="Enter the OTP"
                                            />
                                        </div>
                                        <Button
                                            text="Verify OTP"
                                            onClick={verifyOtp}
                                            loading={loading}
                                            disabled={!otp || loading}
                                        />
                                    </>
                                )}
                            </div>
                        </div>
                    )}



                    {(error || statusMsg) && (
                        <p className={`mt-4 text-sm ${error ? 'text-red-600' : 'text-green-600'}`}>
                            {error || statusMsg}
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Request;