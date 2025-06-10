import React, { useState, useEffect } from 'react';
import { ArrowLeft, CreditCard, Truck, Shield, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { formatCurrency } from '../lib/utils';
import { ordersAPI } from '../services/api';

interface FormErrors {
  email?: string;
  phone?: string;
  firstName?: string;
  lastName?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
}

const SHIPPING_COST = 0; // Free shipping for now

const Checkout = () => {
  const navigate = useNavigate();
  const { items, total, clearCart } = useCart();
  const { user } = useAuth();
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  
  useEffect(() => {
    if (!user) {
      navigate('/');
      return;
    }

    if (items.length === 0) {
      navigate('/');
    }
  }, [items, navigate, user]);

  const [formData, setFormData] = useState({
    email: user?.email || '',
    firstName: user?.name?.split(' ')[0] || '',
    lastName: user?.name?.split(' ').slice(1).join(' ') || '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'India',
  });

  const validateForm = (): boolean => {
    const errors: FormErrors = {};
    const phoneRegex = /^\+?[\d\s-]{10,}$/;
    const zipRegex = /^\d{6}$/; // Indian PIN code format

    if (!formData.email) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Invalid email format';
    }

    if (!formData.phone) {
      errors.phone = 'Phone number is required';
    } else if (!phoneRegex.test(formData.phone)) {
      errors.phone = 'Invalid phone number format';
    }

    if (!formData.firstName) errors.firstName = 'First name is required';
    if (!formData.lastName) errors.lastName = 'Last name is required';
    if (!formData.address) errors.address = 'Address is required';
    if (!formData.city) errors.city = 'City is required';
    if (!formData.state) errors.state = 'State is required';
    
    if (!formData.zipCode) {
      errors.zipCode = 'PIN code is required';
    } else if (!zipRegex.test(formData.zipCode)) {
      errors.zipCode = 'Invalid PIN code format';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
    // Clear error when user starts typing
    if (formErrors[name as keyof FormErrors]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: undefined,
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!validateForm()) {
      return;
    }

    setIsProcessing(true);

    try {
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Prepare order data for API
      const orderData = {
        items: items.map(item => ({
          product: item.id, // Product ID from cart
          size: parseInt(item.size), // Convert string to number
          quantity: item.quantity || 1,
          price: item.price
        })),
        shippingAddress: {
          street: formData.address,
          city: formData.city,
          state: formData.state,
          zipCode: formData.zipCode,
          country: formData.country
        },
        paymentMethod: 'credit_card', // Default payment method
        totalPrice: total + SHIPPING_COST,
        shippingPrice: SHIPPING_COST
      };

      // Create order in MongoDB via API
      const response = await fetch('http://localhost:5001/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(orderData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        
        // Handle stock validation errors
        if (errorData.stockErrors) {
          const stockErrorMessages = errorData.stockErrors.map((error: any) => 
            `${error.product} (Size ${error.size}): Requested ${error.requested}, Available ${error.available}`
          ).join('\n');
          
          setError(`Some items are out of stock:\n${stockErrorMessages}`);
          setIsProcessing(false);
          return;
        }
        
        throw new Error(errorData.message || 'Failed to create order');
      }

      const createdOrder = await response.json();

      // Clear cart after successful order creation
      await clearCart();
      
      // Navigate to success page with order details
      navigate('/order-success', { 
        state: { 
          orderId: createdOrder._id, 
          total: createdOrder.totalPrice,
          customerName: `${formData.firstName} ${formData.lastName}`,
        } 
      });
    } catch (err) {
      console.error('Error processing order:', err);
      setError('An error occurred while processing your order. Please try again.');
      setIsProcessing(false);
    }
  };

  if (!user) {
    return null;
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Your cart is empty</h1>
          <button
            onClick={() => navigate('/')}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <button
          onClick={() => navigate('/')}
          className="flex items-center text-blue-600 hover:text-blue-700 mb-8"
        >
          <ArrowLeft className="h-5 w-5 mr-2" />
          Back to Shopping
        </button>

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-start">
            <AlertCircle className="h-5 w-5 text-red-500 mr-2 mt-0.5" />
            <p className="text-red-700">{error}</p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Order Form */}
          <div className="bg-white rounded-lg shadow p-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-6">Checkout</h1>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Contact Information */}
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Contact Information</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <input
                      type="email"
                      name="email"
                      placeholder="Email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 border ${formErrors.email ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                      required
                    />
                    {formErrors.email && (
                      <p className="mt-1 text-sm text-red-500">{formErrors.email}</p>
                    )}
                  </div>
                  <div>
                    <input
                      type="tel"
                      name="phone"
                      placeholder="Phone Number"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 border ${formErrors.phone ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                      required
                    />
                    {formErrors.phone && (
                      <p className="mt-1 text-sm text-red-500">{formErrors.phone}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Shipping Information */}
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Shipping Information</h2>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <input
                        type="text"
                        name="firstName"
                        placeholder="First Name"
                        value={formData.firstName}
                        onChange={handleInputChange}
                        className={`w-full px-4 py-3 border ${formErrors.firstName ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                        required
                      />
                      {formErrors.firstName && (
                        <p className="mt-1 text-sm text-red-500">{formErrors.firstName}</p>
                      )}
                    </div>
                    <div>
                      <input
                        type="text"
                        name="lastName"
                        placeholder="Last Name"
                        value={formData.lastName}
                        onChange={handleInputChange}
                        className={`w-full px-4 py-3 border ${formErrors.lastName ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                        required
                      />
                      {formErrors.lastName && (
                        <p className="mt-1 text-sm text-red-500">{formErrors.lastName}</p>
                      )}
                    </div>
                  </div>
                  
                  <div>
                    <input
                      type="text"
                      name="address"
                      placeholder="Street Address"
                      value={formData.address}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 border ${formErrors.address ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                      required
                    />
                    {formErrors.address && (
                      <p className="mt-1 text-sm text-red-500">{formErrors.address}</p>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <input
                        type="text"
                        name="city"
                        placeholder="City"
                        value={formData.city}
                        onChange={handleInputChange}
                        className={`w-full px-4 py-3 border ${formErrors.city ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                        required
                      />
                      {formErrors.city && (
                        <p className="mt-1 text-sm text-red-500">{formErrors.city}</p>
                      )}
                    </div>
                    <div>
                      <input
                        type="text"
                        name="state"
                        placeholder="State"
                        value={formData.state}
                        onChange={handleInputChange}
                        className={`w-full px-4 py-3 border ${formErrors.state ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                        required
                      />
                      {formErrors.state && (
                        <p className="mt-1 text-sm text-red-500">{formErrors.state}</p>
                      )}
                    </div>
                    <div>
                      <input
                        type="text"
                        name="zipCode"
                        placeholder="PIN Code"
                        value={formData.zipCode}
                        onChange={handleInputChange}
                        className={`w-full px-4 py-3 border ${formErrors.zipCode ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                        required
                      />
                      {formErrors.zipCode && (
                        <p className="mt-1 text-sm text-red-500">{formErrors.zipCode}</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Payment Method */}
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Payment Method</h2>
                <div className="border border-gray-300 rounded-lg p-4">
                  <div className="flex items-center space-x-3">
                    <CreditCard className="h-6 w-6 text-gray-600" />
                    <span className="font-medium">Credit/Debit Card</span>
                  </div>
                  <p className="text-sm text-gray-600 mt-2">
                    Payment will be processed securely
                  </p>
                </div>
              </div>

              <button
                type="submit"
                disabled={isProcessing}
                className="w-full bg-blue-600 text-white py-4 rounded-lg font-semibold text-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isProcessing ? (
                  <div className="flex items-center justify-center">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    Processing...
                  </div>
                ) : (
                  `Pay ${formatCurrency(total + SHIPPING_COST)}`
                )}
              </button>
            </form>
          </div>

          {/* Order Summary */}
          <div className="bg-white rounded-lg shadow p-6 h-fit">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Order Summary</h2>
            
            <div className="space-y-4 mb-6">
              {items.map((item) => (
                <div key={`${item.id}-${item.size}`} className="flex items-center space-x-4 bg-gray-50 p-4 rounded-lg">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-20 h-20 object-cover rounded"
                  />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-gray-900 truncate">{item.name}</h3>
                    <p className="text-sm text-gray-600">Size: {item.size}</p>
                    <p className="text-sm text-gray-600">Qty: {item.quantity || 1}</p>
                    <p className="text-sm font-medium text-gray-900 mt-1">
                      {formatCurrency(item.price * (item.quantity || 1))}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t border-gray-200 pt-4 space-y-3">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal</span>
                <span>{formatCurrency(total)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Shipping</span>
                <span>{SHIPPING_COST === 0 ? 'Free' : formatCurrency(SHIPPING_COST)}</span>
              </div>
              <div className="border-t border-gray-200 pt-3">
                <div className="flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span>{formatCurrency(total + SHIPPING_COST)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
