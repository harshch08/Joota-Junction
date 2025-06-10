import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ShoppingCart, Search, User, Menu, X, Settings } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import { useAdmin } from '../contexts/AdminContext';
import AuthModal from './AuthModal';
import CartSidebar from './CartSidebar';

interface HeaderProps {
  onSearch: (query: string) => void;
  onCategorySelect: (category: string) => void;
  selectedCategory: string;
}

const Header: React.FC<HeaderProps> = ({ onSearch, selectedCategory }) => {
  const { user, logout } = useAuth();
  const { adminUser, isAdmin } = useAdmin();
  const { getTotalItems } = useCart();
  const navigate = useNavigate();
  const location = useLocation();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showCart, setShowCart] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const categories = ['All', 'Running', 'Casual', 'Hiking', 'Lifestyle', 'Formal', 'Basketball'];

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (showMobileMenu) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    // Cleanup function to restore scroll when component unmounts
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [showMobileMenu]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(searchQuery);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleSearchClick = () => {
    onSearch(searchQuery);
  };

  const handleCartClick = () => {
    if (!user) {
      setShowAuthModal(true);
    } else {
      setShowCart(true);
    }
  };

  const handleCategoryClick = (category: string) => {
    if (category === 'All') {
      navigate('/');
    } else {
      navigate(`/category/${category.toLowerCase()}`);
    }
    setShowMobileMenu(false);
  };

  const handleLogoClick = () => {
    navigate('/');
  };

  const handleAdminClick = () => {
    navigate('/admin/dashboard');
  };

  return (
    <>
      <header className="bg-white shadow-lg sticky top-0 z-50 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Main Header Row */}
          <div className="flex justify-between items-center h-16 lg:h-20">
            {/* Logo */}
            <div className="flex items-center flex-shrink-0">
              <button
                onClick={handleLogoClick}
                className="text-2xl lg:text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent hover:from-blue-700 hover:to-purple-700 transition-all duration-200"
              >
                JOOTA JUNCTION
              </button>
            </div>

            {/* Desktop Search Bar */}
            <form onSubmit={handleSearchSubmit} className="hidden lg:flex items-center flex-1 max-w-xl mx-8">
              <div className="relative w-full flex items-center">
                <div className="relative flex-1">
                  <input
                    type="text"
                    placeholder="Search for shoes, brands, categories..."
                    value={searchQuery}
                    onChange={handleSearchChange}
                    className="w-full pl-12 pr-4 py-3.5 border-2 border-gray-200 rounded-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white shadow-sm hover:shadow-md focus:shadow-lg"
                  />
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                </div>
                <button
                  type="submit"
                  onClick={handleSearchClick}
                  className="ml-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-3.5 rounded-full hover:from-blue-700 hover:to-blue-800 transition-all duration-200 text-sm font-semibold shadow-md hover:shadow-lg transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  Search
                </button>
              </div>
            </form>

            {/* Desktop Actions */}
            <div className="hidden md:flex items-center space-x-6">
              {/* Admin Dashboard Button */}
              {isAdmin && (
                <button
                  onClick={handleAdminClick}
                  className="flex items-center space-x-2 text-gray-700 hover:text-purple-600 transition-colors px-3 py-2 rounded-lg hover:bg-purple-50 border border-purple-200"
                >
                  <Settings className="h-5 w-5" />
                  <span className="font-medium text-sm">Admin</span>
                </button>
              )}

              {/* User Menu */}
              {user ? (
                <div className="relative group">
                  <button className="flex items-center space-x-2 text-gray-700 hover:text-blue-600 transition-colors p-2">
                    
                    <span className="font-medium">{user.name}</span>
                  </button>
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-100 py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                    <button
                      onClick={() => navigate('/orders')}
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 w-full text-left transition-colors"
                    >
                      My Orders
                    </button>
                    <button
                      onClick={logout}
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 w-full text-left transition-colors"
                    >
                      Sign out
                    </button>
                  </div>
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

              {/* Cart */}
              <button
                onClick={handleCartClick}
                className="relative flex items-center text-gray-700 hover:text-blue-600 transition-colors p-2 rounded-lg hover:bg-gray-50"
              >
                <ShoppingCart className="h-6 w-6" />
                {getTotalItems() > 0 && (
                  <span className="absolute -top-1 -right-1 bg-blue-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-semibold">
                    {getTotalItems()}
                  </span>
                )}
              </button>
            </div>

            {/* Mobile Actions */}
            <div className="flex md:hidden items-center space-x-4">
              {/* Mobile Admin Button */}
              {isAdmin && (
                <button
                  onClick={handleAdminClick}
                  className="flex items-center text-gray-700 hover:text-purple-600 transition-colors"
                >
                  <Settings className="h-6 w-6" />
                </button>
              )}

              {/* Mobile Cart */}
              <button
                onClick={handleCartClick}
                className="relative flex items-center text-gray-700 hover:text-blue-600 transition-colors"
              >
                <ShoppingCart className="h-6 w-6" />
                {getTotalItems() > 0 && (
                  <span className="absolute -top-2 -right-2 bg-blue-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {getTotalItems()}
                  </span>
                )}
              </button>

              {/* Mobile Menu Toggle */}
              <button
                onClick={() => setShowMobileMenu(!showMobileMenu)}
                className="text-gray-700 hover:text-blue-600 transition-colors p-1"
              >
                {showMobileMenu ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>

          {/* Mobile Search */}
          <form onSubmit={handleSearchSubmit} className="lg:hidden py-4 border-t border-gray-100">
            <div className="relative w-full flex items-center">
              <div className="relative flex-1">
                <input
                  type="text"
                  placeholder="Search for shoes..."
                  value={searchQuery}
                  onChange={handleSearchChange}
                  className="w-full pl-12 pr-4 py-3.5 border-2 border-gray-200 rounded-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white shadow-sm hover:shadow-md focus:shadow-lg"
                />
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              </div>
              <button
                type="submit"
                onClick={handleSearchClick}
                className="ml-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-5 py-3.5 rounded-full hover:from-blue-700 hover:to-blue-800 transition-all duration-200 text-sm font-semibold shadow-md hover:shadow-lg transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                Search
              </button>
            </div>
          </form>
        </div>

        {/* Mobile Navigation */}
        {showMobileMenu && (
          <>
            {/* Backdrop */}
            <div 
              className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
              onClick={() => setShowMobileMenu(false)}
            />
            
            {/* Mobile Menu */}
            <div className="fixed top-0 right-0 h-full w-80 max-w-[85vw] bg-white shadow-2xl z-50 md:hidden transform transition-transform duration-300 ease-in-out">
              <div className="flex flex-col h-full">
                {/* Mobile Menu Header */}
                <div className="flex items-center justify-between p-4 border-b border-gray-200">
                  <h2 className="text-lg font-semibold text-gray-900">Menu</h2>
                  <button
                    onClick={() => setShowMobileMenu(false)}
                    className="p-2 text-gray-500 hover:text-gray-700 transition-colors"
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>

                {/* Mobile Menu Content */}
                <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
                  {/* Mobile User Section */}
                  {user ? (
                    <div className="flex items-center space-x-3 pb-4 border-b border-gray-100">
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{user.name}</p>
                        <div className="flex space-x-4 mt-2">
                          <button
                            onClick={() => {
                              navigate('/orders');
                              setShowMobileMenu(false);
                            }}
                            className="text-sm text-blue-600 hover:text-blue-700"
                          >
                            My Orders
                          </button>
                          <button
                            onClick={() => {
                              logout();
                              setShowMobileMenu(false);
                            }}
                            className="text-sm text-red-600 hover:text-red-700"
                          >
                            Sign out
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => {
                        setShowAuthModal(true);
                        setShowMobileMenu(false);
                      }}
                      className="flex items-center space-x-3 w-full text-left py-3 px-4 rounded-lg bg-blue-50 text-blue-600 font-medium"
                    >
                      <User className="h-5 w-5" />
                      <span>Sign In</span>
                    </button>
                  )}

                  {/* Mobile Admin Section */}
                  {isAdmin && (
                    <div className="pb-4 border-b border-gray-100">
                      <button
                        onClick={() => {
                          handleAdminClick();
                          setShowMobileMenu(false);
                        }}
                        className="flex items-center space-x-3 w-full text-left py-3 px-4 rounded-lg bg-purple-50 text-purple-600 font-medium"
                      >
                        <Settings className="h-5 w-5" />
                        <span>Admin Dashboard</span>
                      </button>
                    </div>
                  )}

                  {/* Mobile Categories */}
                  <nav className="space-y-1">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Categories</p>
                    {categories.map((category) => (
                      <button
                        key={category}
                        onClick={() => handleCategoryClick(category)}
                        className={`block w-full text-left py-3 px-4 rounded-lg text-sm font-medium transition-colors ${
                          selectedCategory === category ||
                          (category === 'All' && location.pathname === '/') ||
                          (category !== 'All' && location.pathname === `/category/${category.toLowerCase()}`)
                            ? 'text-blue-600 bg-blue-50'
                            : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
                        }`}
                      >
                        {category}
                      </button>
                    ))}
                  </nav>
                </div>
              </div>
            </div>
          </>
        )}
      </header>

      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
      <CartSidebar isOpen={showCart} onClose={() => setShowCart(false)} />
    </>
  );
};

export default Header;
