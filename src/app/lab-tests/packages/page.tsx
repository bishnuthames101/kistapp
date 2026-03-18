'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Clock, FileText, ArrowLeft, Search, Filter, Heart, ShoppingCart } from 'lucide-react';
import { testPackages } from '@/data/labTests';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/contexts/ToastContext';

export default function AllPackagesPage() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [priceFilter, setPriceFilter] = useState('All');

  const handleBookNow = () => {
    if (!user) {
      showToast('Please login to book a package', 'error');
      return;
    }
  };

  // Get unique categories
  const categories = ['All', ...Array.from(new Set(testPackages.map(pkg => pkg.category)))];

  // Filter packages
  const filteredPackages = testPackages.filter(pkg => {
    const matchesSearch = pkg.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         pkg.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || pkg.category === selectedCategory;

    let matchesPrice = true;
    if (priceFilter === 'Under 3000') matchesPrice = pkg.price < 3000;
    else if (priceFilter === '3000-5000') matchesPrice = pkg.price >= 3000 && pkg.price <= 5000;
    else if (priceFilter === 'Above 5000') matchesPrice = pkg.price > 5000;

    return matchesSearch && matchesCategory && matchesPrice;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-12">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/lab-tests"
            className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-4 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Laboratory Tests
          </Link>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Health Test Packages</h1>
          <p className="text-gray-600">Comprehensive health screening packages for complete wellness</p>
        </div>

        {/* Search and Filters */}
        <div className="glass-card mb-8 p-6 rounded-xl shadow-lg">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search packages..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Category Filter */}
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
              >
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>

            {/* Price Filter */}
            <div>
              <select
                value={priceFilter}
                onChange={(e) => setPriceFilter(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="All">All Prices</option>
                <option value="Under 3000">Under Rs. 3,000</option>
                <option value="3000-5000">Rs. 3,000 - 5,000</option>
                <option value="Above 5000">Above Rs. 5,000</option>
              </select>
            </div>
          </div>

          <div className="mt-4 text-sm text-gray-600">
            Showing {filteredPackages.length} of {testPackages.length} packages
          </div>
        </div>

        {/* Package Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPackages.map((pkg) => (
            <div
              key={pkg.id}
              className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 group"
            >
              {/* Package Image */}
              <div className="relative h-48 overflow-hidden bg-gradient-to-br from-blue-100 to-purple-100">
                <Image
                  src={pkg.image}
                  alt={pkg.name}
                  fill
                  className="object-cover group-hover:scale-110 transition-transform duration-300"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
                {/* Category Badge */}
                <div className="absolute top-3 left-3">
                  <span className="glass px-3 py-1 text-xs font-semibold text-blue-700 rounded-full">
                    {pkg.category}
                  </span>
                </div>
                {/* Wishlist Icon */}
                <button className="absolute top-3 right-3 p-2 bg-white/90 rounded-full hover:bg-white transition-colors shadow-md">
                  <Heart className="w-4 h-4 text-gray-600 hover:text-red-500" />
                </button>
              </div>

              {/* Package Content */}
              <div className="p-5">
                <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                  {pkg.name}
                </h3>
                <p className="text-gray-600 text-sm mb-4 line-clamp-2">{pkg.description}</p>

                {/* Features */}
                {pkg.features && pkg.features.length > 0 && (
                  <div className="mb-4">
                    <div className="flex flex-wrap gap-1">
                      {pkg.features.slice(0, 3).map((feature, index) => (
                        <span
                          key={index}
                          className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded"
                        >
                          {feature}
                        </span>
                      ))}
                      {pkg.features.length > 3 && (
                        <span className="text-xs text-gray-500 px-2 py-1">
                          +{pkg.features.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {/* Tests Included */}
                <div className="mb-4">
                  <div className="flex items-start text-sm text-gray-600">
                    <FileText className="w-4 h-4 mr-2 mt-1 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-gray-700">{pkg.tests.length} Tests Included</p>
                    </div>
                  </div>
                </div>

                {/* Turnaround Time */}
                <div className="flex items-center text-sm text-gray-600 mb-4">
                  <Clock className="w-4 h-4 mr-2" />
                  <span>Results in {pkg.turnaroundTime}</span>
                </div>

                {/* Price and Book Button */}
                <div className="flex justify-between items-center pt-4 border-t">
                  <div>
                    <p className="text-xs text-gray-500">Starting from</p>
                    <p className="text-2xl font-bold text-blue-600">₹{pkg.price.toLocaleString()}</p>
                  </div>
                  <Link
                    href={user ? `/lab-tests/package/${pkg.id}` : '/login'}
                    onClick={(e) => {
                      if (!user) {
                        e.preventDefault();
                        handleBookNow();
                      }
                    }}
                    className="glass-button bg-blue-600 text-white px-5 py-2.5 rounded-lg hover:bg-blue-700 transition-all flex items-center gap-2 shadow-md hover:shadow-lg"
                  >
                    <ShoppingCart className="w-4 h-4" />
                    Book Now
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* No Results */}
        {filteredPackages.length === 0 && (
          <div className="text-center py-12">
            <div className="glass-card inline-block p-8 rounded-xl">
              <Search className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-700 mb-2">No packages found</h3>
              <p className="text-gray-500">Try adjusting your search or filters</p>
            </div>
          </div>
        )}

        {/* Why Choose Our Test Packages */}
        <div className="mt-16 glass-card p-8 rounded-xl shadow-lg">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Why Choose Our Test Packages?</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FileText className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="font-semibold mb-2">Comprehensive Testing</h3>
              <p className="text-sm text-gray-600">All-inclusive packages covering multiple health parameters</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="font-semibold mb-2">Fast Results</h3>
              <p className="text-sm text-gray-600">Quick turnaround time with accurate results</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <ShoppingCart className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="font-semibold mb-2">Easy Booking</h3>
              <p className="text-sm text-gray-600">Simple online booking process</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Heart className="w-8 h-8 text-orange-600" />
              </div>
              <h3 className="font-semibold mb-2">Trusted Care</h3>
              <p className="text-sm text-gray-600">Professional and reliable healthcare services</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
