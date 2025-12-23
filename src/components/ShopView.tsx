import { useState } from 'react';
import { ChevronDown, ArrowRight } from 'lucide-react';
import { restaurants, shops, relax } from '../Data/restaurantData'; // Pastikan 'relax' di-export dari file data Anda

interface ShopViewProps {
  currentAirport: {
    code: string;
    city: string;
    name: string;
  };
}

type CategoryTab = 'restaurants' | 'shops' | 'relax';

export default function ShopView({ currentAirport }: ShopViewProps) {
  const [activeCategory, setActiveCategory] = useState<CategoryTab>('restaurants');
  const [selectedFloor, setSelectedFloor] = useState<string>('all');
  const [selectedTerminal, setSelectedTerminal] = useState<string>('all');
  const [selectedFoodType, setSelectedFoodType] = useState<string>('all'); // Hanya untuk Restoran

  // --- 1. FILTERING LOGIC ---
  
  // Helper Filter Umum
  const filterData = (data: any[]) => {
    return data.filter(item => {
        if (item.airport !== currentAirport.code) return false;
        if (selectedFloor !== 'all' && item.floor !== selectedFloor) return false;
        if (selectedTerminal !== 'all' && item.terminal !== selectedTerminal) return false;
        return true;
    });
  };

  const filteredRestaurants = filterData(restaurants).filter(r => 
    selectedFoodType === 'all' || r.category === selectedFoodType
  );
  
  const filteredShops = filterData(shops);
  const filteredRelax = filterData(relax);
  const allDataInAirport = [...restaurants, ...shops, ...relax].filter(i => i.airport === currentAirport.code);
  
  const floors = ['all', ...Array.from(new Set(allDataInAirport.map(i => i.floor)))];
  const terminals = ['all', ...Array.from(new Set(allDataInAirport.map(i => i.terminal)))];
  
  const airportRestaurants = restaurants.filter(r => r.airport === currentAirport.code);
  const foodTypes = ['all', ...Array.from(new Set(airportRestaurants.map(r => r.category)))];

  let displayData: any[] = [];
  if (activeCategory === 'restaurants') displayData = filteredRestaurants;
  else if (activeCategory === 'shops') displayData = filteredShops;
  else if (activeCategory === 'relax') displayData = filteredRelax; 

  return (
    <div className="animate-fade-in bg-white rounded-r-xl rounded-bl-xl rounded-tl-none shadow-xl relative z-50 overflow-hidden">

      <div className="flex border-b border-gray-200 bg-white sticky top-0 z-10">
        {(['restaurants', 'shops', 'relax'] as CategoryTab[]).map((tab) => (
            <button
                key={tab}
                onClick={() => setActiveCategory(tab)}
                className={`flex-1 py-4 px-6 text-sm font-semibold transition-colors relative capitalize ${
                activeCategory === tab
                    ? 'text-blue-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
            >
                {tab === 'relax' ? 'Relax & Others' : tab}
                {activeCategory === tab && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600"></div>
                )}
            </button>
        ))}
      </div>

      <div className="p-6">
        {/* Filters */}
        <div className="flex gap-3 mb-6 flex-wrap">
            <div className="relative">
              <select
                value={selectedFloor}
                onChange={(e) => setSelectedFloor(e.target.value)}
                className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2 pr-10 text-sm font-medium text-gray-700 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent cursor-pointer"
              >
                {floors.map(floor => (
                  <option key={floor} value={floor}>
                    {floor === 'all' ? 'All Floors' : floor}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
            </div>

            <div className="relative">
              <select
                value={selectedTerminal}
                onChange={(e) => setSelectedTerminal(e.target.value)}
                className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2 pr-10 text-sm font-medium text-gray-700 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent cursor-pointer"
              >
                {terminals.map(terminal => (
                  <option key={terminal} value={terminal}>
                    {terminal === 'all' ? 'All Terminals' : terminal}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
            </div>

              {activeCategory === 'restaurants' && (
              <div className="relative">
                <select
                  value={selectedFoodType}
                  onChange={(e) => setSelectedFoodType(e.target.value)}
                  className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2 pr-10 text-sm font-medium text-gray-700 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent cursor-pointer"
                >
                  {foodTypes.map(type => (
                    <option key={type} value={type}>
                      {type === 'all' ? 'All Categories' : type}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
              </div>
            )}
        </div>

        <div className="space-y-4 pb-6">
            {displayData.length > 0 ? (
                displayData.map((item) => (
                <div
                    key={item.id}
                    className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg transition-shadow cursor-pointer group"
                >
                    <div className="flex gap-4 p-4">
                    <div className="w-32 h-24 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100 relative">
                        <img
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                        />
            
                      
                            
                        
                    </div>
                    <div className="flex-1 flex flex-col justify-between min-w-0">
                        <div>
                        <h3 className="font-bold text-gray-800 text-base mb-1 truncate">
                            {item.name}
                        </h3>
                        <div className="flex gap-3 text-xs text-gray-500">
                            <span>{item.floor}</span>
                            <span>•</span>
                            <span>{item.terminal}</span>
                        </div>
                        </div>
                       <a 
                        href="https://www.google.com/maps" 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="text-blue-600 text-xs font-semibold flex items-center gap-1 hover:gap-2 transition-all mt-2 group cursor-pointer"
                      >
                        View on map
                        <ArrowRight className="w-3 h-3" />
                      </a>
                    </div>
                    </div>
                </div>
                ))
            ) : (
                <div className="text-center py-20 text-gray-400">
                <p className="text-lg mb-2">No {activeCategory === 'relax' ? 'relax areas' : activeCategory} found</p>
                <p className="text-sm">
                    Try adjusting your filters or check another terminal
                </p>
                </div>
            )}
        </div>
      </div>
    </div>
  );
}