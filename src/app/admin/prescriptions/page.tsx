"use client"

import { useState, useEffect } from "react"

export default function AdminPrescriptions() {
  const [prescriptions, setPrescriptions] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchPrescriptions()
  }, [])

  const fetchPrescriptions = async () => {
    try {
      const res = await fetch("/api/prescriptions")
      const data = await res.json()
      setPrescriptions(data)
    } catch (error) {
      console.error("Error fetching prescriptions:", error)
    } finally {
      setLoading(false)
    }
  }

  const updateStatus = async (prescriptionId: string, newStatus: string) => {
    try {
      await fetch(`/api/prescriptions/${prescriptionId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      })
      fetchPrescriptions()
    } catch (error) {
      console.error("Error updating prescription:", error)
    }
  }

  if (loading) {
    return <div>Loading prescriptions...</div>
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Verify Prescriptions</h1>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Patient</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {prescriptions.map((prescription: any) => (
              <tr key={prescription.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm">{prescription.id.substring(0, 8)}...</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div>
                    <p className="font-medium">{prescription.patient?.name}</p>
                    <p className="text-sm text-gray-500">{prescription.patient?.phone}</p>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  {new Date(prescription.createdAt).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <select
                    value={prescription.status}
                    onChange={(e) => updateStatus(prescription.id, e.target.value)}
                    className={`text-sm border rounded px-2 py-1 ${
                      prescription.status === "pending"
                        ? "border-yellow-500"
                        : prescription.status === "verified"
                        ? "border-green-500"
                        : "border-red-500"
                    }`}
                  >
                    <option value="pending">Pending</option>
                    <option value="verified">Verified</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <a
                    href={prescription.prescriptionImageUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-900"
                  >
                    View Image
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
