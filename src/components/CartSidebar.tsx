import React from 'react';
import { X, Plus, Minus, Trash2, ShoppingBag, ArrowRight } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { useNavigate } from 'react-router-dom';
import { formatCurrency } from '../lib/utils';

interface CartSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const CartSidebar: React.FC<CartSidebarProps> = ({ isOpen, onClose }) => {
  const { items, updateQuantity, removeFromCart, getTotalPrice } = useCart();
  const navigate = useNavigate();

  const handleCheckout = () => {
    onClose();
    navigate('/checkout');
  };

  const handleContinueShopping = () => {
    onClose();
    navigate('/');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div className="absolute inset-0 bg-black bg-opacity-50" onClick={onClose} />
      
      <div className="absolute right-0 top-0 h-full w-full max-w-md bg-white shadow-xl">
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Shopping Cart</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-full hover:bg-gray-100"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Cart Items */}
          <div className="flex-1 overflow-y-auto p-4">
            {items.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full py-12">
                {/* Empty Cart Icon */}
                <div className="relative mb-6">
                  <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                    <ShoppingBag className="h-12 w-12 text-gray-400" />
                  </div>
                  <div className="absolute -top-2 -right-2 w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                    <span className="text-xs font-medium text-gray-600">0</span>
                  </div>
                </div>
                
                {/* Empty State Text */}
                <div className="text-center max-w-sm">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Your cart is empty</h3>
                  <p className="text-gray-500 mb-6 leading-relaxed">
                    Looks like you haven't added any items to your cart yet. Start shopping to discover amazing shoes!
                  </p>
                  
                  {/* Continue Shopping Button */}
                  <button
                    onClick={handleContinueShopping}
                    className="inline-flex items-center space-x-2 bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-all duration-200 transform hover:scale-105 shadow-md hover:shadow-lg"
                  >
                    <span>Continue Shopping</span>
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
                
                {/* Decorative Elements */}
                <div className="mt-8 flex space-x-2">
                  <div className="w-2 h-2 bg-blue-200 rounded-full animate-pulse"></div>
                  <div className="w-2 h-2 bg-blue-300 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                  <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {items.map((item) => (
                  <div key={`${item.id}-${item.size}`} className="flex items-center space-x-3 bg-gray-50 p-3 rounded-lg hover:bg-gray-100 transition-colors">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-16 h-16 object-cover rounded-lg shadow-sm"
                    />
                    
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-medium text-gray-900 truncate">{item.name}</h3>
                      <p className="text-sm text-gray-600">{item.brand}</p>
                      <p className="text-sm text-gray-600">Size: {item.size}</p>
                      <p className="text-sm font-medium text-gray-900">{formatCurrency(item.price)}</p>
                    </div>

                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => updateQuantity(item.id, item.size, item.quantity - 1)}
                        className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-200 rounded transition-colors"
                      >
                        <Minus className="h-4 w-4" />
                      </button>
                      
                      <span className="text-sm font-medium w-8 text-center">{item.quantity}</span>
                      
                      <button
                        onClick={() => updateQuantity(item.id, item.size, item.quantity + 1)}
                        className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-200 rounded transition-colors"
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                      
                      <button
                        onClick={() => removeFromCart(item.id, item.size)}
                        className="p-1 text-red-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors ml-2"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          {items.length > 0 && (
            <div className="border-t border-gray-200 p-4 space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-lg font-semibold text-gray-900">Total:</span>
                <span className="text-lg font-bold text-gray-900">{formatCurrency(getTotalPrice())}</span>
              </div>
              
              <button
                onClick={handleCheckout}
                className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-all duration-200 transform hover:scale-105 shadow-md hover:shadow-lg"
              >
                Proceed to Checkout
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CartSidebar;
