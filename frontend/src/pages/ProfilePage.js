import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api, poiAPI, locationAPI, notificationAPI } from '@/services/api';
import { useApp } from '@/context/AppContext';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  User,
  Coins,
  MapPin,
  Home,
  Mail,
  HelpCircle,
  Share2,
  LogOut,
  Plus,
  ChevronLeft,
  Shield,
} from 'lucide-react';

export default function ProfilePage() {
  const { user, logout: handleLogout } = useApp();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [showAddPOI, setShowAddPOI] = useState(false);
  const [showPersonalLocation, setShowPersonalLocation] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [personalLocations, setPersonalLocations] = useState([]);
  const [poiForm, setPoiForm] = useState({
    name: '',
    category: '',
    poi_type: '',
    location: [35.6892, 51.389],
  });
  const [personalForm, setPersonalForm] = useState({
    name: '',
    location: [35.6892, 51.389],
  });

  useEffect(() => {
    loadNotifications();
    loadPersonalLocations();
  }, []);

  const loadNotifications = async () => {
    try {
      const response = await api.get('/notifications');
      setNotifications(response.data);
    } catch (error) {
      console.error('Error loading notifications:', error);
    }
  };

  const loadPersonalLocations = async () => {
    try {
      const response = await api.get('/locations/personal');
      setPersonalLocations(response.data);
    } catch (error) {
      console.error('Error loading personal locations:', error);
    }
  };

  const handleLogoutClick = () => {
    handleLogout();
    toast.success('با موفقیت خارج شدید');
    navigate('/auth');
  };

  const handleAddPOI = async () => {
    if (!poiForm.name || !poiForm.category || !poiForm.poi_type) {
      toast.error('لطفا تمام فیلدها را پر کنید');
      return;
    }

    try {
      await api.post('/pois', poiForm);
      toast.success('مکان با موفقیت ثبت شد');
      setShowAddPOI(false);
      setPoiForm({ name: '', category: '', poi_type: '', location: [35.6892, 51.389] });
    } catch (error) {
      toast.error(error.response?.data?.detail || 'خطا در ثبت مکان');
    }
  };

  const handleAddPersonalLocation = async () => {
    if (!personalForm.name) {
      toast.error('لطفا نام مکان را وارد کنید');
      return;
    }

    try {
      await api.post('/locations/personal', personalForm);
      toast.success('مکان شخصی با موفقیت ثبت شد');
      setShowPersonalLocation(false);
      setPersonalForm({ name: '', location: [35.6892, 51.389] });
      loadPersonalLocations();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'خطا در ثبت مکان');
    }
  };

  const handleShare = () => {
    const shareText = 'مسیر - سیستم نقشه‌برداری جمعی\nبا ثبت مسیرهای جدید، سکه کسب کنید!';
    if (navigator.share) {
      navigator.share({
        title: 'مسیر',
        text: shareText,
        url: window.location.origin,
      });
    } else {
      navigator.clipboard.writeText(`${shareText}\n${window.location.origin}`);
      toast.success('لینک کپی شد');
    }
  };

  const menuItems = [
    {
      icon: Plus,
      label: 'افزودن مکان جدید',
      onClick: () => setShowAddPOI(true),
      testId: 'add-poi-button',
    },
    {
      icon: Home,
      label: 'مکان‌های شخصی',
      onClick: () => setShowPersonalLocation(true),
      testId: 'personal-locations-button',
    },
    {
      icon: Mail,
      label: `صندوق پیام (${notifications.filter((n) => !n.read).length})`,
      onClick: () => setShowNotifications(true),
      testId: 'notifications-button',
    },
    {
      icon: Shield,
      label: 'پنل مدیریت',
      onClick: () => navigate('/admin'),
      testId: 'admin-panel-button',
    },
    {
      icon: HelpCircle,
      label: 'راهنمایی برنامه',
      onClick: () => toast.info('بخش راهنما به زودی اضافه خواهد شد'),
      testId: 'help-button',
    },
    {
      icon: Share2,
      label: 'معرفی به دیگران',
      onClick: handleShare,
      testId: 'share-button',
    },
  ];

  return (
    <div className="h-full overflow-y-auto bg-gradient-to-br from-teal-50 via-cyan-50 to-blue-50" data-testid="profile-page">
      <div className="max-w-2xl mx-auto p-6 space-y-6">
        {/* Profile Header */}
        <Card className="border-0 shadow-xl" data-testid="profile-header">
          <CardContent className="p-6">
            <div className="flex items-center space-x-4 space-x-reverse">
              <Avatar className="h-20 w-20 border-4 border-teal-500">
                <AvatarFallback className="bg-gradient-to-br from-teal-500 to-cyan-600 text-white text-2xl font-bold">
                  {user?.full_name?.charAt(0) || 'U'}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-gray-900">{user?.full_name}</h2>
                <p className="text-gray-600 text-sm">{user?.email}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Coins Card */}
        <Card className="border-0 shadow-xl bg-gradient-to-br from-teal-500 to-cyan-600 text-white" data-testid="coins-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/80 text-sm">سکه‌های مسیر</p>
                <p className="text-4xl font-bold mt-2">{user?.coins || 0}</p>
              </div>
              <div className="bg-white/20 p-4 rounded-2xl backdrop-blur">
                <Coins className="w-10 h-10" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Menu Items */}
        <Card className="border-0 shadow-xl" data-testid="menu-items">
          <CardHeader>
            <CardTitle className="text-lg">تنظیمات</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {menuItems.map((item, index) => {
              const Icon = item.icon;
              return (
                <button
                  key={index}
                  data-testid={item.testId}
                  onClick={item.onClick}
                  className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors border-t border-gray-100 first:border-t-0"
                >
                  <div className="flex items-center space-x-3 space-x-reverse">
                    <div className="bg-teal-100 p-2 rounded-lg">
                      <Icon className="w-5 h-5 text-teal-600" />
                    </div>
                    <span className="text-gray-900 font-medium">{item.label}</span>
                  </div>
                  <ChevronLeft className="w-5 h-5 text-gray-400" />
                </button>
              );
            })}
          </CardContent>
        </Card>

        {/* Logout Button */}
        <Button
          onClick={handleLogoutClick}
          data-testid="logout-button"
          variant="outline"
          className="w-full h-12 border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 font-semibold"
        >
          <LogOut className="w-5 h-5 ml-2" />
          خروج از حساب
        </Button>
      </div>

      {/* Add POI Dialog */}
      <Dialog open={showAddPOI} onOpenChange={setShowAddPOI}>
        <DialogContent className="max-w-md" data-testid="add-poi-dialog">
          <DialogHeader>
            <DialogTitle>افزودن مکان جدید</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label>نام مکان</Label>
              <Input
                data-testid="poi-name-input"
                placeholder="مثلا: مسجد جامع"
                value={poiForm.name}
                onChange={(e) => setPoiForm({ ...poiForm, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>دسته‌بندی</Label>
              <Select
                value={poiForm.category}
                onValueChange={(value) => setPoiForm({ ...poiForm, category: value })}
              >
                <SelectTrigger data-testid="poi-category-select">
                  <SelectValue placeholder="انتخاب کنید" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="عمومی">عمومی</SelectItem>
                  <SelectItem value="خصوصی">خصوصی</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>نوع مکان</Label>
              <Input
                data-testid="poi-type-input"
                placeholder="مثلا: مسجد, رستوران, پمپ بنزین"
                value={poiForm.poi_type}
                onChange={(e) => setPoiForm({ ...poiForm, poi_type: e.target.value })}
              />
            </div>
            <Button
              onClick={handleAddPOI}
              data-testid="submit-poi-button"
              className="w-full bg-gradient-to-l from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700"
            >
              ثبت مکان
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Personal Locations Dialog */}
      <Dialog open={showPersonalLocation} onOpenChange={setShowPersonalLocation}>
        <DialogContent className="max-w-md" data-testid="personal-locations-dialog">
          <DialogHeader>
            <DialogTitle>مکان‌های شخصی</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label>نام مکان</Label>
              <Input
                data-testid="personal-location-name-input"
                placeholder="مثلا: خانه, محل کار"
                value={personalForm.name}
                onChange={(e) => setPersonalForm({ ...personalForm, name: e.target.value })}
              />
            </div>
            <Button
              onClick={handleAddPersonalLocation}
              data-testid="submit-personal-location-button"
              className="w-full bg-gradient-to-l from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700"
            >
              ثبت مکان
            </Button>

            {personalLocations.length > 0 && (
              <div className="space-y-2">
                <Label>مکان‌های ذخیره شده</Label>
                {personalLocations.map((loc) => (
                  <div
                    key={loc.id}
                    className="p-3 bg-gray-50 rounded-lg border border-gray-200"
                  >
                    <div className="flex items-center space-x-2 space-x-reverse">
                      <Home className="w-4 h-4 text-gray-600" />
                      <span className="text-sm font-medium">{loc.name}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Notifications Dialog */}
      <Dialog open={showNotifications} onOpenChange={setShowNotifications}>
        <DialogContent className="max-w-md" data-testid="notifications-dialog">
          <DialogHeader>
            <DialogTitle>صندوق پیام</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 mt-4 max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Mail className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                <p>پیامی وجود ندارد</p>
              </div>
            ) : (
              notifications.map((notif) => (
                <div
                  key={notif.id}
                  data-testid={`notification-${notif.id}`}
                  className={`p-4 rounded-lg border ${
                    notif.read ? 'bg-gray-50 border-gray-200' : 'bg-teal-50 border-teal-200'
                  }`}
                >
                  <h4 className="font-semibold text-gray-900">{notif.title}</h4>
                  <p className="text-sm text-gray-600 mt-1">{notif.message}</p>
                  <p className="text-xs text-gray-400 mt-2">
                    {new Date(notif.created_at).toLocaleDateString('fa-IR')}
                  </p>
                </div>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}