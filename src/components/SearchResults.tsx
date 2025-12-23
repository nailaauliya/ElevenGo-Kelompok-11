import { useState, useEffect } from 'react';
import { Flight } from '../lib/database.types';
import { FlightCard } from './FlightCard';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Plane, ArrowRight } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface SearchResultsProps {
  flights: Flight[]; // Menerima RAW DATA (Semua penerbangan)
  // Props untuk One Way / Round Trip
  origin?: string;
  destination?: string;
  departureDate?: string;
  
  // Props Baru untuk Multi City
  isMultiCity?: boolean;
  searchSegments?: { origin: string; destination: string; departureDate: string }[];

  onBack: () => void;
  // onBook sekarang bisa menerima satu Flight atau Array Flight
  onBook: (flightOrFlights: Flight | Flight[]) => void;
}

export const SearchResults = ({ 
  flights, 
  origin, destination, departureDate, 
  isMultiCity, searchSegments,
  onBack, onBook 
}: SearchResultsProps) => {
  
  const navigate = useNavigate();
  const { user } = useAuth();

  // --- STATE MULTI CITY ---
  const [currentSegmentIdx, setCurrentSegmentIdx] = useState(0); // Sedang pilih rute ke berapa?
  const [selectedMultiFlights, setSelectedMultiFlights] = useState<Flight[]>([]); // Simpan pesawat yg sudah dipilih

  // Tentukan rute yang sedang aktif (Multi City vs Normal)
  const activeOrigin = isMultiCity && searchSegments ? searchSegments[currentSegmentIdx].origin : origin;
  const activeDestination = isMultiCity && searchSegments ? searchSegments[currentSegmentIdx].destination : destination;
  const activeDateRaw = isMultiCity && searchSegments ? searchSegments[currentSegmentIdx].departureDate : departureDate;

  // --- STATE TAMPILAN ---
  const [activeDateStr, setActiveDateStr] = useState<string>(activeDateRaw || new Date().toISOString().split('T')[0]);
  const [displayFlights, setDisplayFlights] = useState<Flight[]>([]);
  const [selectedFlightId, setSelectedFlightId] = useState<string | null>(null);

  // Reset tanggal aktif saat pindah segment (Multi City)
  useEffect(() => {
    if (activeDateRaw) {
      setActiveDateStr(activeDateRaw);
    }
  }, [currentSegmentIdx, activeDateRaw]);

  // --- 1. GENERATE TANGGAL (DATE STRIP) ---
  const generateDates = (startDateStr: string) => {
    const dates = [];
    // Validasi tanggal agar tidak error
    const start = startDateStr && !isNaN(new Date(startDateStr).getTime()) ? new Date(startDateStr) : new Date();
    
    for (let i = 0; i < 7; i++) {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      const dateString = `${year}-${month}-${day}`;

      dates.push({
        dayName: d.toLocaleDateString('en-GB', { weekday: 'short' }),
        dateDisplay: d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }),
        fullDate: dateString,
      });
    }
    return dates;
  };

  const dateStrip = generateDates(activeDateStr);

 
  useEffect(() => {
    if (!flights) return;

    const filtered = flights.filter(f => {

        
       
        const flightDate = f.departure_time.substring(0, 10);
        const isDateMatch = !activeDateRaw || flightDate === activeDateStr;

     
        const isOriginMatch = !activeOrigin || f.origin.toLowerCase() === activeOrigin.toLowerCase();
        const isDestMatch = !activeDestination || f.destination.toLowerCase() === activeDestination.toLowerCase();

        return isDateMatch && isOriginMatch && isDestMatch;
    });

    setDisplayFlights(filtered);
    setSelectedFlightId(null); 
  }, [activeDateStr, flights, activeOrigin, activeDestination, activeDateRaw]);



  const handleSelect = (flight: Flight) => {
    // Toggle selection visual
    if (selectedFlightId === flight.id) {
      setSelectedFlightId(null);
    } else {
      setSelectedFlightId(flight.id);
    }
  };

  const handleContinue = () => {
    if (!selectedFlightId) return;

    // Cari object flight yang dipilih
    const chosenFlight = displayFlights.find(f => f.id === selectedFlightId);
    if (!chosenFlight) return;

    if (isMultiCity && searchSegments) {
        // === LOGIKA MULTI CITY ===
        const newSelection = [...selectedMultiFlights, chosenFlight];
        
        // Cek apakah ini rute terakhir?
        if (currentSegmentIdx < searchSegments.length - 1) {
            // BELUM SELESAI -> Lanjut ke Rute Berikutnya
            setSelectedMultiFlights(newSelection);
            setCurrentSegmentIdx(prev => prev + 1);
            
            // Scroll ke atas agar user sadar pindah rute
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } else {
            // SUDAH SELESAI -> Booking semua
            onBook(newSelection); // Kirim Array
        }
    } else {
        // === LOGIKA ONE WAY / ROUND TRIP ===
        onBook(chosenFlight); // Kirim Single Object
    }
  };

  // Helper text untuk tombol bawah
  const getButtonText = () => {
      if (!isMultiCity) return "Continue to check out →";
      if (searchSegments && currentSegmentIdx < searchSegments.length - 1) {
          return `Select Flight ${currentSegmentIdx + 2} →`; // Select Flight 2, 3...
      }
      return "Finish & Checkout →";
  };

  return (
    <div className="w-full bg-white pb-20 font-sans">
      
      {/* HEADER KUNING (INFO RUTE) */}
      <div className="bg-[#FFF8E7] border-b border-orange-100 py-4 px-6 md:px-12 mb-8 sticky top-16 z-40">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div>
              <div className="flex items-center gap-2 text-orange-400 font-bold text-lg mb-1">
                <span>
                    {isMultiCity ? `Flight ${currentSegmentIdx + 1}:` : 'Select flight:'}
                </span>
                {/* Tampilkan 'All Routes' jika tidak ada filter */}
                <span className="text-blue-900 underline decoration-blue-900/30">
                    {activeOrigin || 'Any'} <ArrowRight className="w-4 h-4 inline" /> {activeDestination || 'Any'}
                </span>
              </div>
              {isMultiCity && (
                  <p className="text-xs text-gray-500">
                      Step {currentSegmentIdx + 1} of {searchSegments?.length}
                  </p>
              )}
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6">
        
        {/* DATE STRIP (Hanya muncul jika user memilih tanggal spesifik) */}
        {/* Jika pencarian global (tanpa tanggal), kita sembunyikan date strip agar tidak membingungkan */}
        {activeDateRaw && (
            <div className="mb-8">
            <div className="flex items-center gap-3 text-gray-500 text-sm font-semibold mb-4">
                <Plane className="w-5 h-5 transform rotate-90" />
                <span>{activeOrigin}</span>
                <div className="h-[1px] w-20 bg-gray-300"></div>
                <span>{activeDestination}</span>
            </div>

            <div className="flex items-center bg-gray-100 p-1 rounded-lg overflow-x-auto">
                <button className="p-2 hover:bg-gray-200 rounded"><ChevronLeft className="w-4 h-4 text-gray-500"/></button>
                <div className="flex-1 flex justify-between gap-1 overflow-x-auto no-scrollbar">
                {dateStrip.map((item) => (
                    <button
                    key={item.fullDate}
                    onClick={() => setActiveDateStr(item.fullDate)}
                    className={`flex-1 min-w-[100px] py-2 px-1 text-center rounded text-xs transition-all border
                        ${activeDateStr === item.fullDate 
                        ? 'bg-white border-orange-400 text-gray-900 font-bold shadow-sm' 
                        : 'bg-transparent border-transparent text-gray-500 hover:bg-gray-200'}
                    `}
                    >
                    <div className="font-semibold">{item.dayName}, {item.dateDisplay}</div>
                    </button>
                ))}
                </div>
                <button className="p-2 hover:bg-gray-200 rounded"><ChevronRight className="w-4 h-4 text-gray-500"/></button>
            </div>
            </div>
        )}

        {/* DAFTAR PESAWAT */}
        <div className="space-y-4">
          {displayFlights.length === 0 ? (
            <div className="text-center py-16 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
              <p className="text-gray-500 font-medium">
                  No flights available {activeOrigin ? `from ${activeOrigin}` : ''} {activeDestination ? `to ${activeDestination}` : ''} {activeDateRaw ? `on ${activeDateStr}` : ''}.
              </p>
              <p className="text-sm text-gray-400 mt-1">Try selecting another date or route.</p>
            </div>
          ) : (
            displayFlights.map((flight) => (
              <FlightCard
                key={flight.id}
                flight={flight}
                isSelected={selectedFlightId === flight.id}
                onSelect={handleSelect}
              />
            ))
          )}
        </div>

        {/* CHECKOUT / NEXT BAR */}
        {selectedFlightId && (
          <div className="fixed bottom-0 left-0 w-full bg-white border-t border-gray-200 p-4 shadow-[0_-5px_20px_rgba(0,0,0,0.05)] z-50 animate-slide-up">
              <div className="max-w-6xl mx-auto flex justify-between items-center">
                <div className="text-sm hidden md:block">
                   <span className="text-gray-500">
                       <span className="font-bold text-gray-900">Total: </span> 
                       {/* Estimasi Harga Sederhana */}
                       <span className="text-orange-500 font-bold">
                           IDR {new Intl.NumberFormat('id-ID').format(
                               (displayFlights.find(f => f.id === selectedFlightId)?.price || 0) +
                               (selectedMultiFlights.reduce((acc, curr) => acc + curr.price, 0))
                           )}
                       </span>
                   </span>
                </div>
                <div className="flex-1 md:flex-none flex justify-end">
                  <button 
                    onClick={handleContinue}
                    className="bg-blue-900 text-white px-8 py-3 rounded font-bold hover:bg-blue-800 transition-colors flex items-center gap-2 shadow-lg"
                  >
                    {getButtonText()}
                  </button>
                </div>
             </div>
          </div>
        )}

      </div>
      
      {/* TOMBOL KEMBALI */}
      <div className="max-w-6xl mx-auto px-6 mt-8">
        <button onClick={onBack} className="text-gray-500 underline text-sm">← Back to Search</button>
      </div>
    </div>
  );
};