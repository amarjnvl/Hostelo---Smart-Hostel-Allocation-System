import React from 'react';
import { motion } from 'framer-motion';

const Button = ({
    text = 'Click',
    type = 'button',
    onClick,
    disabled = false,
    loading = false,
    icon = null,
    className = '',
}) => {
    return (
        <motion.button
            type={type}
            onClick={onClick}
            disabled={disabled || loading}
            whileHover={!disabled && !loading ? { scale: 1.02 } : undefined}
            whileTap={!disabled && !loading ? { scale: 0.98 } : undefined}
            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
            className={`flex items-center justify-center gap-2 px-4 py-2 rounded-md text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed ${className}`}
        >
            {loading ? (
                <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                </svg>
            ) : icon}
            {text}
        </motion.button>
    );
};

export default Button;
