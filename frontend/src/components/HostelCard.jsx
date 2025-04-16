import React from 'react';

const HostelCard = ({ name, totalRooms, roomCapacity, gender, onSelect, buttonText = 'Select Hostel', disabled = false }) => {
    return (
        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition">
            <h3 className="text-lg font-semibold text-blue-700">{name}</h3>
            <div className="mt-2 space-y-1 text-sm text-gray-700">
                <p>Type: {gender === 'male' ? 'Boys' : 'Girls'}</p>
                <p>Total Rooms: {totalRooms}</p>
                <p>Room Capacity: {roomCapacity}</p>
            </div>
            <button
                onClick={onSelect}
                disabled={disabled}
                className="mt-4 w-full py-2 rounded-md text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
                {buttonText}
            </button>
        </div>
    );
};

export default HostelCard;
