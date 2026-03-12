import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { Bell, Search, User } from 'lucide-react';
import { Link } from 'react-router-dom';

const Navbar = () => {
    const { user } = useAuth();

    return (
        <nav className="bg-white border-b border-gray-200 sticky top-0 z-30">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                    <div className="flex">
                        <div className="flex-shrink-0 flex items-center md:hidden">
                            <span className="text-xl font-bold text-indigo-600">PharmaConnect</span>
                        </div>
                    </div>
                    <div className="flex items-center space-x-4">
                        <button className="text-gray-400 hover:text-gray-500 p-2 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500">
                            <span className="sr-only">Search</span>
                            <Search className="h-6 w-6" />
                        </button>
                        <button className="text-gray-400 hover:text-gray-500 p-2 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500">
                            <span className="sr-only">View notifications</span>
                            <Bell className="h-6 w-6" />
                        </button>

                        <div className="relative flex items-center">
                            <Link to="/profile" className="flex items-center text-sm font-medium text-gray-700 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded-full pl-2 pr-3 py-1">
                                <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold mr-2">
                                    {user?.name?.charAt(0).toUpperCase() || <User className="h-5 w-5" />}
                                </div>
                                <span>{user?.name}</span>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
