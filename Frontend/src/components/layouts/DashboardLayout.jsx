import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Navbar from './Navbar';

const DashboardLayout = () => {
    return (
        <div className="flex h-screen overflow-hidden bg-gray-50">
            <Sidebar />
            <div className="flex flex-col w-0 flex-1 overflow-hidden">
                <Navbar />
                <main className="flex-1 relative z-0 overflow-y-auto focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500">
                    <div className="max-w-7xl mx-auto py-10 px-4 sm:px-6 md:px-8">
                        <Outlet />
                    </div>
                </main>
            </div>
        </div>
    );
};

export default DashboardLayout;
