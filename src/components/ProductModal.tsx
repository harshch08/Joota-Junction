import React, { useState } from 'react';
import { X, ShoppingCart, Star } from 'lucide-react';
import { Product } from '../types';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { formatCurrency } from '../lib/utils';

interface ProductModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  onAuthRequired: () => void;
}

interface SizeObject {
  size: number;
  stock: number;
}

const ProductModal: React.FC<ProductModalProps> = ({ product, isOpen, onClose, onAuthRequired }) => {
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState<number | null>(null);
  const [quantity, setQuantity] = useState(1);
  const { addToCart } = useCart();
  const { user } = useAuth();

  if (!isOpen || !product) return null;

  // Get the correct ID field (either id or _id)
  const productId = product.id || product._id;
  
  if (!productId) {
    console.error('Product ID is missing:', product);
    return null;
  }

  const handleAddToCart = () => {
    if (!user) {
      onAuthRequired();
      return;
    }

    if (!selectedSize) {
      alert('Please select a size');
      return;
    }

    // Check if selected size has enough stock
    const sizeObj = product.sizes?.find(s => s.size === selectedSize);
    if (!sizeObj || sizeObj.stock < quantity) {
      alert(`Sorry, only ${sizeObj?.stock || 0} items available in size ${selectedSize}`);
      return;
    }

    addToCart({
      id: productId,
      name: product.name,
      price: product.price,
      image: product.images[0],
      size: selectedSize.toString(),
      brand: product.brand,
      quantity
    });

    onClose();
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

  // Get stock for selected size
  const getSelectedSizeStock = () => {
    if (!selectedSize || !product.sizes) return 0;
    const sizeObj = product.sizes.find(s => s.size === selectedSize);
    return sizeObj?.stock || 0;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-900">Product Details</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Product Images */}
            <div className="space-y-4">
              <div className="aspect-square overflow-hidden rounded-lg">
                <img
                  src={product.images[selectedImage]}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              </div>
              
              {product.images.length > 1 && (
                <div className="flex space-x-2">
                  {product.images.map((image, index) => (
                    <button
                      key={`${productId}-image-${index}`}
                      onClick={() => setSelectedImage(index)}
                      className={`w-20 h-20 rounded-lg overflow-hidden border-2 ${
                        selectedImage === index ? 'border-blue-500' : 'border-gray-200'
                      }`}
                    >
                      <img
                        src={image}
                        alt={`${product.name} ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Product Info */}
            <div className="space-y-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">{product.name}</h1>
                <p className="text-lg text-gray-600 mt-1">{product.brand}</p>
                
                <div className="flex items-center space-x-2 mt-2"></div>
              </div>

              <div className="flex items-center space-x-3">
                <span className="text-3xl font-bold text-gray-900">{formatCurrency(product.price)}</span>
                {product.originalPrice && (
                  <span className="text-xl text-gray-500 line-through">{formatCurrency(product.originalPrice)}</span>
                )}
                {product.originalPrice && (
                  <div className="text-green-600 font-medium">
                    Save {formatCurrency(product.originalPrice - product.price)}
                  </div>
                )}
              </div>

              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-3">Size</h3>
                <div className="grid grid-cols-3 gap-2">
                  {product.sizes && product.sizes.map((sizeObj) => (
                    <button
                      key={`${productId}-size-${sizeObj.size}`}
                      onClick={() => setSelectedSize(sizeObj.size)}
                      disabled={sizeObj.stock === 0}
                      className={`py-3 px-4 border rounded-lg text-center font-medium transition-colors ${
                        selectedSize === sizeObj.size
                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : sizeObj.stock === 0
                          ? 'border-gray-200 text-gray-400 bg-gray-100 cursor-not-allowed'
                          : 'border-gray-300 hover:border-gray-400'
                      }`}
                    >
                      <div>
                        <div>{sizeObj.size}</div>
                        {sizeObj.stock === 0 ? (
                          <div className="text-xs text-red-500">Out of Stock</div>
                        ) : (
                          <div className="text-xs text-gray-600">{sizeObj.stock} left</div>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-3">Quantity</h3>
                <div className="flex items-center space-x-4">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={!selectedSize || getSelectedSizeStock() < 2}
                    className="p-2 border rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    -
                  </button>
                  <span className="text-lg font-medium">{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    disabled={!selectedSize || quantity >= getSelectedSizeStock()}
                    className="p-2 border rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    +
                  </button>
                </div>
                {selectedSize && (
                  <p className="text-sm text-gray-600 mt-2">
                    {getSelectedSizeStock()} items available in size {selectedSize}
                  </p>
                )}
              </div>

              <div className="space-y-3">
                <button
                  onClick={handleAddToCart}
                  disabled={!hasAvailableStock() || !selectedSize || quantity > getSelectedSizeStock()}
                  className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ShoppingCart className="h-5 w-5" />
                  <span>
                    {!hasAvailableStock() 
                      ? 'Out of Stock' 
                      : !selectedSize 
                      ? 'Select Size' 
                      : quantity > getSelectedSizeStock()
                      ? 'Not Enough Stock'
                      : 'Add to Cart'
                    }
                  </span>
                </button>
              </div>

              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-3">Description</h3>
                <p className="text-gray-700 leading-relaxed">{product.description}</p>
              </div>

              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-3">Features</h3>
                <ul className="space-y-2">
                  {(product.features || []).map((feature, index) => (
                    <li key={`${productId}-feature-${index}`} className="flex items-center text-gray-700">
                      <span className="w-2 h-2 bg-blue-600 rounded-full mr-3"></span>
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductModal;
