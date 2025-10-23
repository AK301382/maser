import { memo } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { useApp } from '@/context/AppContext';
import NavigationPage from './NavigationPage';
import SubmitRoadPage from './SubmitRoadPage';
import ProfilePage from './ProfilePage';
import AdminPage from './AdminPage';
import { Home, MapPinned, User } from 'lucide-react';

function MainApp() {
  const { user } = useApp();
  const navigate = useNavigate();
  const location = useLocation();

  const tabs = [
    { id: 'navigation', label: 'مسیریابی', icon: Home, path: '/navigation' },
    { id: 'submit', label: 'ثبت مسیر', icon: MapPinned, path: '/' },
    { id: 'profile', label: 'پروفایل', icon: User, path: '/profile' },
  ];

  const currentTab = tabs.find((tab) => location.pathname === tab.path)?.id || 'submit';

  return (
    <div className="h-screen flex flex-col bg-gray-50" data-testid="main-app">
      {/* Main Content */}
      <div className="flex-1 overflow-hidden">
        <Routes>
          <Route path="/" element={<SubmitRoadPage />} />
          <Route path="/navigation" element={<NavigationPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/admin" element={<AdminPage />} />
        </Routes>
      </div>

      {/* Bottom Navigation */}
      <div className="bg-white border-t border-gray-200 shadow-lg" data-testid="bottom-navigation">
        <div className="flex items-center justify-around h-16 max-w-screen-xl mx-auto px-4">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = currentTab === tab.id;
            return (
              <button
                key={tab.id}
                data-testid={`nav-${tab.id}`}
                onClick={() => navigate(tab.path)}
                className={`flex flex-col items-center justify-center flex-1 h-full space-y-1 transition-colors ${
                  isActive
                    ? 'text-teal-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <Icon className={`w-6 h-6 ${isActive ? 'stroke-[2.5]' : 'stroke-[2]'}`} />
                <span className={`text-xs font-medium ${isActive ? 'font-semibold' : ''}`}>
                  {tab.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
export default memo(MainApp);