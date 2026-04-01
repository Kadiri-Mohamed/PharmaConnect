import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { Users, Activity, CheckCircle, TrendingUp } from 'lucide-react';

const DashboardPage = () => {
    const { user } = useAuth();

    const stats = [
        { name: 'Total Patients', stat: '1,429', icon: Users, change: '12%', changeType: 'increase' },
        { name: 'Active Prescriptions', stat: '852', icon: Activity, change: '5.2%', changeType: 'increase' },
        { name: 'Completed Orders', stat: '2,890', icon: CheckCircle, change: '2.4%', changeType: 'increase' },
        { name: 'Revenue', stat: '$14,500', icon: TrendingUp, change: '10%', changeType: 'increase' },
    ];

    return (
        <div className="space-y-6">
            <div className="pb-5 border-b border-gray-200">
                <h3 className="text-2xl leading-6 font-semibold text-gray-900">
                    Welcome back, {user?.name}!
                </h3>
                <p className="mt-2 text-sm text-gray-500">
                    Here's an overview of your dashboard today.
                </p>
            </div>

            <div className="mt-4 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                {stats.map((item) => (
                    <div key={item.name} className="bg-white overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow">
                        <div className="p-5">
                            <div className="flex items-center">
                                <div className="flex-shrink-0">
                                    <item.icon className="h-6 w-6 text-indigo-500" aria-hidden="true" />
                                </div>
                                <div className="ml-5 w-0 flex-1">
                                    <dl>
                                        <dt className="text-sm font-medium text-gray-500 truncate">{item.name}</dt>
                                        <dd>
                                            <div className="text-lg font-medium text-gray-900">{item.stat}</div>
                                        </dd>
                                    </dl>
                                </div>
                            </div>
                        </div>
                        <div className="bg-gray-50 px-5 py-3">
                            <div className="text-sm">
                                <span className={`font-medium ${item.changeType === 'increase' ? 'text-green-600' : 'text-red-600'}`}>
                                    {item.change}
                                </span>
                                <span className="text-gray-500"> from last month</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Add more dashboard content here */}
            <div className="bg-white shadow rounded-lg p-6">
                <h4 className="text-lg font-medium text-gray-900 mb-4">Recent Activity</h4>
                <div className="border-t border-gray-200 pt-4 text-sm text-gray-500">
                    No recent activity to display. Start by adding records.
                </div>
            </div>

            {user?.role === 'pharmacist' && (
                <div className="bg-white shadow rounded-lg p-6">
                    <h4 className="text-lg font-medium text-gray-900 mb-4">Pharmacy Owner</h4>
                    <p className="text-sm text-gray-600">Manage your pharmacy profile.</p>
                    <a
                        href="/dashboard/pharmacy-profile"
                        className="inline-block mt-3 text-indigo-600 hover:text-indigo-900"
                    >
                        Edit Pharmacy Profile
                    </a>
                </div>
            )}
        </div>
    );
};

export default DashboardPage;
