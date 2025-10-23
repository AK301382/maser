import { useState, useEffect } from 'react';
import { api, adminAPI, roadAPI } from '@/services/api';
import { useApp } from '@/context/AppContext';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  CheckCircle,
  XCircle,
  Users,
  MapPin,
  BarChart3,
  Send,
  Eye,
  Coins,
} from 'lucide-react';
import { MapContainer, TileLayer, Polyline, Marker } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

export default function AdminPage({ user, setUser }) {
  const [roads, setRoads] = useState([]);
  const [pois, setPois] = useState([]);
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalRoads: 0,
    pendingRoads: 0,
    approvedRoads: 0,
    totalPOIs: 0,
    totalCoins: 0,
  });
  const [showNotificationDialog, setShowNotificationDialog] = useState(false);
  const [showMapDialog, setShowMapDialog] = useState(false);
  const [selectedRoad, setSelectedRoad] = useState(null);
  const [notificationForm, setNotificationForm] = useState({
    userId: 'all',
    title: '',
    message: '',
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      // Load roads
      const roadsRes = await api.get('/roads');
      setRoads(roadsRes.data);

      // Load POIs
      const poisRes = await api.get('/pois');
      setPois(poisRes.data);

      // Calculate stats
      const totalRoads = roadsRes.data.length;
      const pendingRoads = roadsRes.data.filter((r) => r.status === 'pending').length;
      const approvedRoads = roadsRes.data.filter((r) => r.status === 'approved').length;

      setStats({
        totalUsers: 0,
        totalRoads,
        pendingRoads,
        approvedRoads,
        totalPOIs: poisRes.data.length,
        totalCoins: 0,
      });
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('خطا در بارگذاری اطلاعات');
    }
  };

  const handleApproveRoad = async (roadId) => {
    try {
      await api.put(`/admin/roads/${roadId}/approve`);
      toast.success('مسیر تایید شد و سکه به کاربر اضافه شد!');
      loadData();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'خطا در تایید مسیر');
    }
  };

  const handleRejectRoad = async (roadId) => {
    try {
      await api.put(`/admin/roads/${roadId}/reject`);
      toast.success('مسیر رد شد');
      loadData();
    } catch (error) {
      toast.error('خطا در رد مسیر');
    }
  };

  const handleApprovePOI = async (poiId) => {
    try {
      await api.put(`/admin/pois/${poiId}/approve`);
      toast.success('مکان تایید شد');
      loadData();
    } catch (error) {
      toast.error('خطا در تایید مکان');
    }
  };

  const handleRejectPOI = async (poiId) => {
    try {
      await api.put(`/admin/pois/${poiId}/reject`);
      toast.success('مکان رد شد');
      loadData();
    } catch (error) {
      toast.error('خطا در رد مکان');
    }
  };

  const handleSendNotification = async () => {
    if (!notificationForm.title || !notificationForm.message) {
      toast.error('لطفا عنوان و پیام را وارد کنید');
      return;
    }

    try {
      await api.post('/admin/notifications/broadcast', notificationForm);
      toast.success('اعلان با موفقیت ارسال شد');
      setShowNotificationDialog(false);
      setNotificationForm({ userId: 'all', title: '', message: '' });
    } catch (error) {
      toast.error('خطا در ارسال اعلان');
    }
  };

  const handleViewOnMap = (road) => {
    setSelectedRoad(road);
    setShowMapDialog(true);
  };

  const StatCard = ({ title, value, icon: Icon, color }) => (
    <Card className="border-0 shadow-lg" data-testid={`stat-${title}`}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600 mb-1">{title}</p>
            <p className="text-3xl font-bold text-gray-900">{value}</p>
          </div>
          <div className={`p-4 rounded-2xl ${color}`}>
            <Icon className="w-8 h-8 text-white" />
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="h-full overflow-y-auto bg-gradient-to-br from-gray-50 to-gray-100" data-testid="admin-page">
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">پنل مدیریت</h1>
            <p className="text-gray-600 mt-1">مدیریت سیستم نقشه‌برداری مسیر</p>
          </div>
          <Button
            onClick={() => setShowNotificationDialog(true)}
            data-testid="send-notification-button"
            className="bg-gradient-to-l from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700"
          >
            <Send className="w-4 h-4 ml-2" />
            ارسال اعلان
          </Button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <StatCard
            title="کل کاربران"
            value={stats.totalUsers}
            icon={Users}
            color="bg-gradient-to-br from-blue-500 to-blue-600"
          />
          <StatCard
            title="مسیرهای در انتظار"
            value={stats.pendingRoads}
            icon={MapPin}
            color="bg-gradient-to-br from-orange-500 to-orange-600"
          />
          <StatCard
            title="مسیرهای تایید شده"
            value={stats.approvedRoads}
            icon={CheckCircle}
            color="bg-gradient-to-br from-green-500 to-green-600"
          />
          <StatCard
            title="کل مسیرها"
            value={stats.totalRoads}
            icon={BarChart3}
            color="bg-gradient-to-br from-purple-500 to-purple-600"
          />
          <StatCard
            title="کل مکان‌ها"
            value={stats.totalPOIs}
            icon={MapPin}
            color="bg-gradient-to-br from-pink-500 to-pink-600"
          />
          <StatCard
            title="کل سکه‌ها"
            value={stats.totalCoins}
            icon={Coins}
            color="bg-gradient-to-br from-teal-500 to-cyan-600"
          />
        </div>

        {/* Tabs */}
        <Card className="border-0 shadow-lg">
          <CardContent className="p-6">
            <Tabs defaultValue="roads" data-testid="admin-tabs">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="roads" data-testid="roads-tab">
                  مسیرهای در انتظار تایید
                </TabsTrigger>
                <TabsTrigger value="pois" data-testid="pois-tab">
                  مکان‌های در انتظار تایید
                </TabsTrigger>
              </TabsList>

              {/* Roads Tab */}
              <TabsContent value="roads" className="space-y-4 mt-6">
                {roads
                  .filter((road) => road.status === 'pending')
                  .map((road) => (
                    <Card key={road.id} className="border border-gray-200" data-testid={`road-${road.id}`}>
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 space-x-reverse mb-2">
                              <h3 className="text-lg font-semibold text-gray-900">
                                {road.road_name}
                              </h3>
                              <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">
                                {road.road_type}
                              </Badge>
                            </div>
                            <p className="text-sm text-gray-600">
                              تعداد نقاط: {road.coordinates.length}
                            </p>
                            <p className="text-xs text-gray-400 mt-1">
                              ثبت شده در: {new Date(road.created_at).toLocaleDateString('fa-IR')}
                            </p>
                          </div>
                          <div className="flex items-center space-x-2 space-x-reverse">
                            <Button
                              onClick={() => handleViewOnMap(road)}
                              data-testid={`view-road-${road.id}`}
                              variant="outline"
                              size="sm"
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button
                              onClick={() => handleApproveRoad(road.id)}
                              data-testid={`approve-road-${road.id}`}
                              size="sm"
                              className="bg-green-600 hover:bg-green-700 text-white"
                            >
                              <CheckCircle className="w-4 h-4 ml-1" />
                              تایید
                            </Button>
                            <Button
                              onClick={() => handleRejectRoad(road.id)}
                              data-testid={`reject-road-${road.id}`}
                              size="sm"
                              variant="destructive"
                            >
                              <XCircle className="w-4 h-4 ml-1" />
                              رد
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                {roads.filter((road) => road.status === 'pending').length === 0 && (
                  <div className="text-center py-12 text-gray-500">
                    <MapPin className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                    <p>مسیری برای تایید وجود ندارد</p>
                  </div>
                )}
              </TabsContent>

              {/* POIs Tab */}
              <TabsContent value="pois" className="space-y-4 mt-6">
                {pois
                  .filter((poi) => poi.status === 'pending')
                  .map((poi) => (
                    <Card key={poi.id} className="border border-gray-200" data-testid={`poi-${poi.id}`}>
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 space-x-reverse mb-2">
                              <h3 className="text-lg font-semibold text-gray-900">{poi.name}</h3>
                              <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                                {poi.category}
                              </Badge>
                            </div>
                            <p className="text-sm text-gray-600">نوع: {poi.poi_type}</p>
                            <p className="text-xs text-gray-400 mt-1">
                              ثبت شده در: {new Date(poi.created_at).toLocaleDateString('fa-IR')}
                            </p>
                          </div>
                          <div className="flex items-center space-x-2 space-x-reverse">
                            <Button
                              onClick={() => handleApprovePOI(poi.id)}
                              data-testid={`approve-poi-${poi.id}`}
                              size="sm"
                              className="bg-green-600 hover:bg-green-700 text-white"
                            >
                              <CheckCircle className="w-4 h-4 ml-1" />
                              تایید
                            </Button>
                            <Button
                              onClick={() => handleRejectPOI(poi.id)}
                              data-testid={`reject-poi-${poi.id}`}
                              size="sm"
                              variant="destructive"
                            >
                              <XCircle className="w-4 h-4 ml-1" />
                              رد
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                {pois.filter((poi) => poi.status === 'pending').length === 0 && (
                  <div className="text-center py-12 text-gray-500">
                    <MapPin className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                    <p>مکانی برای تایید وجود ندارد</p>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>

      {/* Send Notification Dialog */}
      <Dialog open={showNotificationDialog} onOpenChange={setShowNotificationDialog}>
        <DialogContent className="max-w-md" data-testid="notification-dialog">
          <DialogHeader>
            <DialogTitle>ارسال اعلان</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label>عنوان</Label>
              <Input
                data-testid="notification-title-input"
                placeholder="عنوان اعلان"
                value={notificationForm.title}
                onChange={(e) => setNotificationForm({ ...notificationForm, title: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>پیام</Label>
              <Textarea
                data-testid="notification-message-input"
                placeholder="متن پیام"
                value={notificationForm.message}
                onChange={(e) => setNotificationForm({ ...notificationForm, message: e.target.value })}
                rows={4}
              />
            </div>
            <Button
              onClick={handleSendNotification}
              data-testid="submit-notification-button"
              className="w-full bg-gradient-to-l from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700"
            >
              <Send className="w-4 h-4 ml-2" />
              ارسال به همه کاربران
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Map Preview Dialog */}
      <Dialog open={showMapDialog} onOpenChange={setShowMapDialog}>
        <DialogContent className="max-w-3xl" data-testid="map-preview-dialog">
          <DialogHeader>
            <DialogTitle>پیش‌نمایش مسیر: {selectedRoad?.road_name}</DialogTitle>
          </DialogHeader>
          <div className="h-96 mt-4">
            {selectedRoad && (
              <MapContainer
                center={selectedRoad.coordinates[0]}
                zoom={14}
                className="h-full w-full rounded-lg"
              >
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                <Polyline positions={selectedRoad.coordinates} color="#0d9488" weight={4} />
                {selectedRoad.coordinates.map((coord, idx) => (
                  <Marker key={idx} position={coord} />
                ))}
              </MapContainer>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}