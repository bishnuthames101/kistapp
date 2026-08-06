import { Phone, Mail, MapPin, Clock, Facebook, Instagram} from 'lucide-react';
import { FaTiktok } from 'react-icons/fa';
import { siteConfig } from '@/lib/seo';

const SOCIAL_ICONS: Record<string, React.ComponentType<{ size?: number }>> = {
  Facebook,
  Instagram,
  TikTok: FaTiktok,
};

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* About */}
          <div>
            <h3 className="text-xl font-bold text-white mb-4">Kist Poly Clinic</h3>
            <p className="mb-4">Providing quality healthcare services with modern facilities and experienced professionals.</p>
            <div className="flex space-x-4">
              {siteConfig.social.map(({ name, url }) => {
                const Icon = SOCIAL_ICONS[name];
                return (
                  <a
                    key={name}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`Kist Poly Clinic on ${name}`}
                    className="hover:text-blue-400"
                  >
                    <Icon size={20} />
                  </a>
                );
              })}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-xl font-bold text-white mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li><a href="/about" className="hover:text-blue-400">About Us</a></li>
              <li><a href="/doctors" className="hover:text-blue-400">Our Doctors</a></li>
              <li><a href="/services" className="hover:text-blue-400">Book Appointment</a></li>
              <li><a href="/lab-tests" className="hover:text-blue-400">Book Lab Test</a></li>
              <li><a href="/epharmacy" className="hover:text-blue-400">Purchase Pharmacy Items</a></li>
              <li><a href="/contact" className="hover:text-blue-400">Contact Us</a></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-xl font-bold text-white mb-4">Contact Info</h3>
            <ul className="space-y-3">
              <li className="flex items-center">
                <Phone size={16} className="mr-2" />
                +977-01-5202097
              </li>
              <li className="flex items-center">
                <Mail size={16} className="mr-2" />
                kistpolyclinic@gmail.com
              </li>
              <li className="flex items-start">
                <MapPin size={16} className="mr-2 mt-1" />
                <span>
                  {siteConfig.address.area}, {siteConfig.address.street}
                  <br />
                  {siteConfig.address.locality} {siteConfig.address.postalCode}, Nepal
                  <br />
                  <span className="text-sm text-gray-400">
                    {siteConfig.address.landmark}
                  </span>
                </span>
              </li>
            </ul>
          </div>

          {/* Working Hours */}
          <div>
            <h3 className="text-xl font-bold text-white mb-4">Working Hours</h3>
            <ul className="space-y-2">
              <li className="flex items-center">
                <Clock size={16} className="mr-2" />
                Sun - Sat: 7:00 AM - 8:00 PM
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-12 pt-8 text-center">
          <p>&copy; {new Date().getFullYear()} Kist Poly Clinic. All rights reserved.</p>
          {/* Admin link */}
          <div className="mt-4">
            <a
              href="/admin-login"
              className="inline-block px-4 py-2 text-sm text-gray-400 hover:text-white hover:bg-gray-800 rounded transition-colors duration-200"
              title="Admin Login"
            >
              Admin Login
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
