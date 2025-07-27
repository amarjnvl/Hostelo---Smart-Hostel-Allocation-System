import React, { useEffect, useState } from 'react';
import Sidebar from '../components/Sidebar';
import api from '../utils/api';

const AllottedRoom = () => {
  const [loading, setLoading] = useState(true);
  const [allocation, setAllocation] = useState(null);

  useEffect(() => {
    const fetchAllocation = async () => {
      try {
        const res = await api.get('/students/allocation');
        setAllocation(res.data);
      } catch (err) {
        setAllocation({ error: "Failed to fetch allocation details" });
      } finally {
        setLoading(false);
      }
    };
    fetchAllocation();
  }, []);

  return (
    <div className="flex min-h-screen bg-blue-50">
      <Sidebar />
      <div className="flex-1 p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Accommodation Details</h1>
          <p className="text-gray-600">View your assigned housing and roommate information</p>
        </div>
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-3 text-gray-600">Loading accommodation details...</span>
          </div>
        ) : allocation?.allocated ? (
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            {/* Header */}
            <div className="bg-green-50 border-b border-green-200 px-6 py-4">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg className="h-8 w-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h2 className="text-xl font-semibold text-green-800">Housing Successfully Allocated</h2>
                  <p className="text-green-600">Your accommodation assignment is confirmed</p>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="p-6">
              <div className="grid md:grid-cols-2 gap-6 mb-8">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h3 className="text-sm font-medium text-blue-600 mb-1">Residence Hall</h3>
                  <p className="text-xl font-semibold text-blue-800">{allocation.hostel}</p>
                </div>
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h3 className="text-sm font-medium text-blue-600 mb-1">Room Number</h3>
                  <p className="text-xl font-semibold text-blue-800">{allocation.roomNumber}</p>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Roommate Information</h3>
                <div className="bg-gray-50 rounded-lg p-6">
                  {allocation.roommates.length === 0 ? (
                    <div className="text-center py-8">
                      <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      <h4 className="mt-2 text-lg font-medium text-gray-900">Single Occupancy</h4>
                      <p className="mt-1 text-gray-500">You have been assigned a private room</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {allocation.roommates.map((rm, idx) => (
                        <div key={idx} className="flex items-center p-4 bg-white rounded-lg shadow-sm">
                          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                            <span className="text-blue-600 font-semibold text-lg">
                              {rm.name.charAt(0)}
                            </span>
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-800">{rm.name}</h4>
                            <p className="text-gray-600">Student ID: {rm.rollNo}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <svg className="h-6 w-6 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-lg font-semibold text-yellow-800 mb-2">Allocation In Progress</h3>
                <p className="text-yellow-700">
                  Your housing allocation is currently being processed. The housing administration will complete all assignments shortly. 
                  You will be notified once your accommodation has been confirmed.
                </p>
              </div>
            </div>
          </div>
        )}
        {allocation?.error && (
          <div className="mt-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium">Error Loading Allocation</h3>
                <p className="mt-1 text-sm">{allocation.error}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AllottedRoom;