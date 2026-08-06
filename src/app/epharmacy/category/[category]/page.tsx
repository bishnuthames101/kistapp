'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, ShoppingCart } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { useToast } from '@/contexts/ToastContext';
import { Medicine, stockLabel } from '@/types/medicine';
import { medicines, errorMessage } from '@/services/api';

export default function CategoryPage() {
  const params = useParams();
  const category = params.category as string;
  const { addToCart, items } = useCart();
  const { showToast } = useToast();
  const [categoryMedicines, setCategoryMedicines] = useState<Medicine[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const categoryName = category ? category.replace(/([A-Z])/g, ' $1').trim() : '';

  useEffect(() => {
    const fetchMedicines = async () => {
      if (!category) return;

      try {
        setLoading(true);
        // The URL segment is a normalised category ("painRelief"), while the
        // database stores the display name ("Pain Relief"), so fall back to
        // matching every category with punctuation and spacing removed.
        const byName = await medicines.getByCategory(categoryName);

        if (byName.length > 0) {
          setCategoryMedicines(byName);
        } else {
          const all = await medicines.list({ limit: 200 });
          setCategoryMedicines(
            all.filter(
              (med) =>
                med.category.toLowerCase().replace(/\s+/g, '') === category.toLowerCase()
            )
          );
        }
      } catch (error) {
        console.error('Error fetching medicines for category:', error);
        setError(errorMessage(error, 'Failed to load medicines. Please try again later.'));
      } finally {
        setLoading(false);
      }
    };

    fetchMedicines();
  }, [category, categoryName]);

  const handleAddToCart = (medicine: Medicine) => {
    addToCart(medicine);
    showToast(`${medicine.name} added to cart`);
  };

  return (
    <div className="py-12 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="mb-8">
          <Link
            href="/epharmacy"
            className="inline-flex items-center text-blue-600 hover:text-blue-800"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to ePharmacy
          </Link>
          <div className="flex flex-wrap items-center justify-between gap-4 mt-4">
            <h1 className="text-3xl font-bold text-gray-800">{categoryName} Medicines</h1>
            {/* Without this the cart was unreachable from a category page. */}
            <Link
              href="/epharmacy"
              className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              <ShoppingCart className="w-4 h-4" />
              View Cart ({items.length})
            </Link>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-600 mb-4"></div>
            <p className="text-gray-600">Loading medicines...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="text-center py-12">
            <p className="text-red-600">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              Try Again
            </button>
          </div>
        )}

        {/* No Results State */}
        {!loading && !error && categoryMedicines.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-600">No medicines found in this category.</p>
          </div>
        )}

        {/* Medicines Grid */}
        {!loading && !error && categoryMedicines.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {categoryMedicines.map((medicine) => (
            <div key={medicine.id} className="bg-white rounded-lg shadow-md overflow-hidden">
              <img
                src={medicine.image ?? '/logo.jpg'}
                alt={medicine.name}
                className="w-full h-32 sm:h-36 object-contain rounded-t-lg"
              />
              <div className="p-3">
                <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-1">{medicine.name}</h3>
                <p className="text-xs sm:text-sm text-gray-600 mb-2 line-clamp-2">{medicine.description}</p>
                <div className="flex justify-between items-center">
                  <span className="text-sm sm:text-base text-blue-600 font-semibold">Rs. {medicine.price}</span>
                  <button
                    onClick={() => handleAddToCart(medicine)}
                    className="bg-blue-600 text-white px-3 py-1.5 text-xs sm:text-sm rounded hover:bg-blue-700"
                  >
                    Add to Cart
                  </button>
                </div>
                <p className={`text-xs mt-2 ${medicine.stock === 'OUT_OF_STOCK' ? 'text-red-600' : 'text-gray-500'}`}>
                  {stockLabel(medicine.stock)}
                </p>
              </div>
            </div>
          ))}
        </div>
        )}
      </div>
    </div>
  );
}
