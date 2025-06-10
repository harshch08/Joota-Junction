import React, { useState } from 'react';
import { ShoppingCart } from 'lucide-react';
import { Product } from '../types';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';

const formatIndianCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

interface FeaturedProductCardProps {
  product: Product;
  onProductClick: (product: Product) => void;
  onAuthRequired: () => void;
}

const FeaturedProductCard: React.FC<FeaturedProductCardProps> = ({ product, onProductClick, onAuthRequired }) => {
  const [selectedSize, setSelectedSize] = useState('');
  const [showSizeSelector, setShowSizeSelector] = useState(false);
  const { addToCart } = useCart();
  const { user } = useAuth();

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (!user) {
      console.log('User not logged in, showing auth modal');
      onAuthRequired();
      return;
    }

    if (!selectedSize) {
      console.log('No size selected, showing size selector');
      setShowSizeSelector(true);
      return;
    }

    console.log('Adding to cart:', {
      id: product._id || product.id,
      name: product.name,
      size: selectedSize
    });

    addToCart({
      id: product._id || product.id || '',
      name: product.name,
      price: product.price,
      image: product.images[0],
      size: selectedSize,
      brand: product.brand,
    });

    setSelectedSize('');
    setShowSizeSelector(false);
  };

  const handleSizeSelect = (size: number) => {
    setSelectedSize(size.toString());
    setShowSizeSelector(false);
    
    if (user) {
      addToCart({
        id: product._id || product.id || '',
        name: product.name,
        price: product.price,
        image: product.images[0],
        size: size.toString(),
        brand: product.brand,
      });
    }
  };

  // Helper function to get available sizes with stock
  const getAvailableSizes = () => {
    if (!product.sizes) return [];
    
    return product.sizes.filter(sizeObj => sizeObj.stock > 0);
  };

  // Check if product has any available stock
  const hasAvailableStock = () => {
    return getAvailableSizes().length > 0;
  };

  return (
    <div
      className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transform hover:scale-105 transition-all duration-300 cursor-pointer group relative overflow-hidden"
      onClick={() => onProductClick(product)}
    >
      <div className="relative">
        <img
          src={product.images[0]}
          alt={product.name}
          className="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-300"
        />
        {product.originalPrice && (
          <span className="absolute top-4 left-4 bg-gradient-to-r from-red-500 to-pink-500 text-white px-3 py-1 rounded-full text-sm font-bold shadow-lg">
            Sale
          </span>
        )}
        {!hasAvailableStock() && (
          <div className="absolute inset-0 bg-black bg-opacity-60 flex items-center justify-center">
            <span className="bg-red-600 text-white px-4 py-2 rounded-lg text-lg font-bold">
              Out of Stock
            </span>
          </div>
        )}
      </div>

      <div className="px-6 pb-6 pt-2 text-center">
        <h3 className="font-extrabold text-xl text-gray-900 mb-1 truncate group-hover:text-blue-700 transition-colors">
          {product.name}
        </h3>
        <p className="text-sm text-gray-500 mb-2 font-semibold uppercase tracking-wide">{product.brand}</p>
        <div className="flex items-center justify-center space-x-2 mb-2">
          <span className="text-2xl font-extrabold text-purple-700 drop-shadow-lg">{formatIndianCurrency(product.price)}</span>
          {product.originalPrice && (
            <span className="text-base text-gray-400 line-through">{formatIndianCurrency(product.originalPrice)}</span>
          )}
        </div>
        <div className="flex items-center justify-center gap-2 mt-2">
          <span className="inline-block bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-semibold shadow">{product.category}</span>
        </div>
        
        {/* Add to Cart Button */}
        <button
          onClick={handleAddToCart}
          disabled={!hasAvailableStock()}
          className={`w-full mt-4 py-3 px-4 rounded-xl font-bold transition-all duration-300 flex items-center justify-center space-x-2 ${
            hasAvailableStock()
              ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 transform hover:scale-105'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          <ShoppingCart className="h-5 w-5" />
          <span>{hasAvailableStock() ? 'Add to Cart' : 'Out of Stock'}</span>
        </button>
      </div>
    </div>
  );
};

export default FeaturedProductCard; 