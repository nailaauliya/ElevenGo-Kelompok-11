import { useState, useEffect } from 'react';
import {
  Search, Plane, CloudRain, Check, X, User,
  AlertCircle, Lightbulb, LifeBuoy, Accessibility,
  ArrowRight, ChevronDown,
  Ticket, MapPin, Wine,Footprints
} from 'lucide-react';
import Header from '../components/Header';
import MapView from '../components/MapView';
import ShopView from '../components/ShopView';
import { useLocation } from 'react-router-dom';
import Footer from '../components/Footer';
import api from '../lib/axios';

const airports = [
  { code: 'YIA', city: 'Yogyakarta', name: 'Yogyakarta Intl Airport' },
  { code: 'CGK', city: 'Jakarta', name: 'Soekarno-Hatta Intl Airport' },
  { code: 'DPS', city: 'Bali', name: 'Ngurah Rai Intl Airport' },
  { code: 'SUB', city: 'Surabaya', name: 'Juanda Intl Airport' },
  { code: 'KUL', city: 'Malaysia', name: 'Kuala lumpur Intl Airport' },
  { code: 'HND', city: 'Jepang', name: 'Tokyo Haneda Intl Airport' },
  { code: 'ICN', city: 'Korea', name: 'Icheon Intl Airport' },
];

export default function FlightStatus() {
  const [searchQuery, setSearchQuery] = useState('');
  const [currentAirport, setCurrentAirport] = useState(airports[0]);
  const [foundFlight, setFoundFlight] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'departures' | 'arrivals'>('departures');
  
  const [showCheckpoints, setShowCheckpoints] = useState(false);
  
  const [activeSidebar, setActiveSidebar] = useState<'flight' | 'map' | 'shop'>('flight');
  const [allFlights, setAllFlights] = useState<any[]>([]); 
  const [loading, setLoading] = useState(true);

  const location = useLocation();

  useEffect(() => {
    if (location.state?.activeSidebar) {
      setActiveSidebar(location.state.activeSidebar);
    }
  }, [location.state]);


  useEffect(() => {
    fetchFlights();
  }, []);

  const fetchFlights = async () => {
    try {
      setLoading(true);
      const response = await api.get('/flights'); 
      
      let flightsData = [];
      if (Array.isArray(response.data)) {
          flightsData = response.data;
      } else if (response.data && Array.isArray(response.data.data)) {
          flightsData = response.data.data;
      }

      const mappedFlights = flightsData.map((f: any) => ({
        id: f.id,
        
        origin: `${f.origin} (${f.origin_code})`,           
        destination: `${f.destination} (${f.destination_code})`, 

        rawOrigin: f.origin_code,
        rawDestination: f.destination_code,
        
        time: f.departure_time ? new Date(f.departure_time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit', hour12: false}) : "00:00",
        arrival: f.arrival_time ? new Date(f.arrival_time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit', hour12: false}) : "00:00",
        
        flight: f.flight_number || f.flight_code,      
        
        gate: f.gate || ['G2', 'F4', '1A', '31'][Math.floor(Math.random() * 4)], 
        status: f.status || ['On Time', 'Delayed', 'Boarding'][Math.floor(Math.random() * 3)], 
        terminal: f.terminal || ['1', '2', '3'][Math.floor(Math.random() * 3)]
      }));

      setAllFlights(mappedFlights);
    } catch (error) {
      console.error("Gagal mengambil jadwal penerbangan:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    const query = searchQuery.trim().toUpperCase();
    if (!query) return;
    const airportMatch = airports.find(a => a.code === query || a.city.toUpperCase() === query);

    if (airportMatch) {
      setCurrentAirport(airportMatch);
      setFoundFlight(null);
      window.scrollTo({ top: 500, behavior: 'smooth' });
    } else {
      const flightMatch = allFlights.find(f => f.flight === query);
      if (flightMatch) {
        setFoundFlight(flightMatch);
        const originAirport = airports.find(a => a.code === flightMatch.rawOrigin);
        if (originAirport) setCurrentAirport(originAirport);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        alert(`Flight or Airport "${query}" not found.`);
      }
    }
  };

  const handleClear = () => {
    setSearchQuery('');
    setFoundFlight(null);
    setShowCheckpoints(false);
    if(activeSidebar === 'map' || activeSidebar === 'shop') setActiveSidebar('flight');
  };

  const scheduleData = allFlights.filter(f => {
    if (activeTab === 'departures') {
      return f.rawOrigin === currentAirport.code;
    } else {
      return f.rawDestination === currentAirport.code;
    }
  });

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 font-sans">
      
      <div className="bg-white sticky top-0 z-50">
        <Header activePage={activeSidebar} />
      </div>

      <div className="flex-grow relative w-full">
        
        <div className="absolute top-0 left-0 w-full h-[500px] z-0">
          <img 
            src="/images/pesawat3.jpg" 
            alt="Flight Header" 
            className="w-full h-full object-cover scale-x-[-1]" 
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/20 to-gray-50"></div>
        </div>

        <div className="relative z-10 mt-40 w-full px-4 pt-16 flex justify-center items-start">

          <div className="flex flex-col md:flex-row w-full md:w-auto items-center md:items-start gap-6 md:gap-0">

            <div className="flex flex-row md:flex-col gap-3 md:gap-1 mt-0 flex-shrink-0 z-10 w-full md:w-auto justify-center md:justify-start md:-mr-1">
               <button onClick={() => setActiveSidebar('flight')} className={`w-14 h-14 md:w-16 md:h-16 rounded-xl md:rounded-l-xl md:rounded-r-none flex items-center justify-center transition-all duration-200 border-0 outline-none shadow-md ${activeSidebar === 'flight' ? 'bg-[#FF8C00] text-white z-30 md:translate-x-1 scale-110 md:scale-100' : 'bg-white/90 md:bg-gray-200/90 text-gray-600 hover:bg-white hover:text-orange-500 z-20'}`}><Ticket className="w-6 h-6 md:w-7 md:h-7 pointer-events-none" /></button>
               <button onClick={() => setActiveSidebar('map')} className={`w-14 h-14 md:w-16 md:h-16 rounded-xl md:rounded-l-xl md:rounded-r-none flex items-center justify-center transition-all duration-200 border-0 outline-none shadow-md ${activeSidebar === 'map' ? 'bg-[#FF8C00] text-white z-30 md:translate-x-1 scale-110 md:scale-100' : 'bg-white/90 md:bg-gray-200/90 text-gray-600 hover:bg-white hover:text-orange-500 z-20'}`}><MapPin className="w-6 h-6 md:w-7 md:h-7 pointer-events-none" /></button>
               <button onClick={() => setActiveSidebar('shop')} className={`w-14 h-14 md:w-16 md:h-16 rounded-xl md:rounded-l-xl md:rounded-r-none flex items-center justify-center transition-all duration-200 border-0 outline-none shadow-md ${activeSidebar === 'shop' ? 'bg-[#FF8C00] text-white z-30 md:translate-x-1 scale-110 md:scale-100' : 'bg-white/90 md:bg-gray-200/90 text-gray-600 hover:bg-white hover:text-orange-500 z-20'}`}><Wine className="w-6 h-6 md:w-7 md:h-7 pointer-events-none" /></button>
            </div>

     
            <div className="w-full md:w-[1000px] min-w-0">
              {foundFlight && (
                  <div className="animate-fade-in-up">
                    <div className="bg-white rounded-xl md:rounded-r-xl md:rounded-bl-xl md:rounded-tl-none shadow-xl p-6 md:p-8 mb-4 relative z-50">
                      <div className="relative mb-8">
                        <div className="flex items-center border border-gray-300 rounded-md overflow-hidden p-1 bg-gray-50">
                            <div className="pl-3 pr-2 text-green-500"><Check size={20} /></div>
                            <input type="text" value={searchQuery} readOnly className="flex-1 outline-none text-gray-700 font-medium bg-transparent"/>
                            <button onClick={handleClear} className="p-2 text-gray-400 hover:text-gray-600"><X size={20}/></button>
                            <button className="bg-orange-500 hover:bg-orange-600 text-white p-2 rounded transition-colors"><Search size={20} /></button>
                        </div>
                      </div>

                      <div className="flex flex-col md:flex-row justify-between items-start mb-8 border-b border-gray-100 pb-8 gap-4">
                          <div>
                            <h1 className="text-xl md:text-2xl font-bold text-gray-800 flex items-center gap-2">
                                Departure to {foundFlight.destination.split('(')[0]} <Plane className="text-gray-800 transform rotate-45" size={24} />
                            </h1>
                            <p className="text-sm text-gray-500 mt-1">Thursday, March 24, 2022</p>
                          </div>
                          <div className="text-left md:text-right w-full md:w-auto flex flex-row md:flex-col justify-between items-center md:items-end">
                            <div className="flex items-center gap-2 justify-end text-gray-600"><CloudRain size={24} /><span className="text-xl font-bold">Weather</span></div>
                            <p className="text-sm text-gray-500 mt-1">29°C</p>
                          </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
                          <div>
                            <p className="text-gray-400 text-lg mb-1">Arrival time</p>
                            <p className="text-gray-800 font-bold mb-2">{foundFlight.arrival}</p>
                            <span className={`px-3 py-1 rounded-full text-xs font-bold text-white ${foundFlight.status === 'Delayed' ? 'bg-red-500' : 'bg-[#00C058]'}`}>
                              {foundFlight.status}
                            </span>
                          </div>
                          <div>
                            <p className="text-gray-400 text-lg mb-1">Gate</p>
                            <div className="flex items-center gap-1 text-orange-500 font-bold">
                                <span>{foundFlight.gate}</span><span className="text-xs border border-orange-500 px-1 rounded">↗</span>
                            </div>
                            <p className="text-xs text-gray-500 mt-1">Terminal {foundFlight.terminal}</p>
                          </div>
                          <div>
                            <p className="text-gray-400 text-lg mb-1">Live status</p>
                            <p className="text-gray-800 font-medium text-sm">{foundFlight.status === 'Delayed' ? 'Rescheduled' : 'On air'}</p>
                          </div>
                      </div>
                    </div>
                  </div>
              )}


      
              {activeSidebar === 'flight' && (
                <>
              
                  {foundFlight ? (
                    <div className="animate-fade-in-up">
                  
                      {foundFlight.status !== 'Delayed' && (
                        <div className="bg-white shadow-sm p-6 md:p-8 mb-4 relative rounded-xl transition-all duration-300">
                          
                            <div className="absolute top-6 right-6 text-gray-400"><User size={24}/></div>
                            
                            <h2 className="text-xl font-bold text-gray-700 mb-6">Security checkpoint</h2>
                            
                  
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                              <div className="flex justify-between md:block">
                                  <p className="text-gray-500 text-sm font-bold mb-1">Recommended security checkpoint</p>
                                  <p className="text-[#00C058] font-bold text-lg">A33</p>
                              </div>
                              <div className="flex justify-between md:block">
                                  <p className="text-gray-500 text-sm font-bold mb-1">Recommended arrival time at checkpoint</p>
                                  <p className="text-blue-600 font-bold text-lg">11:00 AM</p>
                              </div>
                              <div className="flex justify-between md:block">
                                  <p className="text-gray-500 text-sm font-bold mb-1">Estimated wait time</p>
                                  <p className="text-blue-600 font-bold text-lg">12 minutes</p>
                              </div>
                            </div>

                      
                            <div className="text-center mb-4">
                              <button onClick={() => setShowCheckpoints(!showCheckpoints)} className="text-orange-500 text-xs font-bold hover:underline flex items-center justify-center gap-1 mx-auto">
                                See other security checkpoints <ChevronDown className={`w-4 h-4 transition-transform ${showCheckpoints ? 'rotate-180' : ''}`} />
                              </button>
                            </div>

                          
                            {showCheckpoints && (
                              <div className="bg-gray-50 rounded-lg overflow-hidden border border-gray-100 animate-slide-down">
                                {[{ gate: 'B31', time: '32 minutes' }, { gate: 'B34', time: '22 minutes' }, { gate: 'B35', time: '19 minutes' }, { gate: 'B36', time: '18 minutes' }, { gate: 'B38', time: '16 minutes' }].map((row, idx) => (
                                  <div key={idx} className="flex justify-between px-6 py-3 border-b border-gray-200 last:border-0 hover:bg-gray-100 transition-colors">
                                      <div><p className="text-xs text-gray-500 font-semibold">Checkpoint</p><p className="text-sm font-bold text-gray-700">{row.gate}</p></div>
                                      <div className="text-right"><p className="text-xs text-gray-500 font-semibold">Estimated wait time</p><p className="text-sm font-bold text-gray-600">{row.time}</p></div>
                                  </div>
                                ))}
                              </div>
                            )}
                        </div>
                      )}

                    
                        <div className="pt-0 px-8 pb-8 bg-gray-50 flex items-center justify-center">
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl w-full">
                          <InfoCard 
                              icon={
                                  <img 
                                      src="/icon/langkah.png" 
                                      alt="footprint pattern"
                                      className="absolute bottom-0 right-0 h-[100%] w-auto object-contain object-right-bottom opacity-90 pointer-events-none" 
                                  />
                              } 
                              isFullBackground={true}
                              title="Lost luggage?" 
                              desc="Don't worry, we will find it!" 
                              footer="If you are in this situation please follow these steps" 
                          />
                          <InfoCard 
                              icon={<Lightbulb size={55} strokeWidth={2} />} 
                              title="First time flying?" 
                              desc="We will take care of you :)" 
                              footer="Here are some tips for you" 
                          />
                          <InfoCard 
                              icon={<LifeBuoy size={55} strokeWidth={2} />} 
                              title="Need urgent help in the airport?" 
                              desc="Contact the airport" 
                              footer="This is an emergency number" 
                          />
                          <InfoCard 
                              icon={<Accessibility size={55} strokeWidth={2} />} 
                              title="Need special asistance?" 
                              desc="Contact the airline" 
                              footer="" 
                          />

                        </div>
                      </div>
                    </div>
                  ) : (
                  
                    <div className="animate-fade-in w-full">
                      <div className="w-full flex justify-center relative z-10 mb-8">
                        <div className="bg-white w-full md:w-[99%] h-auto md:h-[200px] rounded-xl md:rounded-r-xl md:rounded-bl-none md:rounded-tl-none shadow-xl p-4">
                            <div className="relative flex items-center border border-gray-300 rounded-md overflow-hidden shadow-md p-1 bg-gray-50 px-3 h-12">
                              <input
                                  type="text"
                                  placeholder="Enter Flight Number (e.g. GA452) or Airport Code (e.g. CGK)"
                                  value={searchQuery}
                                  onChange={(e) => setSearchQuery(e.target.value)}
                                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                                  className="flex-1 h-full text-gray-600 placeholder-gray-400 outline-none bg-transparent w-full"
                              />
                              {searchQuery && (
                                  <button onClick={handleClear} className="p-2 text-gray-400 hover:text-gray-600"><X size={20}/></button>
                              )}
                              <button onClick={handleSearch} className="bg-orange-500 hover:bg-orange-600 text-white p-2 rounded transition-colors"><Search size={20} /></button>
                            </div>
                            <p className="text-xs text-gray-500 mt-3 px-2">
                                Kode Bandara buat mencari jadwal bandara(CGK, DPS, YIA, SUB, ICN, KUL, HND) atau Nomor Penerbangan (GA452, AB1234)
                            </p>
                        </div>
                      </div>

                      <div className="bg-white rounded-xl shadow-xl min-h-[500px] p-6 md:p-8 relative z-50 w-full">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4">
                            <div>
                              <h2 className="text-lg font-bold text-gray-700">{currentAirport.code} Airport's flights</h2>
                              <div className="flex gap-6 mt-4">
                                  <label className="flex items-center gap-2 cursor-pointer group">
                                    <input type="radio" name="flightTab" checked={activeTab === 'departures'} onChange={() => setActiveTab('departures')} className="w-4 h-4 text-orange-500 border-gray-300 focus:ring-orange-500"/>
                                    <span className={`text-sm font-medium ${activeTab === 'departures' ? 'text-gray-700' : 'text-gray-400 group-hover:text-gray-600'}`}>Departures</span>
                                  </label>
                                  <label className="flex items-center gap-2 cursor-pointer group">
                                    <input type="radio" name="flightTab" checked={activeTab === 'arrivals'} onChange={() => setActiveTab('arrivals')} className="w-4 h-4 text-orange-500 border-gray-300 focus:ring-orange-500"/>
                                    <span className={`text-sm font-medium ${activeTab === 'arrivals' ? 'text-gray-700' : 'text-gray-400 group-hover:text-gray-600'}`}>Arrivals</span>
                                  </label>
                              </div>
                            </div>
                            <span className="text-xs text-gray-400">{currentAirport.name}</span>
                        </div>

                        <div className="grid grid-cols-12 text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2 px-4 border-b border-gray-100 pb-2">
                            <div className="col-span-3 md:col-span-2">Time</div>
                            <div className="col-span-4 md:col-span-4">{activeTab === 'departures' ? 'Destination' : 'Origin'}</div>
                            <div className="col-span-3 md:col-span-2">Flight</div>
                            <div className="hidden md:block col-span-2">Gate</div>
                            <div className="col-span-2 text-right"></div>
                        </div>

                        <div className="space-y-1">
                            {loading ? (
                                <div className="text-center py-12 text-gray-400 text-sm">Loading flights...</div>
                            ) : scheduleData.length > 0 ? (
                              scheduleData.map((flight, index) => (
                                <div key={flight.id} className={`grid grid-cols-12 items-center px-4 py-3 rounded-lg hover:shadow-sm transition-all cursor-pointer group ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}`}>
                                    <div className="col-span-3 md:col-span-2 text-gray-600 font-medium text-sm">{activeTab === 'departures' ? flight.time : flight.arrival}</div>
                                    <div className="col-span-4 md:col-span-4 text-gray-700 font-semibold text-sm truncate pr-2" title={activeTab === 'departures' ? flight.destination : flight.origin}>
                                        {activeTab === 'departures' ? flight.destination : flight.origin}
                                    </div>
                                    <div className="col-span-3 md:col-span-2 text-gray-500 font-mono text-xs">{flight.flight}</div>
                                    <div className="hidden md:block col-span-2 text-gray-500 text-sm pl-2">{flight.gate || '-'}</div>
                                    <div className="col-span-2 flex items-center justify-end gap-2 md:gap-4">
                                      <div className={`w-2 h-2 rounded-full ${flight.status === 'On Time' ? 'bg-green-500' : flight.status === 'Delayed' ? 'bg-red-500' : 'bg-yellow-500'}`}></div>
                                      <span className="hidden md:flex text-orange-500 text-xs font-bold items-center hover:underline">Details <ArrowRight className="w-3 h-3 ml-1" /></span>
                                    </div>
                                </div>
                              ))
                            ) : (
                              <div className="text-center py-12 text-gray-400 text-sm italic">
                                No flights scheduled for this time at {currentAirport.code}.
                              </div>
                            )}
                        </div>

                        <div className="mt-6 text-center border-t border-gray-100 pt-4">
                            <button className="text-blue-500 font-bold text-sm flex items-center justify-center gap-1 mx-auto hover:underline">See more <ChevronDown className="w-4 h-4" /></button>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}

              {activeSidebar === 'map' && (
                <div className="bg-white rounded-r-xl rounded-bl-xl shadow-lg overflow-hidden border border-gray-100">
                    <MapView currentAirport={currentAirport} />
                </div>
              )}

              {activeSidebar === 'shop' && (
                <div className="bg-white rounded-r-xl rounded-bl-xl shadow-lg border border-gray-100">
                   <ShopView currentAirport={currentAirport} />
                </div>
              )}

            </div>
          </div>
        </div>

      </div>

      <Footer />
    </div>
  );
}

function InfoCard({ icon, title, desc, footer, isFullBackground = false }: { icon: any, title: string, desc: string, footer: string, isFullBackground?: boolean }) {
  return (
    <div className="bg-[#FFDE7D] p-6 rounded-2xl relative overflow-hidden min-h-[200px] flex flex-col justify-between hover:shadow-md transition-shadow cursor-pointer">
       
       <div className="relative z-10">
          <h3 className="font-bold text-blue-900 text-lg mb-2 leading-tight">{title}</h3>
          <p className="text-sm text-slate-700 font-medium mb-4 leading-relaxed">{desc}</p>
       </div>
       
       <div className="relative z-10 mt-auto">
         {footer && (
            <p className="text-[12px] text-slate-600 max-w-[80%] leading-tight font-medium">{footer}</p>
         )}
       </div>

       {isFullBackground ? (
          icon 
       ) : (
          <div className="absolute bottom-5 right-5 text-orange-500">
            {icon}
          </div>
       )}
    </div>
  );
}