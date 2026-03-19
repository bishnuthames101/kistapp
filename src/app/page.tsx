import Link from 'next/link';
import Image from 'next/image';
import {
  Home as HomeIcon,
  Pill,
  FlaskRound as Flask,
  Phone,
  ChevronRight,
  Clock,
  Shield,
  Award,
  Users,
  Star,
  CheckCircle,
  MapPin,
  Calendar,
  Microscope,
  Stethoscope,
  Heart,
  TrendingUp,
  Package,
  Truck,
  HeartPulse,
  BadgeCheck,
  ArrowRight
} from 'lucide-react';
import { services } from '@/data/services';
import { testPackages } from '@/data/labTests';

export default function HomePage() {
  // Get top 6 services
  const featuredServices = services.slice(0, 6);

  // Get featured test packages (6 packages)
  const featuredTests = testPackages.slice(0, 6);

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative py-20 lg:py-32 bg-gradient-to-br from-blue-600 via-blue-700 to-purple-700 overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1538108149393-fbbd81895907?auto=format&fit=crop&q=80')] opacity-10 bg-cover bg-center"></div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="flex flex-col lg:flex-row items-center gap-12">
            <div className="lg:w-1/2 text-white">
              <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md px-4 py-2 rounded-full mb-6">
                <BadgeCheck className="w-4 h-4" />
                <span className="text-sm font-semibold">Trusted Healthcare Since 2067</span>
              </div>

              <h1 className="text-4xl lg:text-6xl font-bold mb-6 leading-tight">
                Your Health Is Our{' '}
                <span className="text-yellow-300">Top Priority</span>
              </h1>

              <p className="text-xl text-blue-100 mb-8 leading-relaxed">
                Experience comprehensive healthcare with modern facilities, expert doctors, and
                convenient services. Book appointments, order medicines, and get lab tests - all in one place.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 mb-8">
                <Link
                  href="/services"
                  className="bg-white text-blue-600 px-8 py-4 rounded-lg hover:bg-blue-50 transition-all font-semibold flex items-center justify-center gap-2 shadow-xl hover:shadow-2xl transform hover:-translate-y-1"
                >
                  <Calendar className="w-5 h-5" />
                  Book Appointment
                </Link>
                <Link
                  href="/lab-tests"
                  className="bg-blue-500 text-white px-8 py-4 rounded-lg hover:bg-blue-400 transition-all font-semibold flex items-center justify-center gap-2 shadow-xl"
                >
                  <Microscope className="w-5 h-5" />
                  Book Lab Test
                </Link>
                <Link
                  href="/epharmacy"
                  className="bg-yellow-400 text-blue-900 px-8 py-4 rounded-lg hover:bg-yellow-300 transition-all font-semibold flex items-center justify-center gap-2 shadow-xl"
                >
                  <Pill className="w-5 h-5" />
                  Buy Medicine
                </Link>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-yellow-300 mb-1">15,000+</div>
                  <div className="text-sm text-blue-200">Happy Patients</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-yellow-300 mb-1">50+</div>
                  <div className="text-sm text-blue-200">Expert Doctors</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-yellow-300 mb-1">12+</div>
                  <div className="text-sm text-blue-200">Services</div>
                </div>
              </div>
            </div>

            <div className="lg:w-1/2">
              <div className="relative">
                <div className="absolute -inset-4 bg-gradient-to-r from-yellow-400 to-pink-400 rounded-3xl blur-2xl opacity-30"></div>
                <img
                  src="https://images.unsplash.com/photo-1631217868264-e5b90bb7e133?auto=format&fit=crop&q=80"
                  alt="Doctor consulting with patient"
                  className="relative rounded-2xl shadow-2xl w-full"
                />
                {/* Floating Cards */}
                <div className="absolute -bottom-6 -left-6 bg-white p-4 rounded-xl shadow-2xl">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                      <CheckCircle className="w-6 h-6 text-green-600" />
                    </div>
                    <div>
                      <div className="font-bold text-gray-900">NABL Certified</div>
                      <div className="text-sm text-gray-600">Quality Assured</div>
                    </div>
                  </div>
                </div>
                <div className="absolute -top-6 -right-6 bg-white p-4 rounded-xl shadow-2xl">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <Clock className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <div className="font-bold text-gray-900">Open Daily</div>
                      <div className="text-sm text-gray-600">8 AM - 8 PM</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Indicators */}
      <section className="py-12 bg-white border-b">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Shield className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="font-bold text-gray-900 mb-1">NABL Certified Lab</h3>
              <p className="text-sm text-gray-600">Highest Quality Standards</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Award className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="font-bold text-gray-900 mb-1">Experienced Team</h3>
              <p className="text-sm text-gray-600">10+ Years in Healthcare</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Users className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="font-bold text-gray-900 mb-1">15,000+ Patients</h3>
              <p className="text-sm text-gray-600">Trusted by Thousands</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <MapPin className="w-8 h-8 text-orange-600" />
              </div>
              <h3 className="font-bold text-gray-900 mb-1">Central Location</h3>
              <p className="text-sm text-gray-600">Balkumari, Lalitpur</p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Services */}
      <section className="py-20 bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-blue-100 px-4 py-2 rounded-full mb-4">
              <Stethoscope className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-semibold text-blue-600">Our Services</span>
            </div>
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Comprehensive Healthcare Services
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              From routine check-ups to specialized treatments, we offer a complete range of medical services
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-8">
            {featuredServices.map((service) => {
              const IconComponent = service.icon;
              return (
                <Link
                  key={service.id}
                  href={`/services/${service.id}`}
                  className="group bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100"
                >
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-purple-100 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                    <IconComponent className="w-8 h-8 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors">
                    {service.name}
                  </h3>
                  <p className="text-gray-600 mb-6 line-clamp-2">
                    {service.description}
                  </p>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500">Starting from</p>
                      <p className="text-2xl font-bold text-blue-600">₹{service.price}</p>
                    </div>
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center group-hover:bg-blue-600 transition-colors">
                      <ArrowRight className="w-5 h-5 text-blue-600 group-hover:text-white" />
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>

          <div className="text-center">
            <Link
              href="/services"
              className="inline-flex items-center gap-2 bg-blue-600 text-white px-8 py-4 rounded-lg hover:bg-blue-700 transition-all font-semibold shadow-lg"
            >
              View All Services
              <ChevronRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Test Packages */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-green-100 px-4 py-2 rounded-full mb-4">
              <Flask className="w-4 h-4 text-green-600" />
              <span className="text-sm font-semibold text-green-600">Laboratory Services</span>
            </div>
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Popular Health Test Packages
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Comprehensive health screening packages at affordable prices
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-8">
            {featuredTests.map((pkg) => (
              <Link
                key={pkg.id}
                href={`/lab-tests/package/${pkg.id}`}
                className="group bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100"
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
                    <span className="bg-white/90 backdrop-blur-sm px-3 py-1 text-xs font-semibold text-blue-700 rounded-full shadow-md">
                      {pkg.category}
                    </span>
                  </div>
                  {/* Rating */}
                  <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-full shadow-md">
                    <div className="flex items-center gap-1">
                      <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                      <span className="text-xs font-semibold">4.8</span>
                    </div>
                  </div>
                </div>

                {/* Package Content */}
                <div className="p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors line-clamp-1">
                    {pkg.name}
                  </h3>
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">{pkg.description}</p>

                  {/* Tests Count */}
                  <div className="flex items-center text-sm text-gray-600 mb-3">
                    <Package className="w-4 h-4 mr-2" />
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
                      <p className="text-2xl font-bold text-blue-600">₹{pkg.price.toLocaleString()}</p>
                    </div>
                    <div className="bg-blue-600 text-white px-4 py-2 rounded-lg group-hover:bg-blue-700 transition-all text-sm font-semibold">
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
              className="inline-flex items-center gap-2 bg-green-600 text-white px-8 py-4 rounded-lg hover:bg-green-700 transition-all font-semibold shadow-lg"
            >
              View All Test Packages
              <ChevronRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-20 bg-gradient-to-br from-blue-600 to-purple-700 text-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Why Choose KIST Poly Clinic?</h2>
            <p className="text-xl text-blue-100 max-w-3xl mx-auto">
              We combine medical excellence with compassionate care to deliver the best healthcare experience
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20">
              <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center mb-6">
                <HeartPulse className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-4">Expert Medical Team</h3>
              <p className="text-blue-100 leading-relaxed">
                Our team of highly qualified doctors and specialists with 10+ years of experience provide world-class care.
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20">
              <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center mb-6">
                <Shield className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-4">NABL Certified Lab</h3>
              <p className="text-blue-100 leading-relaxed">
                State-of-the-art laboratory with NABL certification ensuring accurate and reliable test results.
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20">
              <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center mb-6">
                <Clock className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-4">Quick Turnaround</h3>
              <p className="text-blue-100 leading-relaxed">
                Fast and efficient service with same-day appointments and quick lab test results.
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20">
              <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center mb-6">
                <Truck className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-4">Home Services</h3>
              <p className="text-blue-100 leading-relaxed">
                Doctor home visits and home sample collection for your convenience and comfort.
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20">
              <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center mb-6">
                <Pill className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-4">Online Pharmacy</h3>
              <p className="text-blue-100 leading-relaxed">
                Order medicines online with doorstep delivery and verified prescriptions.
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20">
              <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center mb-6">
                <TrendingUp className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-4">Affordable Pricing</h3>
              <p className="text-blue-100 leading-relaxed">
                Quality healthcare at competitive prices with transparent billing and no hidden charges.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-yellow-100 px-4 py-2 rounded-full mb-4">
              <Star className="w-4 h-4 text-yellow-600 fill-yellow-600" />
              <span className="text-sm font-semibold text-yellow-700">Patient Reviews</span>
            </div>
            <h2 className="text-4xl font-bold text-gray-900 mb-4">What Our Patients Say</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Read testimonials from our satisfied patients
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white rounded-2xl p-8 shadow-lg">
              <div className="flex gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <p className="text-gray-700 mb-6 leading-relaxed">
                "Excellent service and very professional staff. The doctors are knowledgeable and caring. I highly recommend KIST Poly Clinic for all your healthcare needs."
              </p>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <div className="font-bold text-gray-900">Ramesh Sharma</div>
                  <div className="text-sm text-gray-600">Patient</div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-lg">
              <div className="flex gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <p className="text-gray-700 mb-6 leading-relaxed">
                "The lab test results were quick and accurate. The staff explained everything clearly. Very satisfied with the service and affordable pricing."
              </p>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                  <Users className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <div className="font-bold text-gray-900">Sita Poudel</div>
                  <div className="text-sm text-gray-600">Patient</div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-lg">
              <div className="flex gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <p className="text-gray-700 mb-6 leading-relaxed">
                "Great experience with the home visit service. Dr. Arbind was very thorough and professional. Highly recommended for elderly patients."
              </p>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <Users className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <div className="font-bold text-gray-900">Krishna Adhikari</div>
                  <div className="text-sm text-gray-600">Patient</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center text-white">
            <h2 className="text-4xl lg:text-5xl font-bold mb-6">
              Ready to Take Care of Your Health?
            </h2>
            <p className="text-xl text-blue-100 mb-10">
              Book an appointment today and experience quality healthcare with compassionate service
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/services"
                className="bg-white text-blue-600 px-10 py-5 rounded-lg hover:bg-blue-50 transition-all font-bold text-lg shadow-2xl flex items-center justify-center gap-2"
              >
                <Calendar className="w-6 h-6" />
                Book Appointment Now
              </Link>
              <a
                href="tel:015202097"
                className="bg-blue-500 text-white px-10 py-5 rounded-lg hover:bg-blue-400 transition-all font-bold text-lg shadow-xl flex items-center justify-center gap-2"
              >
                <Phone className="w-6 h-6" />
                Call: 01-5202097
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Links */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Link
              href="/services"
              className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-xl hover:shadow-lg transition-all group"
            >
              <Stethoscope className="w-10 h-10 text-blue-600 mb-4 group-hover:scale-110 transition-transform" />
              <h3 className="font-bold text-gray-900 mb-2">Medical Services</h3>
              <p className="text-sm text-gray-600">Consult with specialist doctors</p>
            </Link>

            <Link
              href="/lab-tests"
              className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-xl hover:shadow-lg transition-all group"
            >
              <Flask className="w-10 h-10 text-green-600 mb-4 group-hover:scale-110 transition-transform" />
              <h3 className="font-bold text-gray-900 mb-2">Lab Tests</h3>
              <p className="text-sm text-gray-600">Book comprehensive health packages</p>
            </Link>

            <Link
              href="/epharmacy"
              className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-xl hover:shadow-lg transition-all group"
            >
              <Pill className="w-10 h-10 text-purple-600 mb-4 group-hover:scale-110 transition-transform" />
              <h3 className="font-bold text-gray-900 mb-2">Online Pharmacy</h3>
              <p className="text-sm text-gray-600">Order medicines with delivery</p>
            </Link>

            <Link
              href="/contact"
              className="bg-gradient-to-br from-orange-50 to-orange-100 p-6 rounded-xl hover:shadow-lg transition-all group"
            >
              <MapPin className="w-10 h-10 text-orange-600 mb-4 group-hover:scale-110 transition-transform" />
              <h3 className="font-bold text-gray-900 mb-2">Visit Us</h3>
              <p className="text-sm text-gray-600">Balkumari, Lalitpur</p>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
