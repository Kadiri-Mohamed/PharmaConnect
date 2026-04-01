import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useCart } from '../hooks/useCart';
import publicService from '../services/publicService';

const PharmacyDetails = () => {
  const { id } = useParams();
  const [pharmacy, setPharmacy] = useState(null);
  const [medicines, setMedicines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [medicinesLoading, setMedicinesLoading] = useState(false);
  const [error, setError] = useState(null);
  const [medicinesError, setMedicinesError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showInStockOnly, setShowInStockOnly] = useState(true);
  const { addItem } = useCart();

  const loadPharmacy = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await publicService.getPharmacy(id);
      setPharmacy(response.pharmacy);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load pharmacy details');
    } finally {
      setLoading(false);
    }
  }, [id]);

  const loadMedicines = useCallback(async () => {
    if (!pharmacy) return;

    try {
      setMedicinesLoading(true);
      setMedicinesError(null);

      const params = {
        search: searchQuery || undefined,
        in_stock: showInStockOnly ? 'true' : undefined,
      };

      const response = await publicService.getMedicinesByPharmacy(id, params);
      setMedicines(response.medicines);
    } catch (err) {
      setMedicinesError(err.response?.data?.message || 'Failed to load medicines');
    } finally {
      setMedicinesLoading(false);
    }
  }, [pharmacy, searchQuery, showInStockOnly, id]);

  useEffect(() => {
    loadPharmacy();
  }, [loadPharmacy]);

  useEffect(() => {
    if (pharmacy) {
      loadMedicines();
    }
  }, [loadMedicines, pharmacy]);

  const handleSearch = (e) => {
    e.preventDefault();
    loadMedicines();
  };

  const handleAddToCart = async (medicine) => {
    try {
      await addItem(medicine.id, 1);
      alert(`${medicine.name} added to cart!`);
    } catch {
      alert('Failed to add item to cart. Please try again.');
    }
  };

  const formatOpeningHours = (hours) => {
    if (!hours) return 'Hours not available';
    try {
      const parsed = JSON.parse(hours);
      if (Array.isArray(parsed)) {
        return parsed.map(day => `${day.day}: ${day.open} - ${day.close}`).join(', ');
      }
      return hours;
    } catch {
      return hours;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading pharmacy details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-6xl mx-auto px-4">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
          <Link
            to="/pharmacies"
            className="inline-block bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Back to Pharmacies
          </Link>
        </div>
      </div>
    );
  }

  if (!pharmacy) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Pharmacy not found</h2>
            <Link
              to="/pharmacies"
              className="inline-block bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Back to Pharmacies
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Back Button */}
        <div className="mb-6">
          <Link
            to="/pharmacies"
            className="inline-flex items-center text-blue-600 hover:text-blue-800"
          >
            ← Back to Pharmacies
          </Link>
        </div>

        {/* Pharmacy Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex justify-between items-start mb-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold text-gray-800">{pharmacy.name}</h1>
                {pharmacy.is_on_duty && (
                  <span className="bg-green-100 text-green-800 text-sm px-3 py-1 rounded-full font-medium">
                    🏥 On Duty
                  </span>
                )}
              </div>
              <p className="text-gray-600 text-lg mb-2">{pharmacy.address}</p>
              <p className="text-gray-600 mb-3">📞 {pharmacy.phone}</p>
            </div>
          </div>

          <div className="border-t pt-4">
            <h3 className="font-semibold text-gray-800 mb-2">Opening Hours</h3>
            <p className="text-gray-600">{formatOpeningHours(pharmacy.opening_hours)}</p>
          </div>
        </div>

        {/* Medicines Section */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800">
              Available Medicines ({pharmacy.medicines_count})
            </h2>
          </div>

          {/* Search and Filters */}
          <div className="mb-6">
            <form onSubmit={handleSearch} className="flex gap-4 mb-4">
              <div className="flex-1">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search medicines..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <button
                type="submit"
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Search
              </button>
            </form>

            <div className="flex items-center gap-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={showInStockOnly}
                  onChange={(e) => setShowInStockOnly(e.target.checked)}
                  className="mr-2"
                />
                <span className="text-sm font-medium text-gray-700">In stock only</span>
              </label>
            </div>
          </div>

          {/* Medicines Error */}
          {medicinesError && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
              {medicinesError}
            </div>
          )}

          {/* Medicines Loading */}
          {medicinesLoading && (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-gray-600">Loading medicines...</p>
            </div>
          )}

          {/* Medicines Grid */}
          {!medicinesLoading && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {medicines.map((medicine) => (
                <div key={medicine.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="text-lg font-semibold text-gray-800 line-clamp-2">
                      {medicine.name}
                    </h3>
                    {medicine.requires_prescription && (
                      <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full font-medium">
                        Rx
                      </span>
                    )}
                  </div>

                  <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                    {medicine.description}
                  </p>

                  <div className="mb-4">
                    <p className="text-2xl font-bold text-blue-600">
                      ${medicine.price.toFixed(2)}
                    </p>
                    <p className="text-sm text-gray-500">
                      Stock: {medicine.stock}
                    </p>
                  </div>

                  <button
                    onClick={() => handleAddToCart(medicine)}
                    disabled={medicine.stock === 0}
                    className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                  >
                    {medicine.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Empty State */}
          {!medicinesLoading && medicines.length === 0 && (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">No medicines found</h3>
              <p className="text-gray-600">Try adjusting your search or filters</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PharmacyDetails;