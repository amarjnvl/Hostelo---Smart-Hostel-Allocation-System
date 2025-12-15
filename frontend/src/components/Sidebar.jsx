import React, { useState } from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { logout } from '../redux/slices/studentSlice';
import logo from '../assets/Images/logo.png';
import { LayoutDashboard, User, Building2, MessageSquare, Menu, X, LogOut, Moon, Sun } from 'lucide-react';
import ThemeToggle from './ThemeToggle';

const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Profile', path: '/', icon: User },
    { name: 'Hostels', path: '/hostels', icon: Building2 },
    { name: 'Requests', path: '/requests', icon: MessageSquare },
];

const getNavLinkClass = ({ isActive }) =>
    `flex items-center gap-3 px-4 py-3 rounded-xl text-sm transition-all duration-300 ${isActive
        ? 'bg-glass-bg/50 text-electric-blue font-semibold border border-glass-border shadow-lg'
        : 'text-text-muted hover:text-text-main hover:bg-glass-bg/30'
    }`;

const Sidebar = () => {
    const [isOpen, setIsOpen] = useState(false);
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const toggleSidebar = () => setIsOpen(!isOpen);
    const closeSidebar = () => setIsOpen(false);

    const handleLogout = () => {
        dispatch(logout());
        navigate('/login');
    };

    return (
        <div>
            {/* Mobile Toggle Button */}
            <button className="md:hidden fixed top-5 left-4 z-50 glass p-2 rounded-xl"
                onClick={toggleSidebar}
            >
                {isOpen ? <X className="w-6 h-6 text-electric-blue" /> : <Menu className="w-6 h-6 text-electric-blue" />}
            </button>

            {/* Sidebar Panel */}
            <div
                className={`fixed top-0 left-0 z-40 h-screen w-64 bg-glass-bg backdrop-blur-xl border-r border-glass-border flex flex-col transform transition-transform duration-300 ease-in-out
                    ${isOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 md:relative`}
            >
                {/* Logo Section */}
                <div className="p-6 border-b border-glass-border flex justify-center items-center">
                    <Link
                        to="/dashboard"
                        onClick={closeSidebar}
                        className="inline-block focus:outline-none rounded-full group"
                    >
                        <img
                            src={logo}
                            alt="Hostelo"
                            className="w-24 object-contain transition-transform duration-300 rounded-full group-hover:scale-105"
                        />
                    </Link>
                </div>

                {/*  Nav Items */}
                <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
                    {navItems.map((item) => (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            className={getNavLinkClass}
                            onClick={closeSidebar}
                        >
                            <item.icon className="w-5 h-5" />
                            <span>{item.name}</span>
                        </NavLink>
                    ))}
                </nav>

                {/* Bottom Section */}
                <div className="p-4 border-t border-glass-border space-y-4">
                    {/* Theme Toggle */}
                    <div className="flex justify-between items-center px-4">
                        <span className="text-sm font-medium text-text-muted">Theme</span>
                        <ThemeToggle />
                    </div>

                    {/* Logout Button */}
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm text-red-400 hover:bg-red-500/10 hover:border hover:border-red-500/20 transition-all font-medium"
                    >
                        <LogOut className="w-5 h-5" />
                        <span>Logout</span>
                    </button>
                </div>
            </div>

            {/* Overlay on mobile */}
            {isOpen && (
                <div
                    onClick={closeSidebar}
                    className="fixed top-0 left-0 w-full h-full bg-black/50 backdrop-blur-sm z-30 md:hidden"
                ></div>
            )}
        </div>
    );
};

export default Sidebar;
