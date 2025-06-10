import React, { useState, useEffect } from 'react';
import { Instagram, Facebook, Twitter, Mail, Phone, MapPin, ArrowUp } from 'lucide-react';
import { storeSettingsAPI } from '../services/api';

interface StoreSettings {
  storeName: string;
  contactEmails: Array<{
    email: string;
    label: string;
    isActive: boolean;
  }>;
  phoneNumbers: Array<{
    number: string;
    label: string;
    isActive: boolean;
  }>;
  addresses: Array<{
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
    label: string;
    isActive: boolean;
  }>;
  socialMedia: {
    facebook?: string;
    instagram?: string;
    twitter?: string;
    linkedin?: string;
  };
}

const Footer: React.FC = () => {
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [storeSettings, setStoreSettings] = useState<StoreSettings | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const handleScroll = () => {
      // Show button when user scrolls down more than 300px
      const scrollTop = window.scrollY;
      setShowScrollTop(scrollTop > 300);
    };

    window.addEventListener('scroll', handleScroll);
    
    // Cleanup event listener
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const fetchStoreSettings = async () => {
      try {
        const settings = await storeSettingsAPI.getStoreSettings();
        setStoreSettings(settings);
      } catch (error) {
        console.error('Error fetching store settings:', error);
        // Use default values if API fails
        setStoreSettings({
          storeName: 'JOOTA JUNCTION',
          contactEmails: [{ email: 'admin@jootajunction.com', label: 'General', isActive: true }],
          phoneNumbers: [{ number: '+91 98765 43210', label: 'General', isActive: true }],
          addresses: [{
            street: '123 Fashion Street',
            city: 'Mumbai',
            state: 'Maharashtra',
            zipCode: '400001',
            country: 'India',
            label: 'Main Office',
            isActive: true
          }],
          socialMedia: {
            facebook: 'https://facebook.com/jootajunction',
            instagram: 'https://instagram.com/jootajunction',
            twitter: 'https://twitter.com/jootajunction',
            linkedin: 'https://linkedin.com/company/jootajunction'
          }
        });
      } finally {
        setLoading(false);
      }
    };

    fetchStoreSettings();
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  if (loading) {
    return (
      <footer className="w-full bg-gradient-to-r from-gray-900 to-gray-800 text-white py-12 px-4 mt-0 relative">
        <div className="max-w-7xl mx-auto flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
          <span className="ml-2">Loading...</span>
        </div>
      </footer>
    );
  }

  const primaryEmail = storeSettings?.contactEmails[0]?.email || 'admin@jootajunction.com';
  const primaryPhone = storeSettings?.phoneNumbers[0]?.number || '+91 98765 43210';
  const primaryAddress = storeSettings?.addresses[0];

  return (
    <footer className="w-full bg-gradient-to-r from-gray-900 to-gray-800 text-white py-12 px-4 mt-0 relative">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
        {/* Brand & Social */}
        <div className="flex flex-col items-center md:items-start gap-4">
          <span className="text-2xl font-extrabold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
            {storeSettings?.storeName || 'JOOTA JUNCTION'}
          </span>
          <div className="flex gap-4 mt-2">
            <a 
              href={storeSettings?.socialMedia?.instagram || "https://instagram.com/jootajunction"}
              target="_blank" 
              rel="noopener noreferrer" 
              className="p-2 rounded-full bg-gray-700 hover:bg-pink-500 hover:scale-110 transition-all duration-300 group"
            >
              <Instagram size={20} className="group-hover:text-white" />
            </a>
            <a 
              href={storeSettings?.socialMedia?.facebook || "https://facebook.com/jootajunction"}
              target="_blank" 
              rel="noopener noreferrer" 
              className="p-2 rounded-full bg-gray-700 hover:bg-blue-600 hover:scale-110 transition-all duration-300 group"
            >
              <Facebook size={20} className="group-hover:text-white" />
            </a>
            <a 
              href={storeSettings?.socialMedia?.twitter || "https://twitter.com/jootajunction"}
              target="_blank" 
              rel="noopener noreferrer" 
              className="p-2 rounded-full bg-gray-700 hover:bg-sky-500 hover:scale-110 transition-all duration-300 group"
            >
              <Twitter size={20} className="group-hover:text-white" />
            </a>
            <a 
              href={`mailto:${primaryEmail}`}
              className="p-2 rounded-full bg-gray-700 hover:bg-rose-500 hover:scale-110 transition-all duration-300 group"
            >
              <Mail size={20} className="group-hover:text-white" />
            </a>
          </div>
        </div>
        
        {/* Contact Info */}
        <div className="flex flex-col items-center md:items-end gap-4">
          <span className="font-semibold text-lg mb-2 text-blue-300">Contact</span>
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2 text-gray-300 text-sm hover:text-white transition-colors">
              <Mail size={16} className="text-blue-400" />
              <span>{primaryEmail}</span>
            </div>
            <div className="flex items-center gap-2 text-gray-300 text-sm hover:text-white transition-colors">
              <Phone size={16} className="text-green-400" />
              <span>{primaryPhone}</span>
            </div>
            {primaryAddress && (
              <div className="flex items-center gap-2 text-gray-300 text-sm hover:text-white transition-colors">
                <MapPin size={16} className="text-red-400" />
                <span>{primaryAddress.street}, {primaryAddress.city}</span>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Go to Top Button */}
      <button
        onClick={scrollToTop}
        className={`fixed bottom-6 right-6 p-3 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white shadow-lg hover:shadow-xl hover:scale-110 transition-all duration-300 group z-50 ${
          showScrollTop 
            ? 'opacity-100 translate-y-0' 
            : 'opacity-0 translate-y-10 pointer-events-none'
        }`}
        aria-label="Go to top"
      >
        <ArrowUp size={24} className="group-hover:-translate-y-1 transition-transform" />
      </button>
      
      <div className="mt-10 text-center text-xs text-gray-400 border-t border-gray-700 pt-6">
        &copy; {new Date().getFullYear()} {storeSettings?.storeName || 'JOOTA JUNCTION'}. All rights reserved.
      </div>
    </footer>
  );
};

export default Footer; 