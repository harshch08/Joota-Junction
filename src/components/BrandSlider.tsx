import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { brandsAPI } from '../services/api';
import { Brand } from '../types';
import ScrollSection from './ScrollSection';

// Brand to logo image mapping
const brandLogos = {
  'Nike': '/images/logo/nike.png',
  'Puma': '/images/logo/puma.png',
  'Adidas': '/images/logo/adidas.png',
  'New Balance': '/images/logo/new-balance.png',
  'Louis Vuitton': '/images/logo/louis-vuitton.png',
  'Skechers': '/images/logo/skechers.png',
  'Crocs': '/images/logo/crocs.png',
  'Asics': '/images/logo/asics.png'
};

const BrandSlider: React.FC = () => {
  const navigate = useNavigate();

  const { data: brands = [], isLoading } = useQuery<Brand[]>({
    queryKey: ['brands'],
    queryFn: () => brandsAPI.getAllBrands()
  });

  const handleBrandClick = (brand: Brand) => {
    // Scroll to top before navigation
    window.scrollTo(0, 0);
    navigate(`/brand-products/${encodeURIComponent(brand.name)}`);
  };

  if (isLoading) {
    return (
      <div className="w-full bg-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <ScrollSection className="w-full bg-white py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4 relative inline-block">
            Our Brands
            <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-24 h-1 bg-gradient-to-r from-indigo-600 to-violet-600 rounded-full"></div>
          </h2>
          <p className="text-gray-600 mt-4 max-w-2xl mx-auto">Experience excellence with our carefully selected lineup of premium footwear brands.</p>
        </div>
        <div className="relative overflow-hidden">
          <div className="flex animate-marquee whitespace-nowrap">
            {[...brands, ...brands].map((brand, index) => (
              <div
                key={`${brand._id}-${index}`}
                onClick={() => handleBrandClick(brand)}
                className="flex-shrink-0 w-48 h-24 mx-4 cursor-pointer transform transition-transform hover:scale-105"
              >
                <img
                  src={brandLogos[brand.name as keyof typeof brandLogos] || brand.logo}
                  alt={brand.name}
                  className="w-full h-full object-contain filter grayscale hover:grayscale-0 transition-all duration-300"
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </ScrollSection>
  );
};

export default BrandSlider; 