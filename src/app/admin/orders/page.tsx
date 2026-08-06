"use client"

import { useState, useEffect } from "react"
import { pharmacyOrders, errorMessage, type PharmacyOrder } from "@/services/api"

export default function AdminOrders() {
  const [orders, setOrders] = useState<PharmacyOrder[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchOrders()
  }, [])

  const fetchOrders = async () => {
    try {
      setOrders(await pharmacyOrders.list({ limit: 200 }))
    } catch (error) {
      console.error("Error fetching orders:", error)
      alert(errorMessage(error, "Failed to load orders"))
    } finally {
      setLoading(false)
    }
  }

  const updateStatus = async (orderId: string, newStatus: string) => {
    try {
      await pharmacyOrders.update(orderId, { status: newStatus as PharmacyOrder["status"] })
      fetchOrders()
    } catch (error) {
      console.error("Error updating order:", error)
    }
  }

  if (loading) {
    return <div>Loading orders...</div>
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Manage Orders</h1>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Order ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Patient</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Medicine</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {orders.map((order) => (
              <tr key={order.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm">{order.id.substring(0, 8)}...</td>
                <td className="px-6 py-4 whitespace-nowrap">{order.patient?.name}</td>
                <td className="px-6 py-4 whitespace-nowrap">{order.medicine?.name}</td>
                <td className="px-6 py-4 whitespace-nowrap">Rs. {order.totalAmount}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <select
                    value={order.status}
                    onChange={(e) => updateStatus(order.id, e.target.value)}
                    className="text-sm border rounded px-2 py-1"
                  >
                    <option value="pending">Pending</option>
                    <option value="processing">Processing</option>
                    <option value="delivered">Delivered</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <button className="text-blue-600 hover:text-blue-900">View Details</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
