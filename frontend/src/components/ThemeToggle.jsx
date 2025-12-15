import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Sun, Moon } from 'lucide-react';

const ThemeToggle = () => {
    const [isDark, setIsDark] = useState(true);

    useEffect(() => {
        // Init theme from system or storage
        const theme = localStorage.getItem('theme') || 'dark';
        setIsDark(theme === 'dark');
        document.documentElement.setAttribute('data-theme', theme);
    }, []);

    const toggleTheme = () => {
        const newTheme = isDark ? 'light' : 'dark';
        setIsDark(!isDark);
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
    };

    return (
        <div
            onClick={toggleTheme}
            className={`w-16 h-8 rounded-full p-1 cursor-pointer flex items-center transition-colors duration-300 ${isDark ? 'bg-slate-700' : 'bg-blue-200'}`}
        >
            <motion.div
                layout
                transition={{ type: "spring", stiffness: 700, damping: 30 }}
                className={`w-6 h-6 rounded-full shadow-md flex items-center justify-center ${isDark ? 'bg-slate-900' : 'bg-white'}`}
                style={{
                    marginLeft: isDark ? '0' : 'auto',
                    marginRight: isDark ? 'auto' : '0'
                }}
            >
                {isDark ? (
                    <Moon size={14} className="text-electric-blue" />
                ) : (
                    <Sun size={14} className="text-orange-400" />
                )}
            </motion.div>
        </div>
    );
};

export default ThemeToggle;
