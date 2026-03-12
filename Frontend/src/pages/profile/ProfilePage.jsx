import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import UpdateProfileForm from '../../components/profile/UpdateProfileForm';
import UpdatePasswordForm from '../../components/profile/UpdatePasswordForm';
import { Trash2, AlertTriangle } from 'lucide-react';

const ProfilePage = () => {
    const { logout } = useAuth();
    const [deleteLoading, setDeleteLoading] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

    const handleDeleteAccount = async () => {
        setDeleteLoading(true);
        try {
            await api.delete('/deleteProfile');
            await logout();
        } catch (err) {
            console.error('Failed to delete account', err);
        } finally {
            setDeleteLoading(false);
            setShowConfirm(false);
        }
    };

    return (
        <div className="space-y-6 max-w-4xl mx-auto">
            <div className="pb-5 border-b border-gray-200">
                <h3 className="text-2xl leading-6 font-semibold text-gray-900">
                    Profile Settings
                </h3>
                <p className="mt-2 text-sm text-gray-500">
                    Manage your account details and password.
                </p>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <UpdateProfileForm />
                <UpdatePasswordForm />
            </div>

            <div className="bg-white shadow rounded-lg p-6 border border-red-100">
                <h3 className="text-lg font-medium leading-6 text-red-600 mb-4 flex items-center">
                    <AlertTriangle className="h-5 w-5 mr-2" />
                    Danger Zone
                </h3>
                <p className="text-sm text-gray-500 mb-4">
                    Once you delete your account, there is no going back. Please be certain.
                </p>

                {!showConfirm ? (
                    <button
                        onClick={() => setShowConfirm(true)}
                        className="inline-flex items-center justify-center py-2 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                    >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete Account
                    </button>
                ) : (
                    <div className="bg-red-50 p-4 rounded-md space-y-4">
                        <p className="text-sm text-red-700 font-medium">Are you absolutely sure you want to delete your account?</p>
                        <div className="flex space-x-3">
                            <button
                                onClick={handleDeleteAccount}
                                disabled={deleteLoading}
                                className="inline-flex items-center justify-center py-2 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
                            >
                                {deleteLoading ? 'Deleting...' : 'Yes, Delete My Account'}
                            </button>
                            <button
                                onClick={() => setShowConfirm(false)}
                                className="inline-flex items-center justify-center py-2 px-4 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ProfilePage;
