import React, { useState } from 'react';
import api from '../../services/api';
import { Lock, CheckCircle, AlertCircle } from 'lucide-react';

const UpdatePasswordForm = () => {
    const [formData, setFormData] = useState({
        current_password: '',
        new_password: '',
        new_password_confirmation: ''
    });
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState('');
    const [error, setError] = useState('');

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setSuccess('');
        setError('');

        try {
            await api.put('/updatePassword', formData);
            setSuccess('Password updated successfully!');
            setFormData({
                current_password: '',
                new_password: '',
                new_password_confirmation: ''
            });
        } catch (err) {
            if (err.response?.status === 422) {
                setError(Object.values(err.response.data.errors).flat().join(', '));
            } else {
                setError('Failed to update password. Please check your current password.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">Update Password</h3>

            {success && (
                <div className="mb-4 bg-green-50 p-4 rounded-md flex">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                    <p className="text-sm text-green-700">{success}</p>
                </div>
            )}
            {error && (
                <div className="mb-4 bg-red-50 p-4 rounded-md flex">
                    <AlertCircle className="h-5 w-5 text-red-500 mr-3" />
                    <p className="text-sm text-red-700">{error}</p>
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Lock className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                            type="password"
                            name="current_password"
                            value={formData.current_password}
                            onChange={handleChange}
                            className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                            required
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Lock className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                            type="password"
                            name="new_password"
                            value={formData.new_password}
                            onChange={handleChange}
                            className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                            required
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Lock className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                            type="password"
                            name="new_password_confirmation"
                            value={formData.new_password_confirmation}
                            onChange={handleChange}
                            className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                            required
                        />
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                >
                    {loading ? 'Updating...' : 'Update Password'}
                </button>
            </form>
        </div>
    );
};

export default UpdatePasswordForm;
