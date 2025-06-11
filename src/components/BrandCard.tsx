import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Brand } from '../types';
import { ArrowRight } from 'lucide-react';

// Brand to shoe image mapping using local images
const brandShoeImages = {
  'Nike': '/images/shoes/nike shoes.png',
  'Puma': '/images/shoes/puma shoes.png',
  'Adidas': '/images/shoes/adidas shoes.png',
  'New Balance': '/images/shoes/new balance shos.png'
};

// Brand to logo image mapping
const brandLogos = {
  'Nike': '/images/logo/nike.png',
  'Puma': '/images/logo/puma.png',
  'Adidas': '/images/logo/adidas.png',
  'New Balance': '/images/logo/new-balance.png'
};

// Brand to background color mapping
const brandColors = {
  'Nike': '#FF6B6B', // Coral Red
  'Puma': '#4ECDC4', // Turquoise
  'Adidas': '#45B7D1', // Sky Blue
  'New Balance': '#96CEB4' // Sage Green
};

interface BrandCardProps {
  brand: Brand;
}

const BrandCard: React.FC<BrandCardProps> = ({ brand }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    // Scroll to top before navigation
    window.scrollTo(0, 0);
    navigate(`/brand-products/${encodeURIComponent(brand.name)}`);
  };

  return (
    <div
      onClick={handleClick}
      className="group relative rounded-xl overflow-hidden cursor-pointer transition-all duration-300 hover:shadow-2xl hover:scale-[1.02]"
      style={{ 
        aspectRatio: '2.5/1',
        backgroundColor: brandColors[brand.name as keyof typeof brandColors] || '#ffffff'
      }}
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOGMtOS45NDEgMC0xOCA4LjA1OS0xOCAxOCA5Ljk0IDAgMTgtOC4wNTkgMTgtMTgiIGZpbGw9IiMwMDAiLz48L2c+PC9zdmc+')] opacity-20"></div>
      </div>

      {/* Glow Effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

      {/* Content */}
      <div className="relative h-full flex items-center p-4 sm:p-6">
        {/* Left side - Brand Logo */}
        <div className="w-1/3 flex items-center justify-center">
          <img
            src={brandLogos[brand.name as keyof typeof brandLogos]}
            alt={`${brand.name} logo`}
            className="h-16 sm:h-20 object-contain"
          />
        </div>

        {/* Right side - Shoe Image */}
        <div className="w-2/3 h-full flex items-center justify-end">
          <img
            src={brandShoeImages[brand.name as keyof typeof brandShoeImages]}
            alt={`${brand.name} shoe`}
            className="h-[120%] sm:h-[140%] object-contain transform transition-transform duration-500 group-hover:scale-110"
            style={{ marginRight: '-10%' }}
          />
        </div>

        {/* Brand Info Overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6 bg-gradient-to-t from-black/80 via-black/30 to-transparent">
          <div className="flex flex-col items-start">
            <div className="opacity-0 transform translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
              <button className="inline-flex items-center space-x-2 bg-white/10 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm font-medium hover:bg-white/20 transition-all duration-300">
                <span>Explore Collection</span>
                <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Border Glow */}
      <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{
        boxShadow: '0 0 20px rgba(255,255,255,0.1)',
        border: '1px solid rgba(255,255,255,0.1)'
      }}></div>
    </div>
  );
};

export default BrandCard; 