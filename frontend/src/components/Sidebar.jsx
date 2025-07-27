import React, { useState } from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { logout } from '../redux/slices/studentSlice';
import {
    MdDashboard,
    MdPerson,
    MdApartment,
    MdMessage,
    MdMenu,
    MdClose,
    MdLogout,
    MdBusiness,
} from 'react-icons/md';

const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: MdDashboard },
    { name: 'Profile', path: '/', icon: MdPerson },
    { name: 'Accommodations', path: '/hostels', icon: MdApartment },
    { name: 'Roommate Requests', path: '/requests', icon: MdMessage },
];

const getNavLinkClass = ({ isActive }) =>
    `flex items-center gap-3 px-4 py-3 rounded-lg text-sm transition-all duration-300 ${isActive
        ? 'bg-white text-blue-600 shadow-sm font-semibold'
        : 'text-gray-600 hover:bg-gray-100'
    }`;

const Sidebar = () => {
    const [isOpen, setIsOpen] = useState(false);
    const dispatch = useDispatch();
    const navigate = useNavigate();

    // functions 
    const toggleSidebar = () => setIsOpen(!isOpen);
    const closeSidebar = () => setIsOpen(false);

    const handleLogout = () => {
        dispatch(logout());
        navigate('/login');
    };

    return (
        <div>
            {/* Mobile Toggle Button */}
            <button className="md:hidden fixed top-5 left-4 z-50 bg-white p-2 rounded-md shadow-md"
                onClick={toggleSidebar}
            >
                {
                    isOpen ?
                        (<MdClose className="w-6 h-6 text-blue-600" />
                        ) : (
                            <MdMenu className="w-6 h-6 text-blue-600" />)
                }
            </button>

            {/* Sidebar Panel */}
            <div
                className={`fixed top-0 left-0 z-40 h-screen w-64 bg-blue-50 border-r shadow-md flex flex-col transform transition-transform duration-300 ease-in-out rounded-tr-2xl rounded-br-2xl
                    ${isOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 md:relative`}
            >
                {/* Logo Section */}
                <div className="p-6 border-b flex justify-center items-center">
                    <Link
                        to="/"
                        onClick={closeSidebar}
                        className="inline-block focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-lg group"
                    >
                        <div className="flex items-center space-x-3">
                            <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-blue-800 rounded-lg flex items-center justify-center">
                                <MdBusiness className="w-8 h-8 text-white" />
                            </div>
                            <div className="text-left">
                                <h1 className="text-xl font-bold text-gray-800">ResidenceHub</h1>
                                <p className="text-xs text-gray-600">Student Housing Portal</p>
                            </div>
                        </div>
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

                {/* Logout Button */}
                <div className="p-4 border-t">
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 w-full px-4 py-3 rounded-lg text-sm text-red-600 hover:bg-red-50 transition-colors duration-300"
                    >
                        <MdLogout className="w-5 h-5" />
                        <span>Logout</span>
                    </button>
                </div>
            </div>

            {/* Overlay on mobile */}
            {isOpen && (
                <div
                    onClick={closeSidebar}
                    className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-30 z-30 md:hidden"
                ></div>
            )}
        </div>
    );
};

export default Sidebar;