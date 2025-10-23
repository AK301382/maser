/**
 * Admin Panel - Main App
 * Only for administrators
 */
import { lazy, Suspense, useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster, toast } from 'sonner';
import './App.css';
import { authAPI } from './services/api';
import AdminPage from './pages/AdminPage';

// Admin Login Page
const AdminLogin = lazy(() => import('./pages/AdminLogin'));

// Loading component
function LoadingScreen() {
  return (
    <div className="h-screen flex flex-col items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 p-4">
      <div className="text-center space-y-4">
        <div className="text-2xl font-bold text-slate-700 animate-pulse">
          پنل مدیریت مسیر
        </div>
        <div className="flex justify-center gap-2">
          <div className="h-3 w-3 rounded-full bg-slate-400 animate-bounce" style={{animationDelay: '0ms'}}></div>
          <div className="h-3 w-3 rounded-full bg-slate-400 animate-bounce" style={{animationDelay: '150ms'}}></div>
          <div className="h-3 w-3 rounded-full bg-slate-400 animate-bounce" style={{animationDelay: '300ms'}}></div>
        </div>
        <p className="text-sm text-slate-600">در حال بارگذاری...</p>
      </div>
    </div>
  );
}

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const token = localStorage.getItem('admin_token');
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const userData = await authAPI.getCurrentUser();
      setUser(userData);
    } catch (error) {
      console.error('Auth error:', error);
      localStorage.removeItem('admin_token');
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = (userData, token) => {
    localStorage.setItem('admin_token', token);
    setUser(userData);
    toast.success('خوش آمدید مدیر گرامی!');
  };

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    setUser(null);
    toast.success('با موفقیت خارج شدید');
  };

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <div className="App">
      <Toaster position="top-center" richColors />
      <BrowserRouter>
        <Suspense fallback={<LoadingScreen />}>
          <Routes>
            <Route
              path="/login"
              element={!user ? <AdminLogin onLogin={handleLogin} /> : <Navigate to="/" replace />}
            />
            <Route
              path="/*"
              element={user ? <AdminPage user={user} onLogout={handleLogout} /> : <Navigate to="/login" replace />}
            />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </div>
  );
}

export default App;
