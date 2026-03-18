"use client"

import { useState, useEffect } from "react"
import { Plus, X, Upload, FileSpreadsheet } from "lucide-react"

interface Medicine {
  id: string
  name: string
  description: string
  price: number
  image: string
  category: string
  stock: string
}

export default function AdminMedicines() {
  const [medicines, setMedicines] = useState<Medicine[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [showBulkModal, setShowBulkModal] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [uploadingImage, setUploadingImage] = useState(false)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string>("")
  const [editingMedicine, setEditingMedicine] = useState<Medicine | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    image: "",
    category: "",
    stock: "IN_STOCK"
  })

  useEffect(() => {
    fetchMedicines()
  }, [])

  const fetchMedicines = async () => {
    try {
      const res = await fetch("/api/medicines")
      const data = await res.json()
      setMedicines(data)
    } catch (error) {
      console.error("Error fetching medicines:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setImageFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const uploadImage = async () => {
    if (!imageFile) return null

    setUploadingImage(true)
    try {
      const formData = new FormData()
      formData.append("file", imageFile)
      formData.append("bucket", "medicines")

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        throw new Error("Failed to upload image")
      }

      const data = await response.json()
      return data.url
    } catch (error) {
      console.error("Error uploading image:", error)
      alert("Failed to upload image")
      return null
    } finally {
      setUploadingImage(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      let imageUrl = formData.image

      // If user selected a file, upload it
      if (imageFile) {
        const uploadedUrl = await uploadImage()
        if (uploadedUrl) {
          imageUrl = uploadedUrl
        }
      }

      const response = await fetch("/api/medicines", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          image: imageUrl,
          price: parseFloat(formData.price),
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to add medicine")
      }

      // Reset form and close modal
      setFormData({
        name: "",
        description: "",
        price: "",
        image: "",
        category: "",
        stock: "IN_STOCK"
      })
      setImageFile(null)
      setImagePreview("")
      setShowModal(false)

      // Refresh medicines list
      fetchMedicines()

      alert("Medicine added successfully!")
    } catch (error) {
      console.error("Error adding medicine:", error)
      alert("Failed to add medicine. Please try again.")
    } finally {
      setSubmitting(false)
    }
  }

  const handleBulkUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setSubmitting(true)
    try {
      const text = await file.text()
      const lines = text.split('\n').filter(line => line.trim())
      const headers = lines[0].split(',').map(h => h.trim())

      const medicines = lines.slice(1).map(line => {
        const values = line.split(',').map(v => v.trim())
        const medicine: any = {}
        headers.forEach((header, index) => {
          medicine[header] = values[index]
        })
        return {
          name: medicine.name,
          description: medicine.description,
          price: parseFloat(medicine.price),
          image: medicine.image || "",
          category: medicine.category,
          stock: medicine.stock || "IN_STOCK"
        }
      })

      // Upload each medicine
      for (const medicine of medicines) {
        await fetch("/api/medicines", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(medicine),
        })
      }

      setShowBulkModal(false)
      fetchMedicines()
      alert(`Successfully added ${medicines.length} medicines!`)
    } catch (error) {
      console.error("Error bulk uploading:", error)
      alert("Failed to bulk upload medicines. Please check CSV format.")
    } finally {
      setSubmitting(false)
    }
  }

  const downloadCSVTemplate = () => {
    const csvContent = "name,description,price,image,category,stock\nParacetamol,Pain reliever and fever reducer,50,https://example.com/image.jpg,Pain Relief,IN_STOCK"
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'medicines_template.csv'
    a.click()
    window.URL.revokeObjectURL(url)
  }

  const handleEdit = (medicine: Medicine) => {
    setEditingMedicine(medicine)
    setFormData({
      name: medicine.name,
      description: medicine.description,
      price: medicine.price.toString(),
      image: medicine.image,
      category: medicine.category,
      stock: medicine.stock
    })
    setImagePreview(medicine.image)
    setShowModal(true)
  }

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingMedicine) return

    setSubmitting(true)

    try {
      let imageUrl = formData.image

      // If user selected a new file, upload it
      if (imageFile) {
        const uploadedUrl = await uploadImage()
        if (uploadedUrl) {
          imageUrl = uploadedUrl
        }
      }

      const response = await fetch(`/api/medicines/${editingMedicine.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          image: imageUrl,
          price: parseFloat(formData.price),
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to update medicine")
      }

      // Reset form and close modal
      setFormData({
        name: "",
        description: "",
        price: "",
        image: "",
        category: "",
        stock: "IN_STOCK"
      })
      setImageFile(null)
      setImagePreview("")
      setEditingMedicine(null)
      setShowModal(false)

      // Refresh medicines list
      fetchMedicines()

      alert("Medicine updated successfully!")
    } catch (error) {
      console.error("Error updating medicine:", error)
      alert("Failed to update medicine. Please try again.")
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete "${name}"?`)) {
      return
    }

    try {
      const response = await fetch(`/api/medicines/${id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Failed to delete medicine")
      }

      // Refresh medicines list
      fetchMedicines()
      alert("Medicine deleted successfully!")
    } catch (error) {
      console.error("Error deleting medicine:", error)
      alert("Failed to delete medicine. Please try again.")
    }
  }

  const handleModalClose = () => {
    setShowModal(false)
    setEditingMedicine(null)
    setFormData({
      name: "",
      description: "",
      price: "",
      image: "",
      category: "",
      stock: "IN_STOCK"
    })
    setImageFile(null)
    setImagePreview("")
  }

  if (loading) {
    return <div>Loading medicines...</div>
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Manage Medicines</h1>
        <div className="flex gap-3">
          <button
            onClick={() => setShowBulkModal(true)}
            className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
          >
            <FileSpreadsheet className="w-5 h-5" />
            <span>Bulk Upload</span>
          </button>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            <Plus className="w-5 h-5" />
            <span>Add Medicine</span>
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Stock</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {medicines.map((med) => (
              <tr key={med.id}>
                <td className="px-6 py-4 whitespace-nowrap">{med.name}</td>
                <td className="px-6 py-4 whitespace-nowrap">{med.category}</td>
                <td className="px-6 py-4 whitespace-nowrap">Rs. {med.price}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    med.stock === "IN_STOCK"
                      ? "bg-green-100 text-green-800"
                      : "bg-red-100 text-red-800"
                  }`}>
                    {med.stock === "IN_STOCK" ? "In Stock" : "Out of Stock"}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <button
                    onClick={() => handleEdit(med)}
                    className="text-blue-600 hover:text-blue-900 mr-3"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(med.id, med.name)}
                    className="text-red-600 hover:text-red-900"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add/Edit Medicine Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b">
              <h2 className="text-2xl font-bold">
                {editingMedicine ? "Edit Medicine" : "Add New Medicine"}
              </h2>
              <button
                onClick={handleModalClose}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={editingMedicine ? handleUpdate : handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Medicine Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter medicine name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description *
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  required
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter medicine description"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Price (Rs.) *
                </label>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleInputChange}
                  required
                  min="0"
                  step="0.01"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter price"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category *
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select category</option>
                  <option value="Pain Relief">Pain Relief</option>
                  <option value="Antibiotics">Antibiotics</option>
                  <option value="Vitamins">Vitamins</option>
                  <option value="Cold & Flu">Cold & Flu</option>
                  <option value="Digestive Health">Digestive Health</option>
                  <option value="Heart & Blood Pressure">Heart & Blood Pressure</option>
                  <option value="Diabetes">Diabetes</option>
                  <option value="Skin Care">Skin Care</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Image
                </label>

                {/* Image Upload */}
                <div className="mb-2">
                  <label className="flex items-center justify-center w-full px-4 py-2 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-500 transition-colors">
                    <Upload className="w-5 h-5 mr-2 text-gray-400" />
                    <span className="text-sm text-gray-600">
                      {imageFile ? imageFile.name : "Upload Image"}
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                    />
                  </label>
                </div>

                {/* Image Preview */}
                {imagePreview && (
                  <div className="mb-2">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-full h-32 object-cover rounded-lg"
                    />
                  </div>
                )}

                {/* OR divider */}
                <div className="flex items-center my-2">
                  <div className="flex-1 border-t border-gray-300"></div>
                  <span className="px-2 text-xs text-gray-500">OR</span>
                  <div className="flex-1 border-t border-gray-300"></div>
                </div>

                {/* Image URL */}
                <input
                  type="url"
                  name="image"
                  value={formData.image}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Or enter image URL"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Stock Status *
                </label>
                <select
                  name="stock"
                  value={formData.stock}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="IN_STOCK">In Stock</option>
                  <option value="OUT_OF_STOCK">Out of Stock</option>
                </select>
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={handleModalClose}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting
                    ? (editingMedicine ? "Updating..." : "Adding...")
                    : (editingMedicine ? "Update Medicine" : "Add Medicine")
                  }
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Bulk Upload Modal */}
      {showBulkModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
            <div className="flex justify-between items-center p-6 border-b">
              <h2 className="text-2xl font-bold">Bulk Upload Medicines</h2>
              <button
                onClick={() => setShowBulkModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-800 mb-2">
                  Upload a CSV file with the following columns:
                </p>
                <code className="text-xs text-blue-900 block mb-2">
                  name, description, price, image, category, stock
                </code>
                <button
                  onClick={downloadCSVTemplate}
                  className="text-sm text-blue-600 hover:text-blue-800 underline"
                >
                  Download CSV Template
                </button>
              </div>

              <div>
                <label className="flex items-center justify-center w-full px-4 py-8 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-500 transition-colors">
                  <div className="text-center">
                    <FileSpreadsheet className="w-12 h-12 mx-auto text-gray-400 mb-2" />
                    <span className="text-sm text-gray-600">
                      Click to select CSV file
                    </span>
                  </div>
                  <input
                    type="file"
                    accept=".csv"
                    onChange={handleBulkUpload}
                    className="hidden"
                    disabled={submitting}
                  />
                </label>
              </div>

              {submitting && (
                <div className="text-center">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  <p className="text-sm text-gray-600 mt-2">Uploading medicines...</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
