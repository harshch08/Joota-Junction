import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Instagram, Facebook, Twitter, Mail } from 'lucide-react';
import { storeSettingsAPI } from '../services/api';

interface StoreSettings {
  storeName: string;
  aboutStore: string;
  socialMedia: {
    facebook?: string;
    instagram?: string;
    twitter?: string;
    linkedin?: string;
  };
}

const aboutVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8 } },
};

const AboutUs: React.FC = () => {
  const [storeSettings, setStoreSettings] = useState<StoreSettings | null>(null);
  const [loading, setLoading] = useState(true);

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
          aboutStore: 'At JOOTA JUNCTION, we believe shoes are more than just footwear—they\'re a statement of style, comfort, and confidence. Founded with a passion for quality and a love for fashion, our mission is to bring you the best in modern, comfortable, and affordable shoes for every walk of life.',
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

  if (loading) {
    return (
      <section className="w-full bg-gradient-to-br from-white to-gray-50 py-16 px-4 sm:px-8 lg:px-0 flex flex-col items-center">
        <div className="max-w-3xl text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <span className="text-gray-600">Loading...</span>
        </div>
      </section>
    );
  }

  return (
    <motion.section
      className="w-full bg-gradient-to-br from-white to-gray-50 py-16 px-4 sm:px-8 lg:px-0 flex flex-col items-center"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.3 }}
      variants={aboutVariants}
      id="about-us"
    >
      <div className="max-w-3xl text-center">
        <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          About {storeSettings?.storeName || 'JOOTA JUNCTION'}
        </h2>
        <p className="text-lg sm:text-xl text-gray-700 mb-6">
          {storeSettings?.aboutStore || 'At JOOTA JUNCTION, we believe shoes are more than just footwear—they\'re a statement of style, comfort, and confidence. Founded with a passion for quality and a love for fashion, our mission is to bring you the best in modern, comfortable, and affordable shoes for every walk of life.'}
        </p>
        <motion.div
          className="flex flex-col sm:flex-row items-center justify-center gap-6 mb-6"
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3, duration: 0.7 }}
        >
          <div className="bg-white shadow-lg rounded-xl p-6 w-full sm:w-1/2 hover:scale-105 transition-transform duration-300">
            <h3 className="text-xl font-bold text-blue-700 mb-2">Our Story</h3>
            <p className="text-gray-600 text-sm">
              Born in the heart of India, {storeSettings?.storeName || 'JOOTA JUNCTION'} started as a small family business and has grown into a trusted destination for shoe lovers nationwide. We blend tradition with innovation, offering a curated selection for men, women, and kids.
            </p>
          </div>
          <div className="bg-white shadow-lg rounded-xl p-6 w-full sm:w-1/2 hover:scale-105 transition-transform duration-300">
            <h3 className="text-xl font-bold text-purple-700 mb-2">Our Mission</h3>
            <p className="text-gray-600 text-sm">
              To empower every step you take—whether it's a casual stroll, a busy workday, or a special occasion. We're committed to quality, comfort, and customer happiness, every single day.
            </p>
          </div>
        </motion.div>
        <div className="flex justify-center gap-4 mt-6">
          <a 
            href={storeSettings?.socialMedia?.instagram || "https://instagram.com/jootajunction"} 
            target="_blank" 
            rel="noopener noreferrer" 
            className="hover:text-pink-600 transition-colors"
          >
            <Instagram size={28} />
          </a>
          <a 
            href={storeSettings?.socialMedia?.facebook || "https://facebook.com/jootajunction"} 
            target="_blank" 
            rel="noopener noreferrer" 
            className="hover:text-blue-600 transition-colors"
          >
            <Facebook size={28} />
          </a>
          <a 
            href={storeSettings?.socialMedia?.twitter || "https://twitter.com/jootajunction"} 
            target="_blank" 
            rel="noopener noreferrer" 
            className="hover:text-sky-500 transition-colors"
          >
            <Twitter size={28} />
          </a>
          <a href="mailto:admin@jootajunction.com" className="hover:text-rose-500 transition-colors">
            <Mail size={28} />
          </a>
        </div>
      </div>
    </motion.section>
  );
};

export default AboutUs; 