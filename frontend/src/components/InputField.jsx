import React from 'react';

const InputField = ({ label, value, onChange, disabled = true }) => {
    return (
        <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
            <input
                type="text"
                value={value}
                disabled={disabled}
                onChange={onChange}
                className={`w-full px-4 py-2 rounded-md border text-sm ${disabled
                    ? 'bg-gray-100 cursor-not-allowed'
                    : 'bg-white border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500'
                    }`}
            />
        </div>
    );
};

export default InputField;