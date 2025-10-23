/**
 * Offline Detector Component
 * Shows a banner when user is offline
 */
import { useApp } from '@/context/AppContext';
import { WifiOff } from 'lucide-react';

export default function OfflineDetector() {
  const { isOnline } = useApp();

  if (isOnline) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-[9999] bg-red-600 text-white py-3 px-4 shadow-lg">
      <div className="max-w-screen-xl mx-auto flex items-center justify-center gap-2">
        <WifiOff className="w-5 h-5" />
        <span className="font-medium">
          اتصال اینترنت قطع شده است. لطفا اتصال خود را بررسی کنید.
        </span>
      </div>
    </div>
  );
}
