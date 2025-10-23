/**
 * Web App - Main App
 * For regular users
 */
import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import './App.css';
import { AppProvider, useApp } from './context/AppContext';
import ErrorBoundary from './components/ErrorBoundary';
import OfflineDetector from './components/OfflineDetector';

// Lazy load pages
const AuthPage = lazy(() => import('./pages/AuthPage'));
const MainApp = lazy(() => import('./pages/MainApp'));

// Loading component
function LoadingScreen() {
  return (
    <div className="h-screen flex flex-col items-center justify-center bg-gradient-to-br from-teal-50 to-cyan-100 p-4">
      <div className="text-center space-y-4">
        <div className="text-2xl font-bold text-teal-600 animate-pulse">
          مسیر
        </div>
        <div className="flex justify-center gap-2">
          <div className="h-3 w-3 rounded-full bg-teal-400 animate-bounce" style={{animationDelay: '0ms'}}></div>
          <div className="h-3 w-3 rounded-full bg-teal-400 animate-bounce" style={{animationDelay: '150ms'}}></div>
          <div className="h-3 w-3 rounded-full bg-teal-400 animate-bounce" style={{animationDelay: '300ms'}}></div>
        </div>
        <p className="text-sm text-teal-600">در حال بارگذاری...</p>
      </div>
    </div>
  );
}

// Router component (needs to be inside AppProvider)
function AppRouter() {
  const { user, loading } = useApp();

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <Routes>
      <Route
        path="/auth"
        element={!user ? <AuthPage /> : <Navigate to="/" replace />}
      />
      <Route
        path="/*"
        element={user ? <MainApp /> : <Navigate to="/auth" replace />}
      />
    </Routes>
  );
}

// Main App with all providers
function App() {
  return (
    <ErrorBoundary>
      <AppProvider>
        <div className="App">
          <OfflineDetector />
          <Toaster position="top-center" richColors />
          <BrowserRouter>
            <Suspense fallback={<LoadingScreen />}>
              <AppRouter />
            </Suspense>
          </BrowserRouter>
        </div>
      </AppProvider>
    </ErrorBoundary>
  );
}

export default App;
