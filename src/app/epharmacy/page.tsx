'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ShoppingCart, Search, Plus, Minus } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/contexts/ToastContext';
import { Medicine, stockLabel } from '@/types/medicine';
import { pharmacyOrders, medicines, errorMessage } from '@/services/api';

function MedicineCard({
  medicine,
  onAdd,
}: {
  medicine: Medicine;
  onAdd: (medicine: Medicine) => void;
}) {
  const outOfStock = medicine.stock === 'OUT_OF_STOCK';

  return (
    <div className="glass-card p-3 hover:bg-white/30 transition-all duration-300">
      <img
        src={medicine.image ?? '/logo.jpg'}
        alt={medicine.name}
        loading="lazy"
        className="w-full h-32 sm:h-36 object-contain rounded-lg mb-2"
      />
      <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-1">{medicine.name}</h3>
      <p className="text-xs sm:text-sm text-gray-600 mb-2 line-clamp-2">{medicine.description}</p>
      <div className="flex justify-between items-center">
        <span className="text-sm sm:text-base text-blue-600 font-semibold">
          Rs. {medicine.price}
        </span>
        <button
          onClick={() => onAdd(medicine)}
          disabled={outOfStock}
          className="glass-button ml-auto px-3 py-1.5 text-xs sm:text-sm"
        >
          {outOfStock ? 'Out of Stock' : 'Add to Cart'}
        </button>
      </div>
      <p className={`text-xs mt-2 ${outOfStock ? 'text-red-600' : 'text-gray-500'}`}>
        {stockLabel(medicine.stock)}
      </p>
    </div>
  );
}

export default function EPharmacyPage() {
  const { items, addToCart, updateQuantity, total, clearCart, removeFromCart } = useCart();
  const { user } = useAuth();
  const { showToast } = useToast();
  const router = useRouter();
  const [showCart, setShowCart] = useState(false);
  const [medicineData, setMedicineData] = useState<Record<string, Medicine[]>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [placingOrder, setPlacingOrder] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Medicine[] | null>(null);
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    const fetchMedicines = async () => {
      try {
        setLoading(true);
        // Single API call: a few medicines per category.
        setMedicineData(await medicines.getFeatured(3));
      } catch (error) {
        console.error('Error fetching medicines:', error);
        setError(errorMessage(error, 'Failed to load medicines. Please try again later.'));
      } finally {
        setLoading(false);
      }
    };

    fetchMedicines();
  }, []);

  // The search box used to be bound to state that nothing ever read. Debounced
  // so typing does not fire a request per keystroke.
  useEffect(() => {
    const term = searchQuery.trim();

    if (term.length < 2) {
      setSearchResults(null);
      setSearching(false);
      return;
    }

    setSearching(true);
    let cancelled = false;

    const timer = setTimeout(async () => {
      try {
        const results = await medicines.search(term);
        if (!cancelled) setSearchResults(results);
      } catch (err) {
        console.error('Search failed:', err);
        if (!cancelled) setSearchResults([]);
      } finally {
        if (!cancelled) setSearching(false);
      }
    }, 300);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [searchQuery]);

  const handleAddToCart = (medicine: Medicine) => {
    addToCart(medicine);
    showToast(`${medicine.name} added to cart`);
  };

  const handleOrder = async () => {
    if (!user) {
      setShowCart(false);
      router.push('/login');
      return;
    }

    if (placingOrder) return;
    setPlacingOrder(true);

    // Each cart line is still its own PharmacyOrder row - there is no order
    // header in the schema yet - so a partial failure is possible. Report it
    // honestly and leave the failed items in the cart instead of pretending
    // the whole order went through.
    const results = await Promise.allSettled(
      items.map((item) =>
        pharmacyOrders
          .create({
            medicineId: item.id,
            quantity: item.quantity,
            deliveryAddress: user.address || undefined,
            paymentMethod: 'Cash on Delivery',
          })
          .then(() => item)
      )
    );

    const failed = items.filter((_, index) => results[index].status === 'rejected');
    const firstError = results.find((r) => r.status === 'rejected') as
      | PromiseRejectedResult
      | undefined;

    setPlacingOrder(false);

    if (failed.length === 0) {
      showToast('Order placed successfully!', 'success');
      clearCart();
      setShowCart(false);
      return;
    }

    if (failed.length === items.length) {
      console.error('Error placing order:', firstError?.reason);
      showToast(
        errorMessage(firstError?.reason, 'Failed to place order. Please try again.'),
        'error'
      );
      return;
    }

    // Keep only what did not go through, so a retry does not double-order.
    items.filter((item) => !failed.includes(item)).forEach((item) => removeFromCart(item.id));
    showToast(
      `Ordered ${items.length - failed.length} of ${items.length} items. ${failed
        .map((item) => item.name)
        .join(', ')} could not be ordered.`,
      'error'
    );
  };


  return (
    <div className="py-12 bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4">
        <div className="glass-card p-6 mb-8">
          <div className="flex flex-col sm:flex-row justify-between items-center">
            <h1 className="text-3xl font-bold text-gray-800 text-center sm:text-left mb-4 sm:mb-0">Online Pharmacy</h1>
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4 w-full sm:w-auto">
              <button
                onClick={() => setShowCart(true)}
                className="glass-button flex items-center justify-center w-full sm:w-auto"
              >
                <ShoppingCart className="w-5 h-5 mr-2" />
                Cart ({items.length})
              </button>
            </div>
          </div>


        </div>
         {/* Search Bar */}
         <div className="mt- mb-8">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search medicines..."
                className="glass-input pl-10 w-full sm:w-[395px]"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

        {/* Loading State */}
        {loading && (
          <div className="glass-card p-12 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-600 mb-4"></div>
            <p className="text-gray-600">Loading medicines...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="glass-card p-12 text-center">
            <p className="text-red-600">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="glass-button mt-4"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Search results replace the category browse while a query is active */}
        {searchResults !== null && (
          <div className="glass-card p-6 mb-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-6">
              {searching
                ? 'Searching…'
                : `${searchResults.length} result${searchResults.length === 1 ? '' : 's'} for “${searchQuery.trim()}”`}
            </h2>
            {!searching && searchResults.length === 0 ? (
              <p className="text-gray-500">
                No medicines matched that search. Try a different name.
              </p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {searchResults.map((medicine) => (
                  <MedicineCard
                    key={medicine.id}
                    medicine={medicine}
                    onAdd={handleAddToCart}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Categories */}
        {!loading && !error && searchResults === null && (
          <div className="space-y-8">
            {Object.entries(medicineData).map(([category, categoryMedicines]) => (
              <div key={category} className="glass-card p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-semibold text-gray-800 capitalize">
                    {category.replace(/([A-Z])/g, ' $1').trim()}
                  </h2>
                  <Link
                    href={`/epharmacy/category/${category}`}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    View All
                  </Link>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {categoryMedicines.length > 0 ? (
                    categoryMedicines.slice(0, 3).map((medicine) => (
                      <MedicineCard
                        key={medicine.id}
                        medicine={medicine}
                        onAdd={handleAddToCart}
                      />
                    ))
                  ) : (
                    <div className="col-span-3 text-center py-8">
                      <p className="text-gray-500">No products available in this category</p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Shopping Cart Sidebar */}
        {showCart && (
          <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm z-50">
            <div className="absolute right-0 top-0 h-full w-full max-w-md">
              <div className="glass-card h-full">
                <div className="p-6">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold">Your Cart</h2>
                    <button
                      onClick={() => setShowCart(false)}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      ✕
                    </button>
                  </div>

                  {items.length === 0 ? (
                    <p className="text-gray-500">Your cart is empty</p>
                  ) : (
                    <>
                      <div className="space-y-4 mb-6">
                        {items.map((item) => (
                          <div key={item.id} className="glass p-4 rounded-lg">
                            <div className="flex items-center">
                              <img
                                src={item.image ?? '/logo.jpg'}
                                alt={item.name}
                                loading="lazy"
                                className="w-16 h-16 object-cover rounded"
                              />
                              <div className="ml-4 flex-1">
                                <h3 className="font-medium">{item.name}</h3>
                                <p className="text-gray-500">Rs. {item.price}</p>
                              </div>
                              <div className="flex items-center space-x-2">
                                <button
                                  onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                  className="glass-button-secondary p-1"
                                >
                                  <Minus className="w-4 h-4" />
                                </button>
                                <span className="w-8 text-center">{item.quantity}</span>
                                <button
                                  onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                  className="glass-button-secondary p-1"
                                >
                                  <Plus className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="border-t border-gray-200 pt-4">
                        <div className="flex justify-between mb-4">
                          <span className="font-semibold">Total:</span>
                          <span className="font-semibold">Rs. {total}</span>
                        </div>
                        <button
                          onClick={handleOrder}
                          disabled={placingOrder}
                          className="glass-button w-full"
                        >
                          {placingOrder
                            ? 'Placing order…'
                            : user
                              ? 'Place Order'
                              : 'Login to Order'}
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
