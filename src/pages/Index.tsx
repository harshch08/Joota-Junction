import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Filter, Search } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import Header from '../components/Header';
import ProductCard from '../components/ProductCard';
import CategoryCard from '../components/CategoryCard';
import SearchResults from '../components/SearchResults';
import ProductModal from '../components/ProductModal';
import FilterSidebar from '../components/FilterSidebar';
import AuthModal from '../components/AuthModal';
import { productsAPI, categoriesAPI } from '../services/api';
import { Product, Category } from '../types';
import FeaturedProductCard from '../components/FeaturedProductCard';
import AboutUs from '../components/AboutUs';
import Footer from '../components/Footer';

const priceRanges = [
  { label: 'Under ₹2,000', min: 0, max: 2000 },
  { label: '₹2,000 - ₹5,000', min: 2000, max: 5000 },
  { label: '₹5,000 - ₹10,000', min: 5000, max: 10000 },
  { label: '₹10,000 - ₹15,000', min: 10000, max: 15000 },
  { label: 'Over ₹15,000', min: 15000, max: Infinity },
];

const Index = () => {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedBrand, setSelectedBrand] = useState('All');
  const [selectedPriceRange, setSelectedPriceRange] = useState('All');
  const [isSearching, setIsSearching] = useState(false);
  const [currentSearchQuery, setCurrentSearchQuery] = useState('');
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const { data: products = [], isLoading, error } = useQuery({
    queryKey: ['products', searchQuery, selectedCategory, selectedBrand, selectedPriceRange],
    queryFn: () => {
      const params: any = {};
      if (searchQuery) params.search = searchQuery;
      if (selectedCategory !== 'All') params.category = selectedCategory;
      if (selectedBrand !== 'All') params.brand = selectedBrand;
      if (selectedPriceRange !== 'All') {
        const range = priceRanges.find(r => r.label === selectedPriceRange);
        if (range) {
          params.minPrice = range.min;
          params.maxPrice = range.max;
        }
      }
      return productsAPI.getAllProducts(params);
    },
    enabled: !isSearching // Only fetch products when not searching
  });

  const { data: searchResults = [], isLoading: searchLoading, error: searchError } = useQuery({
    queryKey: ['search', currentSearchQuery],
    queryFn: () => {
      const params: any = {};
      if (currentSearchQuery) params.search = currentSearchQuery;
      return productsAPI.getAllProducts(params);
    },
    enabled: isSearching && !!currentSearchQuery // Only fetch search results when searching
  });

  const { data: categories = [], isLoading: categoriesLoading } = useQuery<Category[]>({
    queryKey: ['categories'],
    queryFn: () => categoriesAPI.getAllCategories()
  });

  const featuredProducts = products.filter(product => product.featured);

  // Check if device is mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Auto-slide functionality for mobile
  useEffect(() => {
    if (!isMobile || featuredProducts.length === 0) return;

    const interval = setInterval(() => {
      setCurrentSlide((prev) => {
        const next = (prev + 1) % featuredProducts.length;
        
        // Scroll to the next slide
        if (scrollContainerRef.current) {
          const container = scrollContainerRef.current;
          const slideWidth = container.children[0]?.clientWidth || 320;
          const gap = 24; // 6 * 4 (gap-6 = 1.5rem = 24px)
          const scrollPosition = next * (slideWidth + gap);
          
          container.scrollTo({
            left: scrollPosition,
            behavior: 'smooth'
          });
        }
        
        return next;
      });
    }, 3000); // Changed from 5000 to 3000 (3 seconds)

    return () => clearInterval(interval);
  }, [isMobile, featuredProducts.length]);

  const handleSearch = (query: string) => {
    if (query.trim()) {
      setIsSearching(true);
      setCurrentSearchQuery(query);
    } else {
      setIsSearching(false);
      setCurrentSearchQuery('');
    }
  };

  const handleBackToHome = () => {
    setIsSearching(false);
    setCurrentSearchQuery('');
    setSearchQuery('');
  };

  // If searching, show search results
  if (isSearching) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header
          onSearch={handleSearch}
          onCategorySelect={setSelectedCategory}
          selectedCategory={selectedCategory}
        />
        <SearchResults
          searchQuery={currentSearchQuery}
          products={searchResults}
          isLoading={searchLoading}
          error={searchError}
          onBackToHome={handleBackToHome}
          onAuthRequired={() => setShowAuthModal(true)}
        />
      </div>
    );
  }

  // Show homepage content
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading products...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600">Error loading products. Please try again later.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header
        onSearch={handleSearch}
        onCategorySelect={setSelectedCategory}
        selectedCategory={selectedCategory}
      />

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-600 via-blue-700 to-purple-700 text-white overflow-hidden">
        <div className="absolute inset-0 bg-black opacity-10"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 lg:py-24">
          <div className="text-center">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 sm:mb-6">
              Step Into <span className="text-yellow-300">Style</span>
            </h1>
            <p className="text-lg sm:text-xl md:text-2xl mb-6 sm:mb-8 text-blue-100 max-w-3xl mx-auto">
              Discover the perfect shoes for every occasion at JOOTA JUNCTION, from casual comfort to athletic performance
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <button 
                onClick={() => document.getElementById('featured-section')?.scrollIntoView({ behavior: 'smooth' })}
                className="bg-white text-blue-600 px-6 sm:px-8 py-3 sm:py-4 rounded-full font-semibold text-base sm:text-lg hover:bg-gray-100 transition-all duration-200 transform hover:scale-105 shadow-lg"
              >
                Shop Featured
              </button>
              <button 
                onClick={() => document.getElementById('all-products')?.scrollIntoView({ behavior: 'smooth' })}
                className="border-2 border-white text-white px-6 sm:px-8 py-3 sm:py-4 rounded-full font-semibold text-base sm:text-lg hover:bg-white hover:text-blue-600 transition-all duration-200"
              >
                View All Products
              </button>
            </div>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-16 sm:h-20 bg-gradient-to-t from-gray-50 to-transparent"></div>
      </section>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Featured Products */}
        <section id="featured-section" className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
            <span className="inline-block w-2 h-8 bg-gradient-to-b from-blue-500 to-purple-500 rounded-full mr-2"></span>
            Featured Products
          </h2>
          <div 
            ref={scrollContainerRef}
            className="overflow-x-auto pb-2 -mx-2 scrollbar-hide"
            style={{scrollSnapType: 'x mandatory'}}
          >
            <div className="flex gap-6 px-2" style={{scrollSnapType: 'x mandatory'}}>
              {featuredProducts.slice(0, 3).map((product, index) => (
                <div 
                  key={product._id} 
                  className="min-w-[320px] max-w-xs flex-shrink-0" 
                  style={{scrollSnapAlign: 'start'}}
                >
                  <FeaturedProductCard
                    product={product}
                    onProductClick={() => setSelectedProduct(product)}
                    onAuthRequired={() => setShowAuthModal(true)}
                  />
                </div>
              ))}
            </div>
          </div>
          
          {/* Slide indicators for mobile */}
          {isMobile && featuredProducts.length > 1 && (
            <div className="flex justify-center mt-4 space-x-2">
              {featuredProducts.slice(0, 3).map((_, index) => (
                <button
                  key={index}
                  className={`w-2 h-2 rounded-full transition-all duration-300 ${
                    index === currentSlide 
                      ? 'bg-blue-600 w-6' 
                      : 'bg-gray-300'
                  }`}
                  onClick={() => {
                    setCurrentSlide(index);
                    if (scrollContainerRef.current) {
                      const container = scrollContainerRef.current;
                      const slideWidth = container.children[0]?.clientWidth || 320;
                      const gap = 24;
                      const scrollPosition = index * (slideWidth + gap);
                      
                      container.scrollTo({
                        left: scrollPosition,
                        behavior: 'smooth'
                      });
                    }
                  }}
                />
              ))}
            </div>
          )}
        </section>

        {/* Categories Section */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Shop by Category</h2>
          {categoriesLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-2 text-gray-600">Loading categories...</span>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3 sm:gap-4">
              {categories.map((category) => (
                <CategoryCard
                  key={category._id}
                  category={category}
                />
              ))}
            </div>
          )}
        </section>

        {/* All Products */}
        <section id="all-products">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">All Products</h2>
            <button
              onClick={() => setShowFilters(true)}
              className="flex items-center space-x-2 text-gray-600 hover:text-blue-600 transition-colors"
            >
              <Filter className="h-5 w-5" />
              <span>Filters</span>
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product) => (
              <ProductCard
                key={product._id}
                product={product}
                onProductClick={() => setSelectedProduct(product)}
                onAuthRequired={() => setShowAuthModal(true)}
              />
            ))}
          </div>

          {products.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500">No products found matching your search criteria.</p>
            </div>
          )}
        </section>
      </main>

      <FilterSidebar
        isOpen={showFilters}
        onClose={() => setShowFilters(false)}
        selectedCategory={selectedCategory}
        selectedBrand={selectedBrand}
        selectedPriceRange={selectedPriceRange}
        onCategoryChange={setSelectedCategory}
        onBrandChange={setSelectedBrand}
        onPriceRangeChange={setSelectedPriceRange}
      />

      <ProductModal
        product={selectedProduct}
        isOpen={!!selectedProduct}
        onClose={() => setSelectedProduct(null)}
        onAuthRequired={() => setShowAuthModal(true)}
      />

      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
      />

      {/* About Us Section */}
      <AboutUs />
      {/* Footer Section */}
      <Footer />
    </div>
  );
};

export default Index;

