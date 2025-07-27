import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MdPerson } from 'react-icons/md';
import Sidebar from '../components/Sidebar';
import Button from '../components/Button';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProfile } from '../redux/slices/studentSlice';

const Profile = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Fetch the student data from Redux store
  const { student, loading, error, pendingGroupRequest } = useSelector((state) => state.student);

  // Fetch profile if student data is not available yet
  useEffect(() => {
    if (student === null) {
      console.log('[Profile] No student data found, fetching profile');
      const rollNo = localStorage.getItem('rollNo');
      console.log('[Profile] rollNo found:', rollNo);
      if (rollNo) {
        dispatch(fetchProfile(rollNo));
      }
    }
  }, [dispatch, student]);

  // If profile is still loading, show a loading state
  if (loading) {
    return <div>Loading...</div>;
  }

  // If there is an error, show an error message
  if (error) {
    return <div className="text-red-500">Error: {error}</div>;
  }

  // If no student data, handle accordingly (e.g., redirect or show message)
  if (!student) {
    return <div>No profile data found</div>;
  }

  return (
    <div className="flex min-h-screen bg-blue-50">
      <Sidebar />

      <div className="flex-1 p-6 md:p-10">
        <div className="max-w-3xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Student Profile</h1>
            <p className="text-gray-600">Manage your personal information and housing preferences</p>
          </div>

          <div className="bg-white border border-gray-200 shadow-lg rounded-xl overflow-hidden">
            {/* Header Section */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-8 py-6">
              <div className="flex items-center">
                <div className="w-20 h-20 bg-white bg-opacity-20 rounded-full flex items-center justify-center mr-6">
                  <MdPerson size={40} className="text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">{student.name}</h2>
                  <p className="text-blue-100">Student ID: {student.rollNo}</p>
                </div>
              </div>
            </div>

            {/* Content Section */}
            <div className="p-8">
              <div className="grid md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                    <div className="bg-gray-50 border border-gray-200 rounded-lg px-4 py-3">
                      <p className="text-gray-800">{student.email}</p>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Student ID</label>
                    <div className="bg-gray-50 border border-gray-200 rounded-lg px-4 py-3">
                      <p className="text-gray-800">{student.rollNo}</p>
                    </div>
                  </div>
                </div>
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Gender</label>
                    <div className="bg-gray-50 border border-gray-200 rounded-lg px-4 py-3">
                      <p className="text-gray-800 capitalize">{student.gender}</p>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Registration Status</label>
                    <div className="bg-gray-50 border border-gray-200 rounded-lg px-4 py-3">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                        student.isRegistered 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {student.isRegistered ? 'Registered' : 'Pending Registration'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-8 pt-6 border-t border-gray-200">
                <div className="flex flex-col sm:flex-row gap-4">
                  <Button
                    text="Manage Housing Preferences"
                    onClick={() => {
                      console.log('[Profile] Navigating to Housing Management');
                      navigate('/hostels');
                    }}
                    className="flex-1 bg-blue-600 hover:bg-blue-700"
                  />
                  {pendingGroupRequest && (
                    <Button
                      text="View Pending Requests"
                      onClick={() => {
                        console.log('[Profile] Navigating to Roommate Requests');
                        navigate('/requests');
                      }}
                      className="flex-1 bg-orange-600 hover:bg-orange-700"
                    />
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;

