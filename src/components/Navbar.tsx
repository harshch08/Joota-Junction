import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, Heart, User } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import AuthModal from './AuthModal';

const Navbar = () => {
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const { user, logout } = useAuth();
  const { items } = useCart();

  const handleLogout = () => {
    logout();
    setShowDropdown(false);
  };

  return (
    <nav className="bg-white shadow-md fixed w-full top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="text-2xl font-bold text-blue-600">
            Sole Store
          </Link>

          <div className="flex items-center space-x-4">
            {user ? (
              <div className="relative inline-block text-left">
                <button 
                  type="button"
                  onClick={() => setShowDropdown(!showDropdown)}
                  className="inline-flex items-center justify-center w-full px-4 py-2 text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <span className="ml-2">{user.name}</span>
                </button>

                {showDropdown && (
                  <div 
                    className="origin-top-right absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none"
                    role="menu"
                    aria-orientation="vertical"
                    aria-labelledby="menu-button"
                    tabIndex={-1}
                    style={{
                      position: 'absolute',
                      zIndex: 9999,
                      top: '100%',
                      right: 0,
                      marginTop: '0.5rem',
                      backgroundColor: 'white',
                      borderRadius: '0.375rem',
                      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
                      border: '1px solid #e5e7eb'
                    }}
                  >
                    <div className="py-1" role="none">
                      <button
                        onClick={handleLogout}
                        className="text-gray-700 block w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
                        role="menuitem"
                        tabIndex={-1}
                      >
                        Sign out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={() => setShowAuthModal(true)}
                className="flex items-center space-x-2 text-gray-700 hover:text-blue-600 transition-colors px-4 py-2 rounded-lg hover:bg-gray-50"
              >
                <User className="h-5 w-5" />
                <span className="font-medium">Sign In</span>
              </button>
            )}

            <Link
              to="/cart"
              className="relative flex items-center text-gray-700 hover:text-blue-600 transition-colors p-2"
            >
              <ShoppingBag className="h-6 w-6" />
              {items.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-blue-600 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                  {items.length}
                </span>
              )}
            </Link>
          </div>
        </div>
      </div>

      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
      />
    </nav>
  );
};

export default Navbar; 