import { useState, useMemo, useEffect } from 'react';
import { MapContainer, ImageOverlay, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Search, Bus, Car, ParkingCircle, Users, Banknote, ShoppingBag, UtensilsCrossed, Heart } from 'lucide-react';

const DEFAULT_MAP =
  "https://staticmap.openstreetmap.de/staticmap.php?center=-6.97,110.42&zoom=12&size=600x400&markers=-6.97,110.42,red-pushpin";

const airportMaps: Record<string, Record<number, string>> = {
  'CGK': {
    1: '/images/CGK.png', 
    2: '/images/CGK.png' 
  },
  'DPS': {
    1: '/images/DPS.png',
    2: '/images/DPS.png'
  },
  'YIA': {
    1: '/images/mapYIA.png',
    2: '/images/mapYIA.png'
  },
  'ICN': {
    1: '/images/koreamap.jpg',
    2: '/images/koreamap.jpg'
  },
  'KUL': {
    1: '/images/Kuala.jpg',
    2: '/images/Kuala.jpg'
  },
  'SUB': {
    1: '/images/SUB.jpg',
    2: '/images/SUB.jpg'
  },
  'HND': {
    1: '/images/tokyomap.jpg',
    2: '/images/tokyomap.jpg'
  },
   'DEFAULT': {
    1: "https://staticmap.openstreetmap.de/staticmap.php?center=-6.97,110.42&zoom=12&size=600x400",
    2: 'https://thumbs.dreamstime.com/b/airport-terminal-plan-top-view-vector-illustration-flat-style-73608752.jpg'
  }
  
};

interface MapViewProps {
  currentAirport: {
    code: string;
    city: string;
    name: string;
  };
}

interface Facility {
  id: number;
  name: string;
  type: string;
  floor: number;
  terminal: string;
  position: [number, number]; 
}

const facilities: Facility[] = [
  { id: 1, name: 'Musholla A', type: 'musholla', floor: 1, terminal: 'A', position: [60,100] },
  { id: 2, name: 'Musholla B', type: 'musholla', floor: 2, terminal: 'A', position: [60, 68] },
  { id: 3, name: 'Restroom 1A', type: 'restroom', floor: 1, terminal: 'A', position: [25, 110] },
  { id: 4, name: 'Restroom 2B', type: 'restroom', floor: 2, terminal: 'B', position: [30, 60] },
  { id: 5, name: 'ATM Terminal A', type: 'atm', floor: 1, terminal: 'A', position: [45, 115] },
  { id: 6, name: 'ATM Terminal B', type: 'atm', floor: 2, terminal: 'B', position: [40, 100] },
  { id: 7, name: 'Kopi kenangan', type: 'restaurant', floor: 1, terminal: 'A', position: [60, 70] },
  { id: 8, name: 'Kopi kenangan cabang 2', type: 'restaurant', floor: 2, terminal: 'B', position: [65, 100] },
  { id: 9, name: 'Minimarket', type: 'shop', floor: 1, terminal: 'A', position: [70, 45] },
  { id: 10, name: 'Duty Free', type: 'shop', floor: 2, terminal: 'B', position: [70, 150] },
  { id: 11, name: 'Taxi Stand', type: 'taxi', floor: 1, terminal: 'A', position: [10, 70] },
  { id: 12, name: 'Bus Terminal', type: 'transit', floor: 1, terminal: 'A', position: [70, 150] },
  { id: 13, name: 'Parking Area A', type: 'parking', floor: 1, terminal: 'A', position: [40, 50] },
];

const categories = [
  { id: 'transit', name: 'Public Transit', icon: Bus, color: 'bg-blue-500' },
  { id: 'taxi', name: 'Taxi rank', icon: Car, color: 'bg-yellow-500' },
  { id: 'parking', name: 'Parking', icon: ParkingCircle, color: 'bg-blue-600' },
  { id: 'restroom', name: 'Restrooms', icon: Users, color: 'bg-red-500' },
  { id: 'atm', name: 'ATMs', icon: Banknote, color: 'bg-green-500' },
  { id: 'shop', name: 'Shops', icon: ShoppingBag, color: 'bg-pink-500' },
  { id: 'restaurant', name: 'Restaurants', icon: UtensilsCrossed, color: 'bg-orange-500' },
  { id: 'musholla', name: 'Musholla', icon: Heart, color: 'bg-purple-500' },
];

const createCustomIcon = (type: string) => {
  const category = categories.find(c => c.id === type);
  const colorClass = category ? category.color : 'bg-gray-500';
  
  return L.divIcon({
    className: 'custom-icon',
    html: `<div class="${colorClass} w-6 h-6 rounded-full border-2 border-white shadow-md flex items-center justify-center transform transition-transform hover:scale-125">
             <div class="w-1.5 h-1.5 bg-white rounded-full"></div>
           </div>`,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
    popupAnchor: [0, -12]
  });
};

// --- LOGIC RESPONSIVE MAP ---
const MapController = ({ bounds }: { bounds: L.LatLngBoundsExpression }) => {
  const map = useMap();

  useEffect(() => {
    // Timeout untuk memastikan container sudah punya ukuran sebelum map render
    const timer = setTimeout(() => {
      map.invalidateSize();
      map.fitBounds(bounds, { padding: [0, 0], animate: false });
    }, 200);

    // Deteksi Mobile vs Desktop sederhana (width < 768px = Mobile)
    const isMobile = window.innerWidth < 768;

    if (isMobile) {
        // MOBILE: Kunci interaksi agar user bisa scroll halaman
        map.dragging.disable();
        map.touchZoom.disable();
        map.doubleClickZoom.disable();
        map.scrollWheelZoom.disable();
    } else {
       
        map.dragging.enable();
        map.touchZoom.enable();
        map.doubleClickZoom.enable();
        map.scrollWheelZoom.enable();
    }
    
    return () => clearTimeout(timer);
  }, [map, bounds]);
  
  return null;
};

export default function MapView({ currentAirport }: MapViewProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFloor, setSelectedFloor] = useState(1);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [locationSearch, setLocationSearch] = useState('');

  const currentMapImage = useMemo(() => {
    const maps = airportMaps[currentAirport.code] || airportMaps['DEFAULT'];
    return maps[selectedFloor] || maps[1]; 
  }, [currentAirport.code, selectedFloor]);

  const mapBounds: L.LatLngBoundsExpression = [[0, 0], [100, 180]];

  const toggleCategory = (categoryId: string) => {
    setLocationSearch(''); 
    if (selectedCategories.includes(categoryId)) {
      setSelectedCategories(selectedCategories.filter(c => c !== categoryId));
    } else {
      setSelectedCategories([...selectedCategories, categoryId]);
    }
  };

  const handleQuickFilter = (keyword: string) => {
    setLocationSearch(keyword);
    setSelectedCategories([]);
    const targetFacility = facilities.find(f => f.name.toLowerCase() === keyword.toLowerCase());
    if (targetFacility) {
      setSelectedFloor(targetFacility.floor);
    } 
  };

  const filteredFacilities = facilities.filter(facility => {
    const matchesFloor = facility.floor === selectedFloor;
    const matchesCategory = selectedCategories.length === 0 || selectedCategories.includes(facility.type);
    const matchesSearch = locationSearch === '' ||
      facility.name.toLowerCase().includes(locationSearch.toLowerCase()) ||
      facility.type.toLowerCase().includes(locationSearch.toLowerCase());
    return matchesFloor && matchesCategory && matchesSearch;
  });

  const quickFilters = ['Gate 3', 'Kopi kenangan', 'Restaurants', 'Terminal B', 'Minimarket', 'Terminal A', 'Parking Area A', 'Musholla A'];

  return (
    <div className="animate-fade-in w-full flex flex-col gap-3">
      <div className="bg-white rounded-none shadow-xl overflow-hidden relative z-50 w-full">
        
        {/* CONTAINER UTAMA */}
        <div className="flex flex-col md:flex-row w-full">
        
   
          <div className="w-full md:w-80 h-[300px] md:h-[600px] border-r border-gray-200 bg-gray-50 flex flex-col flex-shrink-0">
            <div className="p-4 border-b border-gray-200">
              <h3 className="text-sm font-medium text-gray-500 mb-2">{currentAirport.name}</h3>
              <div className="flex items-center gap-2 border border-gray-300 rounded-lg p-2 bg-white">
                <Search size={16} className="text-gray-400" />
                <input
                  type="text"
                  placeholder="Search POI..."
                  value={locationSearch}
                  onChange={(e) => setLocationSearch(e.target.value)}
                  className="flex-1 outline-none text-sm"
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-3">
              <div className="grid grid-cols-2 md:grid-cols-1 gap-2">
                {categories.map((category) => {
                  const Icon = category.icon;
                  const isSelected = selectedCategories.includes(category.id);
                  return (
                    <button
                      key={category.id}
                      onClick={() => toggleCategory(category.id)}
                      className={`w-full flex items-center gap-3 p-3 rounded-lg transition-all ${
                        isSelected ? 'bg-orange-50 border-2 border-orange-500' : 'bg-white border border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className={`${category.color} p-2 rounded-lg flex items-center justify-center`}>
                        <Icon size={20} className="text-white" />
                      </div>
                      <span className={`text-sm font-medium ${isSelected ? 'text-orange-600' : 'text-gray-700'}`}>
                        {category.name}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          
          <div className="w-full md:flex-1 h-[500px] md:h-[600px] relative flex flex-col">
            
            {/* Header Map */}
            <div className="bg-white px-6 py-3 border-b border-gray-200 flex items-center justify-between z-[1000] relative">
              <h2 className="text-lg font-bold text-gray-800">Terminal Map - {currentAirport.code}</h2>
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium text-gray-600">Floor:</label>
                <select
                  value={selectedFloor}
                  onChange={(e) => setSelectedFloor(Number(e.target.value))}
                  className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm font-medium bg-white cursor-pointer shadow-sm focus:ring-2 focus:ring-orange-300 outline-none"
                >
                  <option value={1}>Level 1 (Arrival)</option>
                  <option value={2}>Level 2 (Departure)</option>
                </select>
              </div>
            </div>

            <div className="flex-1 relative bg-white z-0 w-full h-full">
              <MapContainer
                crs={L.CRS.Simple}
                zoomControl={false} 
                attributionControl={false}
                style={{ height: '100%', width: '100%', background: '#ffffff' }}
              >
                <MapController bounds={mapBounds} />

                <ImageOverlay
                  url={currentMapImage}
                  bounds={mapBounds}
                />

                {filteredFacilities.map((facility) => (
                  <Marker
                    key={facility.id}
                    position={facility.position}
                    icon={createCustomIcon(facility.type)}
                  >
                    <Popup>
                        <div className="text-center">
                          <h4 className="font-bold text-gray-800">{facility.name}</h4>
                          <p className="text-xs text-gray-500">Terminal {facility.terminal} - Lvl {facility.floor}</p>
                          <span className="inline-block mt-1 px-2 py-0.5 bg-blue-100 text-blue-800 text-[10px] rounded-full capitalize">{facility.type}</span>
                        </div>
                    </Popup>
                  </Marker>
                ))}
              </MapContainer>
            </div>

            {/* Footer Filter */}
            <div className="bg-white border-t border-gray-200 p-4 relative z-10">
              <div className="flex flex-wrap gap-2">
                {quickFilters.map((filter, idx) => {
                   const isActive = locationSearch === filter;
                   return (
                    <button 
                      key={idx} 
                      onClick={() => handleQuickFilter(filter)}
                      className={`px-3 py-1.5 border rounded-full text-xs font-medium transition-colors ${
                        isActive 
                        ? 'bg-orange-100 border-orange-400 text-orange-700' 
                        : 'bg-gray-100 border-gray-200 text-gray-700 hover:bg-orange-50 hover:border-orange-300 hover:text-orange-600'
                      }`}
                    >
                      {filter}
                    </button>
                   );
                })}
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}