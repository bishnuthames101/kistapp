import Link from "next/link"
import { Package, ShoppingCart, FlaskRound, Calendar } from "lucide-react"

export default function AdminDashboard() {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Appointments Card */}
        <Link
          href="/admin/appointments"
          className="group bg-white p-6 rounded-lg shadow hover:shadow-lg transition-shadow border border-gray-200"
        >
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-indigo-100 rounded-lg group-hover:bg-indigo-200 transition-colors">
              <Calendar className="w-6 h-6 text-indigo-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Appointments</h2>
              <p className="text-gray-600 text-sm">Manage doctor bookings</p>
            </div>
          </div>
        </Link>
        {/* Medicines Card */}
        <Link
          href="/admin/medicines"
          className="group bg-white p-6 rounded-lg shadow hover:shadow-lg transition-shadow border border-gray-200"
        >
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-blue-100 rounded-lg group-hover:bg-blue-200 transition-colors">
              <Package className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Medicines</h2>
              <p className="text-gray-600 text-sm">Manage medicine catalog</p>
            </div>
          </div>
        </Link>

        {/* Orders Card */}
        <Link
          href="/admin/orders"
          className="group bg-white p-6 rounded-lg shadow hover:shadow-lg transition-shadow border border-gray-200"
        >
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-green-100 rounded-lg group-hover:bg-green-200 transition-colors">
              <ShoppingCart className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Orders</h2>
              <p className="text-gray-600 text-sm">View and manage orders</p>
            </div>
          </div>
        </Link>

        {/* Lab Tests Card */}
        <Link
          href="/admin/lab-tests"
          className="group bg-white p-6 rounded-lg shadow hover:shadow-lg transition-shadow border border-gray-200"
        >
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-orange-100 rounded-lg group-hover:bg-orange-200 transition-colors">
              <FlaskRound className="w-6 h-6 text-orange-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Lab Tests</h2>
              <p className="text-gray-600 text-sm">Manage lab test bookings</p>
            </div>
          </div>
        </Link>
      </div>

      {/* Quick Stats */}
      <div className="mt-12">
        <h2 className="text-2xl font-bold mb-6">Quick Stats</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
            <p className="text-gray-600 text-sm">Total Medicines</p>
            <p className="text-3xl font-bold text-gray-900 mt-2">-</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
            <p className="text-gray-600 text-sm">Pending Orders</p>
            <p className="text-3xl font-bold text-gray-900 mt-2">-</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
            <p className="text-gray-600 text-sm">Pending Prescriptions</p>
            <p className="text-3xl font-bold text-gray-900 mt-2">-</p>
          </div>
        </div>
      </div>
    </div>
  )
}
