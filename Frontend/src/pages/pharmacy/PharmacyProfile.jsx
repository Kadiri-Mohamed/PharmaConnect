import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const PharmacyProfile = () => {
    const [formData, setFormData] = useState({
        name: '',
        address: '',
        phone: '',
        opening_hours: '',
        is_on_duty: false,
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const { user } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        const loadPharmacy = async () => {
            try {
                const response = await api.get('/pharmacy');
                if (response.data.pharmacy) {
                    setFormData({
                        ...response.data.pharmacy,
                        is_on_duty: !!response.data.pharmacy.is_on_duty,
                    });
                }
            } catch (err) {
                if (err.response?.status !== 404) {
                    setError('Unable to load pharmacy data.');
                }
            } finally {
                setLoading(false);
            }
        };

        if (user?.role !== 'pharmacist') {
            navigate('/');
            return;
        }

        loadPharmacy();
    }, [user, navigate]);

    const handleChange = (event) => {
        const { name, value, type, checked } = event.target;
        setFormData((prev) => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value,
        }));
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setError('');
        setSuccess('');

        try {
            const response = await api.get('/pharmacy');
            if (response.data.pharmacy) {
                await api.put('/pharmacy', formData);
                setSuccess('Pharmacy profile updated.');
            }
        } catch (err) {
            if (err.response?.status === 404) {
                await api.post('/pharmacy', formData);
                setSuccess('Pharmacy profile created.');
            } else if (err.response?.data?.message) {
                setError(err.response.data.message);
            } else {
                setError('Unable to save pharmacy profile.');
            }
            if (!error) {
                setLoading(false);
            }
            return;
        }

        setLoading(false);
    };

    if (loading) {
        return <div className="text-center mt-20">Loading...</div>;
    }

    return (
        <div className="max-w-3xl mx-auto p-6 bg-white rounded-lg shadow">
            <h1 className="text-2xl font-bold mb-4">Pharmacy Profile</h1>
            {error && <p className="text-red-600 mb-3">{error}</p>}
            {success && <p className="text-green-600 mb-3">{success}</p>}

            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700">Name</label>
                    <input
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        className="mt-1 w-full border rounded-md p-2"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700">Address</label>
                    <input
                        name="address"
                        value={formData.address}
                        onChange={handleChange}
                        required
                        className="mt-1 w-full border rounded-md p-2"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700">Phone</label>
                    <input
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        required
                        className="mt-1 w-full border rounded-md p-2"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700">Opening Hours</label>
                    <textarea
                        name="opening_hours"
                        value={formData.opening_hours}
                        onChange={handleChange}
                        required
                        className="mt-1 w-full border rounded-md p-2"
                    />
                </div>

                <div className="flex items-center">
                    <input
                        id="is_on_duty"
                        name="is_on_duty"
                        type="checkbox"
                        checked={formData.is_on_duty}
                        onChange={handleChange}
                        className="mr-2"
                    />
                    <label htmlFor="is_on_duty" className="text-sm text-gray-700">
                        On duty (pharmacie de garde)
                    </label>
                </div>

                <button
                    type="submit"
                    className="py-2 px-4 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                >
                    Save Pharmacy
                </button>
            </form>
        </div>
    );
};

export default PharmacyProfile;
