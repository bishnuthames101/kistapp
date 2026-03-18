import Link from 'next/link';
import Image from 'next/image';
import { Clock, FileText, AlertCircle, ArrowRight, ShoppingCart, Star, Package, Shield } from 'lucide-react';
import { labTests, testPackages } from '@/data/labTests';

export const metadata = {
  title: 'Laboratory Tests - KIST Poly Clinic',
  description: 'Get accurate and reliable diagnostic tests with quick turnaround times. Our state-of-the-art laboratory ensures precise results for better healthcare decisions.',
};

export default function LabTestsPage() {
  // Get featured packages
  const featuredPackages = testPackages.slice(0, 6);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl font-bold mb-4">Laboratory Tests & Health Packages</h1>
            <p className="text-xl text-blue-100 mb-8">
              Get accurate and reliable diagnostic tests with quick turnaround times.
              Our state-of-the-art laboratory ensures precise results for better healthcare decisions.
            </p>
            <div className="flex justify-center gap-4">
              <Link
                href="/lab-tests/packages"
                className="bg-white text-blue-600 px-8 py-3 rounded-lg hover:bg-blue-50 transition-all font-semibold flex items-center gap-2 shadow-lg"
              >
                <ShoppingCart className="w-5 h-5" />
                Browse All Packages
              </Link>
              <Link
                href="/lab-tests/all"
                className="bg-blue-500 text-white px-8 py-3 rounded-lg hover:bg-blue-400 transition-all font-semibold flex items-center gap-2"
              >
                View Individual Tests
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        {/* Why Choose Us */}
        <div className="mb-16">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="glass-card p-6 text-center rounded-xl hover:shadow-xl transition-shadow">
              <Shield className="w-12 h-12 text-blue-600 mx-auto mb-4" />
              <h3 className="font-semibold text-gray-800 mb-2">NABL Certified</h3>
              <p className="text-sm text-gray-600">Accredited lab with highest quality standards</p>
            </div>
            <div className="glass-card p-6 text-center rounded-xl hover:shadow-xl transition-shadow">
              <Clock className="w-12 h-12 text-purple-600 mx-auto mb-4" />
              <h3 className="font-semibold text-gray-800 mb-2">Fast Results</h3>
              <p className="text-sm text-gray-600">Quick turnaround time for all tests</p>
            </div>
            <div className="glass-card p-6 text-center rounded-xl hover:shadow-xl transition-shadow">
              <Star className="w-12 h-12 text-yellow-600 mx-auto mb-4" />
              <h3 className="font-semibold text-gray-800 mb-2">Expert Care</h3>
              <p className="text-sm text-gray-600">Experienced professionals and state-of-the-art equipment</p>
            </div>
            <div className="glass-card p-6 text-center rounded-xl hover:shadow-xl transition-shadow">
              <Package className="w-12 h-12 text-green-600 mx-auto mb-4" />
              <h3 className="font-semibold text-gray-800 mb-2">Affordable Packages</h3>
              <p className="text-sm text-gray-600">Comprehensive health packages at great prices</p>
            </div>
          </div>
        </div>

        {/* Featured Health Packages */}
        <div className="mb-16">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Featured Health Packages</h2>
            <p className="text-gray-600">Comprehensive screening packages for complete wellness</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {featuredPackages.map((pkg) => (
              <Link
                key={pkg.id}
                href={`/lab-tests/package/${pkg.id}`}
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
                  {/* Rating */}
                  <div className="absolute top-3 right-3 glass px-2 py-1 rounded-full">
                    <div className="flex items-center gap-1">
                      <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                      <span className="text-xs font-semibold">4.8</span>
                    </div>
                  </div>
                </div>

                {/* Package Content */}
                <div className="p-5">
                  <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors line-clamp-1">
                    {pkg.name}
                  </h3>
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">{pkg.description}</p>

                  {/* Tests Count */}
                  <div className="flex items-center text-sm text-gray-600 mb-3">
                    <FileText className="w-4 h-4 mr-2" />
                    <span>{pkg.tests.length} Tests Included</span>
                  </div>

                  {/* Turnaround Time */}
                  <div className="flex items-center text-sm text-gray-600 mb-4">
                    <Clock className="w-4 h-4 mr-2" />
                    <span>Results in {pkg.turnaroundTime}</span>
                  </div>

                  {/* Price */}
                  <div className="flex justify-between items-center pt-4 border-t">
                    <div>
                      <p className="text-xs text-gray-500">Starting from</p>
                      <p className="text-xl font-bold text-blue-600">₹{pkg.price.toLocaleString()}</p>
                    </div>
                    <div className="glass-button bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-all text-sm font-semibold">
                      Book Now
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          <div className="text-center">
            <Link
              href="/lab-tests/packages"
              className="inline-flex items-center gap-2 bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-all font-semibold shadow-lg"
            >
              View All {testPackages.length} Packages
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>

        {/* Popular Individual Tests */}
        <div>
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Popular Individual Tests</h2>
            <p className="text-gray-600">Get specific diagnostic tests as needed</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {labTests.slice(0, 4).map((test) => (
              <div key={test.id} className="glass-card p-6 rounded-xl hover:shadow-xl transition-all duration-300">
                <h3 className="text-lg font-semibold text-gray-800 mb-2">{test.name}</h3>
                <p className="text-gray-600 text-sm mb-4 line-clamp-2">{test.description}</p>
                <div className="space-y-2 mb-4">
                  <div className="flex items-center text-sm text-gray-600">
                    <Clock className="w-4 h-4 mr-2 flex-shrink-0" />
                    {test.turnaroundTime}
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <AlertCircle className="w-4 h-4 mr-2 flex-shrink-0" />
                    {test.requirements}
                  </div>
                </div>
                <div className="flex justify-between items-center pt-4 border-t">
                  <span className="text-blue-600 font-bold text-lg">₹{test.price}</span>
                  <Link
                    href={`/lab-tests/test/${test.id}`}
                    className="glass-button bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-all text-sm font-semibold"
                  >
                    Book Now
                  </Link>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center">
            <Link
              href="/lab-tests/all"
              className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 font-semibold"
            >
              View All Tests
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
