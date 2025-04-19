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
        <h1 className="text-2xl font-bold mb-6">Your Room Allocation</h1>
        {loading ? (
          <p>Loading...</p>
        ) : allocation?.allocated ? (
          <div className="bg-white p-6 rounded-xl shadow-md">
            <p><strong>Hostel:</strong> {allocation.hostel}</p>
            <p><strong>Room Number:</strong> {allocation.roomNumber}</p>
            <p className="mt-4 font-semibold">Roommates:</p>
            <ul className="list-disc ml-6">
              {allocation.roommates.length === 0
                ? <li>No roommates (single room)</li>
                : allocation.roommates.map((rm, idx) => (
                  <li key={idx}>{rm.name} ({rm.rollNo})</li>
                ))}
            </ul>
          </div>
        ) : (
          <div className="bg-yellow-50 p-6 rounded-xl shadow-md">
            <p>
              Room allocation is not completed yet. Please wait until the admin finishes the process or the deadline is reached.
            </p>
          </div>
        )}
        {allocation?.error && (
          <p className="text-red-500 mt-4">{allocation.error}</p>
        )}
      </div>
    </div>
  );
};

export default AllottedRoom;