import { useState, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Polyline, useMapEvents, useMap } from 'react-leaflet';
import { toast } from 'sonner';
import { roadAPI } from '@/services/api';
import { useGeolocation } from '@/hooks/useGeolocation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { MapPin, Navigation, Plus, Check } from 'lucide-react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix Leaflet default marker icon
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

function LocationButton() {
  const map = useMap();

  const handleLocate = () => {
    map.locate({ setView: true, maxZoom: 16 });
  };

  return (
    <Button
      onClick={handleLocate}
      data-testid="locate-button"
      className="absolute top-4 left-4 z-[1000] bg-white hover:bg-gray-50 text-gray-700 shadow-lg border border-gray-200"
      size="icon"
    >
      <Navigation className="w-5 h-5" />
    </Button>
  );
}

function MapClickHandler({ onMapClick, isDrawing }) {
  useMapEvents({
    click(e) {
      if (isDrawing) {
        onMapClick([e.latlng.lat, e.latlng.lng]);
      }
    },
  });
  return null;
}

export default function SubmitRoadPage() {
  const { location: userLocation } = useGeolocation();
  const [showMap, setShowMap] = useState(false);
  const [isDrawing, setIsDrawing] = useState(false);
  const [coordinates, setCoordinates] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    road_name: '',
    road_type: '',
  });
  const [submitting, setSubmitting] = useState(false);

  const handleStartDrawing = () => {
    setShowMap(true);
    setIsDrawing(true);
    setCoordinates([]);
  };

  const handleMapClick = (latlng) => {
    setCoordinates([...coordinates, latlng]);
  };

  const handleNext = () => {
    if (coordinates.length < 2) {
      toast.error('لطفا حداقل دو نقطه را انتخاب کنید');
      return;
    }
    setIsDrawing(false);
    setShowForm(true);
  };

  const handleSubmit = async () => {
    if (!formData.road_name || !formData.road_type) {
      toast.error('لطفا تمام فیلدها را پر کنید');
      return;
    }

    setSubmitting(true);
    try {
      await roadAPI.submit({
        road_name: formData.road_name,
        road_type: formData.road_type,
        coordinates: coordinates,
      });

      toast.success('مسیر با موفقیت ثبت شد! بعد از تایید سکه به شما اضافه می‌شود.');
      setShowMap(false);
      setShowForm(false);
      setCoordinates([]);
      setFormData({ road_name: '', road_type: '' });
    } catch (error) {
      toast.error(error.response?.data?.detail || 'خطا در ثبت مسیر');
    } finally {
      setSubmitting(false);
    }
  };

  const handleReset = () => {
    setCoordinates([]);
  };

  if (showMap) {
    return (
      <div className="h-full relative" data-testid="map-drawing-view">
        <MapContainer
          center={userLocation}
          zoom={13}
          className="h-full w-full"
          zoomControl={true}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          />
          <LocationButton />
          <MapClickHandler onMapClick={handleMapClick} isDrawing={isDrawing} />
          
          {coordinates.map((coord, idx) => (
            <Marker key={idx} position={coord} />
          ))}
          
          {coordinates.length > 1 && (
            <Polyline positions={coordinates} color="#0d9488" weight={4} />
          )}
        </MapContainer>

        {/* Drawing Instructions */}
        {isDrawing && (
          <div className="absolute top-4 right-4 z-[1000]">
            <Card className="shadow-lg border-teal-200 bg-white/95 backdrop-blur">
              <CardContent className="p-4">
                <div className="flex items-start space-x-3 space-x-reverse">
                  <div className="bg-teal-500 p-2 rounded-lg">
                    <MapPin className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">
                      برای شروع طراحی، روی نقشه کلیک کنید
                    </p>
                    <p className="text-xs text-gray-600 mt-1">
                      تعداد نقاط: {coordinates.length}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Bottom Action Bar */}
        <div className="absolute bottom-0 left-0 right-0 z-[1000] bg-white border-t border-gray-200 p-4 shadow-lg">
          <div className="max-w-screen-xl mx-auto flex items-center justify-between space-x-3 space-x-reverse">
            {isDrawing ? (
              <>
                <Button
                  onClick={handleReset}
                  variant="outline"
                  data-testid="reset-drawing-button"
                  className="flex-1"
                >
                  پاک کردن
                </Button>
                <Button
                  onClick={handleNext}
                  data-testid="next-button"
                  className="flex-1 bg-gradient-to-l from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700"
                >
                  بعدی
                </Button>
              </>
            ) : (
              <Button
                onClick={() => {
                  setShowMap(false);
                  setCoordinates([]);
                }}
                variant="outline"
                data-testid="cancel-button"
                className="w-full"
              >
                انصراف
              </Button>
            )}
          </div>
        </div>

        {/* Form Dialog */}
        <Dialog open={showForm} onOpenChange={setShowForm}>
          <DialogContent className="max-w-md" data-testid="road-form-dialog">
            <DialogHeader>
              <DialogTitle>اطلاعات مسیر</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="road_name">نام جاده</Label>
                <Input
                  id="road_name"
                  data-testid="road-name-input"
                  placeholder="مثلا: خیابان ولیعصر"
                  value={formData.road_name}
                  onChange={(e) => setFormData({ ...formData, road_name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>نوع جاده</Label>
                <Select
                  value={formData.road_type}
                  onValueChange={(value) => setFormData({ ...formData, road_type: value })}
                >
                  <SelectTrigger data-testid="road-type-select">
                    <SelectValue placeholder="نوع جاده را انتخاب کنید" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="خیابان اصلی">خیابان اصلی</SelectItem>
                    <SelectItem value="خیابان فرعی">خیابان فرعی</SelectItem>
                    <SelectItem value="کوچه">کوچه</SelectItem>
                    <SelectItem value="بزرگراه">بزرگراه</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button
                onClick={handleSubmit}
                data-testid="submit-road-button"
                className="w-full bg-gradient-to-l from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700"
                disabled={submitting}
              >
                {submitting ? 'در حال ثبت...' : 'ثبت مسیر'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col items-center justify-center bg-gradient-to-br from-teal-50 via-cyan-50 to-blue-50 p-6" data-testid="submit-road-home">
      <Card className="max-w-lg w-full shadow-xl border-0">
        <CardContent className="p-8 space-y-6">
          <div className="text-center space-y-3">
            <div className="flex justify-center">
              <div className="bg-gradient-to-br from-teal-500 to-cyan-600 p-4 rounded-2xl shadow-lg">
                <MapPin className="w-12 h-12 text-white" />
              </div>
            </div>
            <h2 className="text-2xl font-bold text-gray-900">ثبت مسیر جدید</h2>
            <p className="text-gray-600">
              با ثبت هر مسیر جدید، یک سکه مسیر هدیه بگیرید!
            </p>
          </div>

          <div className="bg-teal-50 border border-teal-200 rounded-lg p-4 space-y-2">
            <h3 className="font-semibold text-teal-900">چگونه کار می‌کند؟</h3>
            <ul className="text-sm text-teal-800 space-y-1">
              <li className="flex items-start space-x-2 space-x-reverse">
                <span className="text-teal-600 font-bold">۱.</span>
                <span>روی نقشه کلیک کرده و نقاط مسیر را انتخاب کنید</span>
              </li>
              <li className="flex items-start space-x-2 space-x-reverse">
                <span className="text-teal-600 font-bold">۲.</span>
                <span>نام و نوع جاده را وارد کنید</span>
              </li>
              <li className="flex items-start space-x-2 space-x-reverse">
                <span className="text-teal-600 font-bold">۳.</span>
                <span>بعد از تایید، سکه دریافت کنید</span>
              </li>
            </ul>
          </div>

          <Button
            onClick={handleStartDrawing}
            data-testid="start-drawing-button"
            className="w-full h-12 bg-gradient-to-l from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 text-white font-semibold shadow-lg text-base"
          >
            <Plus className="w-5 h-5 ml-2" />
            شروع ثبت مسیر
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}