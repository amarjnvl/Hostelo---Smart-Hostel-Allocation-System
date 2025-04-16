import React from 'react';

const RequestCard = ({ rollNo, status, onAccept, onReject }) => {
    return (
        <div className="bg-white p-4 rounded-xl shadow border border-gray-200 mb-4">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-base font-semibold text-gray-800">Roll No: {rollNo}</p>
                    <p className="text-sm text-gray-600">Status: <span className="capitalize">{status}</span></p>
                </div>

                {status === 'pending' && (
                    <div className="flex gap-2">
                        <button
                            onClick={onAccept}
                            className="px-3 py-1 rounded-md text-sm font-medium text-white bg-green-600 hover:bg-green-700 transition"
                        >
                            Accept
                        </button>
                        <button
                            onClick={onReject}
                            className="px-3 py-1 rounded-md text-sm font-medium text-white bg-red-600 hover:bg-red-700 transition"
                        >
                            Reject
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default RequestCard;
