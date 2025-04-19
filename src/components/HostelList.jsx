import React, { useState, useEffect } from 'react';

const HostelList = ({ hostels, onHostelSelect }) => {
    const [selectedHostel, setSelectedHostel] = useState(null);

    useEffect(() => {
        if (selectedHostel) {
            onHostelSelect(selectedHostel);
        }
    }, [selectedHostel, onHostelSelect]);

    const handleHostelSelect = async (hostel) => {
        if (!hostel || !hostel.id) {
            console.error("[HostelList] Hostel is undefined or missing 'id'", hostel);
            return;
        }
        console.log("[HostelList] Registering preferred hostel...", hostel.id);

        setSelectedHostel(hostel);
    };

    return (
        <div>
            <h1>Hostel List</h1>
            <ul>
                {hostels.map((hostel) => (
                    <li key={hostel.id} onClick={() => handleHostelSelect(hostel)}>
                        {hostel.name}
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default HostelList;