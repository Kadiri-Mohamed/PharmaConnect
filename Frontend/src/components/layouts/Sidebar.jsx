import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { LogOut, User, LayoutDashboard, Settings } from 'lucide-react';
import { NavLink } from 'react-router-dom';

const Sidebar = () => {
    const { logout } = useAuth();

    const handleLogout = async () => {
        await logout();
    };

    return (
        <div className="hidden md:flex flex-col w-64 bg-indigo-900 border-r border-indigo-800 text-white min-h-screen">
            <div className="flex items-center justify-center h-16 border-b border-indigo-800 bg-indigo-950">
                <span className="text-xl font-bold tracking-wider text-indigo-50">PharmaConnect</span>
            </div>

            <div className="flex flex-col flex-1 overflow-y-auto">
                <nav className="flex-1 px-4 py-4 space-y-2">
                    <NavLink
                        to="/"
                        className={({ isActive }) =>
                            `flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${isActive ? 'bg-indigo-800 text-white' : 'text-indigo-200 hover:bg-indigo-800 hover:text-white'
                            }`
                        }
                    >
                        <LayoutDashboard className="h-5 w-5 mr-3" />
                        Dashboard
                    </NavLink>

                    <NavLink
                        to="/profile"
                        className={({ isActive }) =>
                            `flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${isActive ? 'bg-indigo-800 text-white' : 'text-indigo-200 hover:bg-indigo-800 hover:text-white'
                            }`
                        }
                    >
                        <User className="h-5 w-5 mr-3" />
                        Profile
                    </NavLink>
                </nav>
            </div>

            <div className="flex-shrink-0 flex border-t border-indigo-800 p-4 bg-indigo-950">
                <button
                    onClick={handleLogout}
                    className="flex-shrink-0 w-full group block text-indigo-200 hover:text-white transition-colors focus:outline-none"
                >
                    <div className="flex items-center">
                        <div>
                            <LogOut className="inline-block h-6 w-6 rounded-full" />
                        </div>
                        <div className="ml-3">
                            <p className="text-sm font-medium">Logout</p>
                        </div>
                    </div>
                </button>
            </div>
        </div>
    );
};

export default Sidebar;
