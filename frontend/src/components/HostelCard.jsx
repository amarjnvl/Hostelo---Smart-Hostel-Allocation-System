import React from 'react';
import { motion } from 'framer-motion';

const HostelCard = ({ name, totalRooms, roomCapacity, gender, onSelect, buttonText = 'Select Hostel', disabled = false }) => {
    return (
        <motion.div
            className="bg-white p-5 rounded-xl shadow-sm border border-gray-200 transition"
            whileHover={{ y: -2, boxShadow: '0 8px 24px rgba(0,0,0,0.08)' }}
            transition={{ duration: 0.2 }}
        >
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
        </motion.div>
    );
};

export default HostelCard;
