import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar: string;
}

interface AdminContextType {
  adminUser: AdminUser | null;
  isAdmin: boolean;
  adminLogin: (email: string, password: string) => Promise<boolean>;
  adminLogout: () => void;
  loading: boolean;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

export const useAdmin = () => {
  const context = useContext(AdminContext);
  if (context === undefined) {
    throw new Error('useAdmin must be used within an AdminProvider');
  }
  return context;
};

interface AdminProviderProps {
  children: ReactNode;
}

export const AdminProvider: React.FC<AdminProviderProps> = ({ children }) => {
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if admin is logged in on app start
    const adminToken = localStorage.getItem('adminToken');
    const adminUserData = localStorage.getItem('adminUser');
    const regularToken = localStorage.getItem('token');
    
    // First check admin-specific storage
    if (adminToken && adminUserData) {
      try {
        const user = JSON.parse(adminUserData);
        if (user.role === 'admin') {
          setAdminUser(user);
          setLoading(false);
          return;
        }
      } catch (error) {
        console.error('Error parsing admin user data:', error);
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminUser');
      }
    }
    
    // If no admin token, check regular token for admin role
    if (regularToken) {
      try {
        // Try to get user profile from regular token
        fetch('http://localhost:5001/api/auth/profile', {
          headers: {
            'Authorization': `Bearer ${regularToken}`,
          },
        })
        .then(response => response.json())
        .then(userData => {
          if (userData.role === 'admin') {
            // Store admin data for consistency
            localStorage.setItem('adminToken', regularToken);
            localStorage.setItem('adminUser', JSON.stringify(userData));
            setAdminUser(userData);
          }
        })
        .catch(error => {
          console.error('Error checking regular token for admin:', error);
        });
      } catch (error) {
        console.error('Error checking admin status:', error);
      }
    }
    
    setLoading(false);
  }, []);

  const adminLogin = async (email: string, password: string): Promise<boolean> => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:5001/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok && data.user.role === 'admin') {
        localStorage.setItem('adminToken', data.token);
        localStorage.setItem('adminUser', JSON.stringify(data.user));
        setAdminUser(data.user);
        return true;
      } else {
        throw new Error(data.message || 'Login failed');
      }
    } catch (error) {
      console.error('Admin login error:', error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const adminLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
    localStorage.removeItem('token');
    setAdminUser(null);
  };

  const value: AdminContextType = {
    adminUser,
    isAdmin: adminUser?.role === 'admin',
    adminLogin,
    adminLogout,
    loading,
  };

  return (
    <AdminContext.Provider value={value}>
      {children}
    </AdminContext.Provider>
  );
}; 