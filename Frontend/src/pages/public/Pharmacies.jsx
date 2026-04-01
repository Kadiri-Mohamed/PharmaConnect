import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import publicService from '../services/publicService';

const Pharmacies = () => {
  const [pharmacies, setPharmacies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showOnDutyOnly, setShowOnDutyOnly] = useState(false);
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');

  const loadPharmacies = useCallback(async (page = 1) => {
    try {
      setLoading(true);
      setError(null);

      const params = {
        page,
        search: searchQuery || undefined,
        on_duty: showOnDutyOnly ? 'true' : undefined,
        sort_by: sortBy,
        sort_order: sortOrder,
      };

      const response = await publicService.getPharmacies(params);
      setPharmacies(response.pharmacies);
      setPagination(response.pagination);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load pharmacies');
    } finally {
      setLoading(false);
    }
  }, [searchQuery, showOnDutyOnly, sortBy, sortOrder]);

  useEffect(() => {
    loadPharmacies();
  }, [loadPharmacies]);

  const handleSearch = (e) => {
    e.preventDefault();
    loadPharmacies();
  };

  const handlePageChange = (page) => {
    loadPharmacies(page);
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

  if (loading && pharmacies.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading pharmacies...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-4">Pharmacies</h1>

          {/* Search and Filters */}
          <div className="bg-white p-6 rounded-lg shadow-md mb-6">
            <form onSubmit={handleSearch} className="flex gap-4 mb-4">
              <div className="flex-1">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search pharmacies by name or address..."
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

            <div className="flex flex-wrap gap-4 items-center">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={showOnDutyOnly}
                  onChange={(e) => setShowOnDutyOnly(e.target.checked)}
                  className="mr-2"
                />
                <span className="text-sm font-medium text-gray-700">On-duty pharmacies only</span>
              </label>

              <div className="flex items-center gap-2">
                <label className="text-sm font-medium text-gray-700">Sort by:</label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-3 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="name">Name</option>
                  <option value="created_at">Date Added</option>
                </select>
                <select
                  value={sortOrder}
                  onChange={(e) => setSortOrder(e.target.value)}
                  className="px-3 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="asc">Ascending</option>
                  <option value="desc">Descending</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        {/* Pharmacies List */}
        <div className="space-y-6 mb-8">
          {pharmacies.map((pharmacy) => (
            <div key={pharmacy.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-semibold text-gray-800">
                        {pharmacy.name}
                      </h3>
                      {pharmacy.is_on_duty && (
                        <span className="bg-green-100 text-green-800 text-sm px-3 py-1 rounded-full font-medium">
                          🏥 On Duty
                        </span>
                      )}
                    </div>
                    <p className="text-gray-600 mb-2">{pharmacy.address}</p>
                    <p className="text-gray-600 text-sm mb-3">
                      📞 {pharmacy.phone}
                    </p>
                    <div className="text-sm text-gray-600">
                      <p className="font-medium mb-1">Opening Hours:</p>
                      <p className="text-xs">{formatOpeningHours(pharmacy.opening_hours)}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <Link
                      to={`/pharmacies/${pharmacy.id}`}
                      className="inline-block bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      View Details
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {pharmacies.length === 0 && !loading && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🏥</div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">No pharmacies found</h3>
            <p className="text-gray-600">Try adjusting your search criteria</p>
          </div>
        )}

        {/* Pagination */}
        {pagination && pagination.last_page > 1 && (
          <div className="flex justify-center items-center space-x-2">
            <button
              onClick={() => handlePageChange(pagination.current_page - 1)}
              disabled={pagination.current_page === 1}
              className="px-3 py-2 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>

            {Array.from({ length: Math.min(5, pagination.last_page) }, (_, i) => {
              const page = i + 1;
              return (
                <button
                  key={page}
                  onClick={() => handlePageChange(page)}
                  className={`px-3 py-2 border rounded-md ${
                    pagination.current_page === page
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {page}
                </button>
              );
            })}

            <button
              onClick={() => handlePageChange(pagination.current_page + 1)}
              disabled={pagination.current_page === pagination.last_page}
              className="px-3 py-2 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Pharmacies;