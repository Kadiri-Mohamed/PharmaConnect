import React, { useState } from 'react';
import { useCart } from '../hooks/useCart';
import publicService from '../services/publicService';

const SearchMedicines = () => {
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [query, setQuery] = useState('');
  const [hasSearched, setHasSearched] = useState(false);
  const { addItem } = useCart();

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;

    try {
      setLoading(true);
      setError(null);
      setHasSearched(true);

      const response = await publicService.searchMedicines(query.trim());
      setSearchResults(response.medicines);
    } catch (err) {
      setError(err.response?.data?.message || 'Search failed');
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async (medicine) => {
    try {
      await addItem(medicine.id, 1);
      alert(`${medicine.name} added to cart!`);
    } catch {
      alert('Failed to add item to cart. Please try again.');
    }
  };

  const clearSearch = () => {
    setQuery('');
    setSearchResults([]);
    setHasSearched(false);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-4">Search Medicines</h1>
          <p className="text-gray-600">Find medicines across all pharmacies</p>
        </div>

        {/* Search Form */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <form onSubmit={handleSearch} className="flex gap-4">
            <div className="flex-1">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Enter medicine name, description, or keywords..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-lg"
                minLength={2}
                maxLength={100}
              />
            </div>
            <button
              type="submit"
              disabled={loading || !query.trim()}
              className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors text-lg font-medium"
            >
              {loading ? 'Searching...' : 'Search'}
            </button>
            {hasSearched && (
              <button
                type="button"
                onClick={clearSearch}
                className="px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
              >
                Clear
              </button>
            )}
          </form>

          <div className="mt-4 text-sm text-gray-600">
            <p>💡 <strong>Tips:</strong> Search for medicine names, active ingredients, or symptoms</p>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Searching for medicines...</p>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        {/* Search Results */}
        {hasSearched && !loading && (
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Search Results {searchResults.length > 0 && `(${searchResults.length} found)`}
            </h2>

            {searchResults.length === 0 && !error && (
              <div className="bg-white rounded-lg shadow-md p-8 text-center">
                <div className="text-6xl mb-4">🔍</div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">No medicines found</h3>
                <p className="text-gray-600 mb-4">
                  We couldn't find any medicines matching "{query}"
                </p>
                <div className="text-sm text-gray-500">
                  <p>Try:</p>
                  <ul className="list-disc list-inside mt-2">
                    <li>Using different keywords</li>
                    <li>Checking spelling</li>
                    <li>Using more general terms</li>
                  </ul>
                </div>
              </div>
            )}

            {searchResults.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {searchResults.map((medicine) => (
                  <div key={medicine.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                    <div className="p-6">
                      <div className="flex justify-between items-start mb-3">
                        <h3 className="text-lg font-semibold text-gray-800 line-clamp-2">
                          {medicine.name}
                        </h3>
                        {medicine.requires_prescription && (
                          <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full font-medium">
                            Rx Required
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

                      <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                        <p className="text-sm font-medium text-gray-700">Pharmacy:</p>
                        <p className="text-sm text-gray-800 font-medium">{medicine.pharmacy.name}</p>
                        <p className="text-xs text-gray-600">{medicine.pharmacy.address}</p>
                        {medicine.pharmacy.is_on_duty && (
                          <span className="inline-block bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full mt-1">
                            On Duty
                          </span>
                        )}
                      </div>

                      <button
                        onClick={() => handleAddToCart(medicine)}
                        disabled={medicine.stock === 0}
                        className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                      >
                        {medicine.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Popular Searches / Suggestions */}
        {!hasSearched && !loading && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Popular Medicine Categories</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                'Pain Relief',
                'Antibiotics',
                'Vitamins',
                'Allergy',
                'Diabetes',
                'Blood Pressure',
                'Heart Medicine',
                'Skin Care'
              ].map((category) => (
                <button
                  key={category}
                  onClick={() => setQuery(category)}
                  className="p-3 border border-gray-200 rounded-lg hover:bg-blue-50 hover:border-blue-300 transition-colors text-left"
                >
                  <span className="text-sm font-medium text-gray-700">{category}</span>
                </button>
              ))}
            </div>

            <div className="mt-6 pt-6 border-t">
              <h4 className="text-md font-medium text-gray-800 mb-3">Quick Search Examples</h4>
              <div className="space-y-2 text-sm text-gray-600">
                <p>• "paracetamol" or "acetaminophen" for pain relief</p>
                <p>• "vitamin c" or "ascorbic acid" for immune support</p>
                <p>• "amoxicillin" for bacterial infections</p>
                <p>• "ibuprofen" for inflammation and pain</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchMedicines;