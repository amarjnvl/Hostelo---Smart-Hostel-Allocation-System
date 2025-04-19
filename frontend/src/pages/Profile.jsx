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
          <h1 className="text-3xl font-bold text-gray-800 mb-8">Student Profile</h1>

          <div className="bg-white border border-gray-100 shadow-lg rounded-2xl p-8">
            <div className="flex flex-col items-center mb-6">
              <MdPerson size={100} className="text-gray-400 mb-2" />
              {/* Dynamically display the student's name */}
              <h2 className="text-xl font-semibold text-gray-800">{student.name}</h2>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <p className="text-sm text-gray-500">Email</p>
                {/* Dynamically display the student's email */}
                <p className="text-base font-medium text-gray-800">{student.email}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Roll Number</p>
                {/* Dynamically display the student's roll number */}
                <p className="text-base font-medium text-gray-800">{student.rollNo}</p>
              </div>
            </div>

            <div className="mt-8 flex justify-center">
              <Button
                text="Go to Hostel Allotment"
                onClick={() => {
                  console.log('[Profile] Navigating to Hostel Allotment');
                  navigate('/hostels');
                }}
                className="w-full sm:w-auto"
              />
            </div>

            {pendingGroupRequest && (
              <div className="mt-8 text-center">
                <p className="text-sm text-gray-500">You have a pending group request</p>
                <Button
                  text="View Request"
                  onClick={() => {
                    console.log('[Profile] Navigating to Roommate Requests');
                    navigate('/roommate-requests');
                  }}
                  className="w-full sm:w-auto"
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;

