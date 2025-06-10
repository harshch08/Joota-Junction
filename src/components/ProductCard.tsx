import React, { useState } from 'react';
import { ShoppingCart } from 'lucide-react';
import { Product } from '../types';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';

// Indian currency formatter
const formatIndianCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

interface ProductCardProps {
  product: Product;
  onProductClick: (product: Product) => void;
  onAuthRequired: () => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, onProductClick, onAuthRequired }) => {
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
      className="bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-2xl hover:scale-[1.03] transition-all duration-300 cursor-pointer group relative overflow-hidden"
      onClick={() => onProductClick(product)}
    >
      <div className="relative">
        <img
          src={product.images[0]}
          alt={product.name}
          className="w-full h-48 object-cover rounded-t-xl bg-gray-100 group-hover:brightness-95 transition duration-300"
        />
        {product.originalPrice && (
          <span className="absolute top-3 left-3 bg-gradient-to-r from-red-500 to-pink-500 text-white px-2 py-1 rounded text-xs font-semibold shadow">
            Sale
          </span>
        )}
        {!hasAvailableStock() && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <span className="bg-red-600 text-white px-3 py-1 rounded text-sm font-semibold">
              Out of Stock
            </span>
          </div>
        )}
      </div>
      <div className="p-4">
        <div className="mb-2">
          <h3 className="font-bold text-lg text-gray-900 group-hover:text-blue-600 transition-colors truncate">
            {product.name}
          </h3>
          <p className="text-xs text-gray-500 mb-1">{product.brand}</p>
        </div>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <span className="text-xl font-bold text-blue-600">{formatIndianCurrency(product.price)}</span>
            {product.originalPrice && (
              <span className="text-sm text-gray-400 line-through">{formatIndianCurrency(product.originalPrice)}</span>
            )}
          </div>
        </div>
        {showSizeSelector ? (
          <div className="mb-3" onClick={(e) => e.stopPropagation()}>
            <p className="text-sm font-medium text-gray-700 mb-2">Select Size:</p>
            <div className="grid grid-cols-3 gap-2">
              {product.sizes && product.sizes.map((sizeObj) => (
                <button
                  key={sizeObj.size}
                  onClick={() => handleSizeSelect(sizeObj.size)}
                  disabled={sizeObj.stock === 0}
                  className={`py-1 px-2 border rounded text-sm transition-colors ${
                    sizeObj.stock === 0
                      ? 'border-gray-200 text-gray-400 bg-gray-100 cursor-not-allowed'
                      : 'border-gray-300 hover:border-blue-500 hover:text-blue-500'
                  }`}
                >
                  {sizeObj.size}
                  {sizeObj.stock === 0 && (
                    <span className="block text-xs text-red-500">Out</span>
                  )}
                </button>
              ))}
            </div>
          </div>
        ) : null}
        
        {/* Add to Cart Button */}
        <button
          onClick={handleAddToCart}
          disabled={!hasAvailableStock()}
          className={`w-full py-2 px-4 rounded-lg font-semibold transition-colors flex items-center justify-center space-x-2 ${
            hasAvailableStock()
              ? 'bg-blue-600 text-white hover:bg-blue-700'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          <ShoppingCart className="h-4 w-4" />
          <span>{hasAvailableStock() ? 'Add to Cart' : 'Out of Stock'}</span>
        </button>
      </div>
    </div>
  );
};

export default ProductCard;
