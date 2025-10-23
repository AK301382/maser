import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Polyline, useMap } from 'react-leaflet';
import { toast } from 'sonner';
import { api, poiAPI, roadAPI } from '@/services/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Search, Navigation, MapPin, X } from 'lucide-react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

function LocationButton() {
  const map = useMap();

  const handleLocate = () => {
    map.locate({ setView: true, maxZoom: 16 });
  };

  return (
    <Button
      onClick={handleLocate}
      data-testid="nav-locate-button"
      className="absolute top-20 left-4 z-[1000] bg-white hover:bg-gray-50 text-gray-700 shadow-lg border border-gray-200"
      size="icon"
    >
      <Navigation className="w-5 h-5" />
    </Button>
  );
}

function RouteDisplay({ route }) {
  const map = useMap();

  useEffect(() => {
    if (route && route.length > 0) {
      const bounds = L.latLngBounds(route);
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [route, map]);

  return null;
}

export default function NavigationPage({ user }) {
  const [userLocation, setUserLocation] = useState([35.6892, 51.389]);
  const [origin, setOrigin] = useState(null);
  const [destination, setDestination] = useState(null);
  const [showSearch, setShowSearch] = useState(false);
  const [searchType, setSearchType] = useState('origin'); // 'origin' or 'destination'
  const [searchQuery, setSearchQuery] = useState('');
  const [route, setRoute] = useState(null);
  const [roads, setRoads] = useState([]);
  const [pois, setPois] = useState([]);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const loc = [position.coords.latitude, position.coords.longitude];
          setUserLocation(loc);
          setOrigin({ name: 'مکان فعلی', location: loc });
        },
        (error) => {
          console.log('Location error:', error);
          setOrigin({ name: 'مکان فعلی', location: userLocation });
        }
      );
    } else {
      setOrigin({ name: 'مکان فعلی', location: userLocation });
    }

    // Load approved roads and POIs
    loadRoads();
    loadPOIs();
  }, []);

  const loadRoads = async () => {
    try {
      const response = await api.get('/roads?status=approved');
      setRoads(response.data.items || []);
    } catch (error) {
      console.error('Error loading roads:', error);
    }
  };

  const loadPOIs = async () => {
    try {
      const response = await api.get('/pois?status=approved');
      setPois(response.data.items || []);
    } catch (error) {
      console.error('Error loading POIs:', error);
    }
  };

  const handleSearch = (type) => {
    setSearchType(type);
    setShowSearch(true);
  };

  const handleSelectLocation = (location) => {
    if (searchType === 'origin') {
      setOrigin(location);
    } else {
      setDestination(location);
    }
    setShowSearch(false);
    setSearchQuery('');
  };

  const calculateRoute = () => {
    if (!origin || !destination) {
      toast.error('لطفا مبدا و مقصد را انتخاب کنید');
      return;
    }

    // Simple straight line route (in production, use routing API)
    const routePath = [origin.location, destination.location];
    setRoute(routePath);
    toast.success('مسیر محاسبه شد');
  };

  const filteredPOIs = pois.filter((poi) =>
    poi.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="h-full relative" data-testid="navigation-page">
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

        {/* Display approved roads */}
        {roads.map((road) => (
          <Polyline
            key={road.id}
            positions={road.coordinates}
            color="#0d9488"
            weight={3}
            opacity={0.7}
          />
        ))}

        {/* Display approved POIs */}
        {pois.map((poi) => (
          <Marker key={poi.id} position={poi.location} />
        ))}

        {/* Display origin and destination */}
        {origin && <Marker position={origin.location} />}
        {destination && <Marker position={destination.location} />}

        {/* Display route */}
        {route && (
          <>
            <Polyline positions={route} color="#3b82f6" weight={5} />
            <RouteDisplay route={route} />
          </>
        )}
      </MapContainer>

      {/* Search Bar */}
      <div className="absolute top-4 right-4 left-4 z-[1000]" data-testid="search-bar">
        <Card className="shadow-lg border-0 bg-white/95 backdrop-blur">
          <CardContent className="p-4 space-y-3">
            <div className="flex items-center space-x-2 space-x-reverse">
              <Search className="w-5 h-5 text-gray-400" />
              <span className="font-semibold text-gray-900">کجا میخوای بری؟</span>
            </div>
            <div className="space-y-2">
              <button
                onClick={() => handleSearch('origin')}
                data-testid="select-origin-button"
                className="w-full text-right p-3 bg-gray-50 hover:bg-gray-100 rounded-lg border border-gray-200 transition-colors"
              >
                <div className="flex items-center space-x-2 space-x-reverse">
                  <div className="w-3 h-3 rounded-full bg-teal-500"></div>
                  <span className="text-sm">
                    {origin ? origin.name : 'مبدا را انتخاب کنید'}
                  </span>
                </div>
              </button>
              <button
                onClick={() => handleSearch('destination')}
                data-testid="select-destination-button"
                className="w-full text-right p-3 bg-gray-50 hover:bg-gray-100 rounded-lg border border-gray-200 transition-colors"
              >
                <div className="flex items-center space-x-2 space-x-reverse">
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  <span className="text-sm">
                    {destination ? destination.name : 'مقصد را انتخاب کنید'}
                  </span>
                </div>
              </button>
            </div>
            {origin && destination && (
              <Button
                onClick={calculateRoute}
                data-testid="calculate-route-button"
                className="w-full bg-gradient-to-l from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700"
              >
                مسیریابی
              </Button>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Search Dialog */}
      <Dialog open={showSearch} onOpenChange={setShowSearch}>
        <DialogContent className="max-w-md" data-testid="search-dialog">
          <DialogHeader>
            <DialogTitle>
              {searchType === 'origin' ? 'انتخاب مبدا' : 'انتخاب مقصد'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div className="relative">
              <Search className="absolute right-3 top-3 w-5 h-5 text-gray-400" />
              <Input
                data-testid="search-location-input"
                placeholder="جستجو..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pr-10"
              />
            </div>
            <div className="max-h-64 overflow-y-auto space-y-2">
              {searchType === 'origin' && (
                <button
                  onClick={() => handleSelectLocation({ name: 'مکان فعلی', location: userLocation })}
                  data-testid="current-location-option"
                  className="w-full text-right p-3 hover:bg-gray-50 rounded-lg border border-gray-200 transition-colors"
                >
                  <div className="flex items-center space-x-2 space-x-reverse">
                    <Navigation className="w-5 h-5 text-teal-600" />
                    <span className="font-medium">مکان فعلی</span>
                  </div>
                </button>
              )}
              {filteredPOIs.map((poi) => (
                <button
                  key={poi.id}
                  onClick={() => handleSelectLocation({ name: poi.name, location: poi.location })}
                  data-testid={`poi-option-${poi.id}`}
                  className="w-full text-right p-3 hover:bg-gray-50 rounded-lg border border-gray-200 transition-colors"
                >
                  <div className="flex items-center space-x-2 space-x-reverse">
                    <MapPin className="w-5 h-5 text-gray-400" />
                    <div className="flex-1">
                      <p className="font-medium text-sm">{poi.name}</p>
                      <p className="text-xs text-gray-500">{poi.poi_type}</p>
                    </div>
                  </div>
                </button>
              ))}
              {filteredPOIs.length === 0 && searchQuery && (
                <div className="text-center py-8 text-gray-500">
                  <p>مکانی یافت نشد</p>
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}