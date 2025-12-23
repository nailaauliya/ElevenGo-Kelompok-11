import { useState, useEffect, useRef } from 'react';
import  BookingProcess from '../pages/BookingProcess';
import { SearchResults } from '../components/SearchResults'; 
import type { Flight } from '../lib/database.types';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from "react-router-dom";
import { AlertTriangle, MapPin, Smartphone, Award, Plane, Calendar as CalendarIcon, ChevronDown, Plus, Minus, X, ArrowRight, ArrowLeftRight, GitMerge, ChevronLeft, ChevronRight, Check } from 'lucide-react'; 
import Header from '../components/Header';
import Footer from '../components/Footer';

// --- 1. KOMPONEN KALENDER (TIDAK BERUBAH) ---
interface CalendarModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (date: string) => void;
  selectedDate: string;
}

const CalendarModal = ({ isOpen, onClose, onSelect, selectedDate }: CalendarModalProps) => {
  if (!isOpen) return null;

  const [currentDate, setCurrentDate] = useState(selectedDate ? new Date(selectedDate) : new Date());
  const [tempSelectedDate, setTempSelectedDate] = useState(selectedDate ? new Date(selectedDate) : new Date());
  const daysID = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];
  const monthsID = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const days = new Date(year, month + 1, 0).getDate();
    const firstDay = new Date(year, month, 1).getDay();
    return { days, firstDay, year, month };
  };

  const { days, firstDay, year, month } = getDaysInMonth(currentDate);
  const today = new Date();

  const handleDateClick = (day: number) => {
    const newDate = new Date(year, month, day);
    setTempSelectedDate(newDate);
  };

  const handleSave = () => {
    const offset = tempSelectedDate.getTimezoneOffset(); 
    const date = new Date(tempSelectedDate.getTime() - (offset*60*1000)); 
    onSelect(date.toISOString().split('T')[0]); 
    onClose();
  };

  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));
  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));

  return (
    <div className="absolute top-full left-0 mt-2 z-[9999] w-72 bg-white rounded-xl shadow-xl border border-gray-200 overflow-hidden animate-fade-in-down">
      <div className="px-4 py-3 border-b border-gray-50 flex justify-between items-center bg-white">
        <h3 className="text-sm font-semibold text-gray-700">Atur Tanggal</h3>
        <button type="button" onClick={onClose}><X className="w-4 h-4 text-gray-400 hover:text-gray-600" /></button>
      </div>
      <div className="px-4 py-2 flex justify-between items-center">
        <h4 className="text-sm font-semibold text-gray-800">{monthsID[month]} {year}</h4>
        <div className="flex gap-1">
          <button type="button" onClick={prevMonth} className="p-1 hover:bg-gray-100 rounded-full"><ChevronLeft className="w-4 h-4 text-gray-500" /></button>
          <button type="button" onClick={nextMonth} className="p-1 hover:bg-gray-100 rounded-full"><ChevronRight className="w-4 h-4 text-gray-500" /></button>
        </div>
      </div>
      <div className="grid grid-cols-7 px-3 mb-1">
        {daysID.map((day, i) => (
          <div key={day} className={`text-center text-[10px] font-medium py-1 ${i === 0 ? 'text-red-500' : 'text-gray-400'}`}>
            {day}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 px-3 pb-3 gap-y-1 gap-x-1">
        {Array.from({ length: firstDay }).map((_, i) => <div key={`empty-${i}`} />)}
        {Array.from({ length: days }).map((_, i) => {
          const day = i + 1;
          const isSelected = tempSelectedDate.getDate() === day && tempSelectedDate.getMonth() === month && tempSelectedDate.getFullYear() === year;
          const isToday = today.getDate() === day && today.getMonth() === month && today.getFullYear() === year;
          const isSunday = new Date(year, month, day).getDay() === 0;
          return (
            <div key={day} className="flex justify-center">
              <button type="button" onClick={() => handleDateClick(day)} className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-normal transition-all ${isSelected ? 'bg-blue-600 text-white shadow-sm' : isSunday ? 'text-red-500 hover:bg-red-50' : 'text-gray-600 hover:bg-gray-100'} ${isToday && !isSelected ? 'text-blue-600 font-semibold bg-blue-50' : ''}`}>{day}</button>
            </div>
          );
        })}
      </div>
      <div className="p-3 border-t border-gray-50 bg-gray-50/50">
        <button type="button" onClick={handleSave} className="w-full bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold py-2.5 rounded-lg transition-colors shadow-sm">Simpan</button>
      </div>
    </div>
  );
};

// --- DATA DUMMY GUEST ---
const travelingFrom = [
    { name: 'Jakarta', date: 'Apr 5-8', price: 'IDR 5.870.000', img: 'https://images.unsplash.com/photo-1555899434-94d1368d7ae1?q=80&w=400&auto=format&fit=crop' },
    { name: 'Surabaya', date: 'Oct 5-8', price: 'IDR 5.870.000', img: 'https://images.unsplash.com/photo-1588668214407-6ea9a6d8c272?q=80&w=400&auto=format&fit=crop' },
];
const discoverItems = [
    { title: 'Latest travel restrictions', desc: 'We provide information on the entry requirements.', img: 'https://img.freepik.com/free-vector/colorful-world-map-background_1017-30889.jpg' },
    { title: 'Install our mobile app', desc: 'Our mobile app provides real-time information.', img: 'https://img.freepik.com/free-vector/app-development-concept-with-flat-design_23-2147852844.jpg' },
    { title: 'The most beautiful destinations', desc: 'Have you ever considered visiting Easter Island?', img: 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?q=80&w=400&auto=format&fit=crop' },
];

// --- 3. HOME COMPONENT UTAMA ---
export const Home = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // STATE
  const [flightsData, setFlightsData] = useState<Flight[]>([]);
  const [filteredFlights, setFilteredFlights] = useState<Flight[]>([]);
  const [selectedFlight, setSelectedFlight] = useState<Flight | null>(null);
  const [searchPerformed, setSearchPerformed] = useState(false);
  const [tripType, setTripType] = useState<'one-way' | 'round-trip' | 'multi-city'>('one-way');
  const [searchFlights, setSearchFlights] = useState([{ origin: '', destination: '', departureDate: '' }]);
  const [returnDate, setReturnDate] = useState('');
  const [passengers, setPassengers] = useState({ adults: 1, children: 0, infants: 0 });
  const [activeSearchTab, setActiveSearchTab] = useState<'buy' | 'status'>('buy');
  
  const [isPassengerOpen, setIsPassengerOpen] = useState(false);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [activeDateIndex, setActiveDateIndex] = useState<number>(0); 
  
  const passengerRef = useRef<HTMLDivElement>(null);
  const calendarRef = useRef<HTMLDivElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  useEffect(() => { loadFlightsData(); }, []);

  // Close dropdowns
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (passengerRef.current && !passengerRef.current.contains(event.target as Node)) setIsPassengerOpen(false);
      if (calendarRef.current && !calendarRef.current.contains(event.target as Node)) setIsCalendarOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const loadFlightsData = async () => {
    try {
      const { data } = await supabase.from('flights').select('*').gte('available_seats', 1).order('departure_time', { ascending: true });
      setFlightsData(data || []);
      setFilteredFlights(data || []);
    } catch(e) { console.log(e); }
  };

  const handleFlightChange = (index: number, field: string, value: string) => {
    const newFlights = [...searchFlights];
    // @ts-ignore
    newFlights[index][field] = value;
    setSearchFlights(newFlights);
  };

  const handleSearch = () => {
    setSearchPerformed(true);
    const firstFlight = searchFlights[0];
    const filtered = flightsData.filter((flight) => {
      return (!firstFlight.origin || flight.origin.toLowerCase().includes(firstFlight.origin.toLowerCase())) &&
             (!firstFlight.destination || flight.destination.toLowerCase().includes(firstFlight.destination.toLowerCase())) &&
             (!firstFlight.departureDate || flight.departure_time.startsWith(firstFlight.departureDate));
    });
    setFilteredFlights(filtered);
    setTimeout(() => { resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }); }, 100);
  };

  const handleBookingSuccess = () => loadFlightsData();
  const onBookFlight = (flight: Flight) => {
    if (!user) {
      navigate('/login'); 
    } else {
      navigate('/booking');
    }
  };

  const totalPassengers = passengers.adults + passengers.children + passengers.infants;
  const passengerLabel = `${totalPassengers} Adult${totalPassengers > 1 ? 's' : ''}`;
  const formatDateDisplay = (dateString: string) => dateString ? new Date(dateString).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: '2-digit' }) : '';
  const openCalendar = (index: number) => { setActiveDateIndex(index); setIsCalendarOpen(true); };
  const onDateSelect = (date: string) => { tripType === 'round-trip' && activeDateIndex === -1 ? setReturnDate(date) : handleFlightChange(activeDateIndex, 'departureDate', date); };
  const handlePassengerCount = (type: any, op: any) => setPassengers(prev => ({...prev, [type]: op === 'inc' ? prev[type] + 1 : Math.max(0, prev[type] - 1)}));

  const PassengerDropdownContent = () => (
    <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-xl z-[60] p-4 min-w-[250px]">
        {[{ label: 'Adults', type: 'adults', desc: '(12+)' }, { label: 'Children', type: 'children', desc: '(2-11)' }, { label: 'Infants', type: 'infants', desc: '(< 2)' }].map((item) => (
        <div key={item.label} className="flex justify-between items-center py-2 mb-1 border-b border-gray-50 last:border-0">
            <div><p className="text-sm font-semibold text-gray-700">{item.label}</p><p className="text-[10px] text-gray-400">{item.desc}</p></div>
            <div className="flex items-center gap-3">
                <button type="button" onClick={() => handlePassengerCount(item.type as any, 'dec')} className="w-7 h-7 border rounded hover:bg-gray-100 flex items-center justify-center text-gray-500">-</button>
                <span className="text-sm font-semibold w-4 text-center text-gray-700">{passengers[item.type as keyof typeof passengers]}</span>
                <button type="button" onClick={() => handlePassengerCount(item.type as any, 'inc')} className="w-7 h-7 border rounded hover:bg-gray-100 flex items-center justify-center text-gray-500">+</button>
            </div>
        </div>
        ))}
        <button type="button" onClick={() => setIsPassengerOpen(false)} className="w-full mt-2 bg-blue-600 text-white text-xs font-semibold py-2.5 rounded-lg hover:bg-blue-700">Done</button>
    </div>
  );

  // --- RENDER FORM GUEST (ORANYE) ---
  const SearchFormGuest = () => (
    <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-5xl mx-auto border border-gray-100">
        <div className="flex gap-8 border-b border-gray-200 pb-0 mb-6">
            <button onClick={() => setActiveSearchTab('buy')} className={`text-base font-bold pb-3 relative ${activeSearchTab === 'buy' ? 'text-orange-400 after:content-[""] after:absolute after:left-0 after:bottom-[-1px] after:w-full after:h-[3px] after:bg-orange-400' : 'text-gray-500'}`}>Buy Tickets</button>
            <button onClick={() => setActiveSearchTab('status')} className={`text-base font-bold pb-3 relative ${activeSearchTab === 'status' ? 'text-orange-400 after:content-[""] after:absolute after:left-0 after:bottom-[-1px] after:w-full after:h-[3px] after:bg-orange-400' : 'text-gray-500'}`}>Check your flight status</button>
        </div>
        {activeSearchTab === 'buy' && (
        <>
            <div className="flex items-center gap-8 mb-6">
                {['one-way', 'round-trip', 'multi-city'].map(type => (
                    <label key={type} className="flex items-center gap-2 cursor-pointer">
                        <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${tripType === type ? 'border-orange-400' : 'border-gray-300'}`}>{tripType === type && <div className="w-2.5 h-2.5 rounded-full bg-orange-400" />}</div>
                        <input type="radio" name="tripType" checked={tripType === type} onChange={() => setTripType(type as any)} className="hidden" />
                        <span className={`text-sm font-medium ${tripType === type ? 'text-gray-800' : 'text-gray-500'}`}>{type.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}</span>
                    </label>
                ))}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-end">
                <div className="relative group"><label className="block text-xs font-bold text-gray-500 mb-1.5 ml-1">From</label><div className="flex items-center border border-gray-300 rounded-md px-3 py-2.5"><Plane className="w-5 h-5 text-gray-400 mr-3" /><input type="text" placeholder="Select Departure..." value={searchFlights[0].origin} onChange={(e) => handleFlightChange(0, 'origin', e.target.value)} className="bg-transparent outline-none text-gray-700 text-sm w-full font-medium placeholder-gray-300" /><ChevronRight className="w-4 h-4 text-gray-300 ml-auto" /></div></div>
                <div className="relative group"><label className="block text-xs font-bold text-gray-500 mb-1.5 ml-1">To</label><div className="flex items-center border border-gray-300 rounded-md px-3 py-2.5"><Plane className="w-5 h-5 text-gray-400 mr-3 transform rotate-45" /><input type="text" placeholder="Select Destination..." value={searchFlights[0].destination} onChange={(e) => handleFlightChange(0, 'destination', e.target.value)} className="bg-transparent outline-none text-gray-700 text-sm w-full font-medium placeholder-gray-300" /><ChevronRight className="w-4 h-4 text-gray-300 ml-auto" /></div></div>
                <div className="relative group" ref={calendarRef}><label className="block text-xs font-bold text-gray-500 mb-1.5 ml-1">Departure date</label><div className="flex items-center border border-gray-300 rounded-md px-3 py-2.5 cursor-pointer" onClick={() => openCalendar(0)}><input type="text" readOnly placeholder="dd/mm/yy" value={formatDateDisplay(searchFlights[0].departureDate)} className="bg-transparent outline-none text-gray-700 text-sm w-full font-medium placeholder-gray-300 cursor-pointer" /><CalendarIcon className="w-4 h-4 text-gray-400 ml-auto" /></div><CalendarModal isOpen={isCalendarOpen} onClose={() => setIsCalendarOpen(false)} onSelect={onDateSelect} selectedDate={searchFlights[0].departureDate} /></div>
                <div className="relative group" ref={passengerRef}><label className="block text-xs font-bold text-gray-500 mb-1.5 ml-1">Passengers</label><button onClick={() => setIsPassengerOpen(!isPassengerOpen)} className="w-full bg-white border border-gray-300 rounded-md px-3 py-2.5 flex items-center justify-between outline-none"><span className="text-gray-700 text-sm font-medium">{passengerLabel}</span><ChevronRight className="w-4 h-4 text-gray-300" /></button>{isPassengerOpen && <PassengerDropdownContent />}</div>
            </div>
            <div className="flex justify-center mt-8"><button onClick={handleSearch} className="px-12 py-3 bg-[#FFAD60] hover:bg-orange-500 text-white font-bold rounded shadow-sm transition-colors text-base">Book now!</button></div>
        </>
        )}
    </div>
  );

  // --- FORM KHUSUS USER (BIRU, MODERN) ---
  const SearchFormUser = () => (
    <div className="bg-white rounded-xl shadow-xl overflow-visible border border-gray-100">
        <div className="flex bg-white border-b border-gray-200 rounded-t-xl">
            {['one-way', 'round-trip', 'multi-city'].map(type => (
                <button key={type} onClick={() => setTripType(type as any)} className={`flex-1 py-4 text-sm font-semibold flex items-center justify-center gap-2 transition-all ${tripType === type ? 'bg-blue-600 text-white' : 'text-gray-500 hover:bg-gray-50'}`}>
                    {type === 'one-way' && <ArrowRight className="w-4 h-4" />}
                    {type === 'round-trip' && <ArrowLeftRight className="w-4 h-4" />}
                    {type === 'multi-city' && <GitMerge className="w-4 h-4" />}
                    {type.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </button>
            ))}
        </div>
        <div className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6 items-end">
                <div className="relative group bg-white border border-gray-300 rounded-xl px-5 py-3 flex flex-col justify-center h-[64px] focus-within:ring-2 focus-within:ring-blue-500">
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-0.5">From</label>
                    <div className="flex items-center gap-3"><Plane className="w-5 h-5 text-gray-400" /><input type="text" placeholder="Origin" value={searchFlights[0].origin} onChange={(e) => handleFlightChange(0, 'origin', e.target.value)} className="bg-transparent outline-none text-gray-900 font-bold text-base w-full placeholder-gray-300" /></div>
                </div>
                <div className="relative group bg-white border border-gray-300 rounded-xl px-5 py-3 flex flex-col justify-center h-[64px] focus-within:ring-2 focus-within:ring-blue-500">
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-0.5">To</label>
                    <div className="flex items-center gap-3"><Plane className="w-5 h-5 text-gray-400 transform rotate-90" /><input type="text" placeholder="Dest..." value={searchFlights[0].destination} onChange={(e) => handleFlightChange(0, 'destination', e.target.value)} className="bg-transparent outline-none text-gray-900 font-bold text-base w-full placeholder-gray-300" /></div>
                </div>
                <div className="relative group bg-white border border-gray-300 rounded-xl px-5 py-3 flex flex-col justify-center h-[64px] cursor-pointer hover:border-gray-400" onClick={() => openCalendar(0)}>
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-0.5">Date</label>
                    <div className="flex items-center justify-between"><span className="text-gray-900 font-bold text-base">{formatDateDisplay(searchFlights[0].departureDate) || 'DD/MM/YY'}</span><CalendarIcon className="w-5 h-5 text-gray-400" /></div>
                    <CalendarModal isOpen={isCalendarOpen} onClose={() => setIsCalendarOpen(false)} onSelect={onDateSelect} selectedDate={searchFlights[0].departureDate} />
                </div>
                <div className="relative group bg-white border border-gray-300 rounded-xl px-5 py-3 flex flex-col justify-center h-[64px] cursor-pointer hover:border-gray-400" onClick={() => setIsPassengerOpen(!isPassengerOpen)} ref={passengerRef}>
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-0.5">Passengers</label>
                    <div className="flex items-center justify-between"><span className="text-gray-900 font-bold text-base">{passengerLabel}</span><ChevronDown className="w-5 h-5 text-gray-400" /></div>
                    {isPassengerOpen && <PassengerDropdownContent />}
                </div>
            </div>
            <div className="flex justify-center mt-8"><button onClick={handleSearch} className="px-16 py-4 bg-[#FCA556] hover:bg-orange-400 text-white font-bold rounded-xl shadow-md transition-colors text-lg">Book now!</button></div>
        </div>
    </div>
  );

  // --- RENDER HALAMAN HASIL PENCARIAN (FIX: ADA MODAL BOOKING DI SINI) ---
  if (searchPerformed) {
      return (
          <div className="min-h-screen bg-white font-sans">
              <Header />
              <SearchResults 
                  flights={filteredFlights} 
                  origin={searchFlights[0].origin} 
                  destination={searchFlights[0].destination} 
                  departureDate={searchFlights[0].departureDate} 
                  onBack={() => setSearchPerformed(false)}
                  onBook={onBookFlight} 
              />
              {/* MODAL BOOKING DISINI AGAR MUNCUL SAAT KLIK BOOK */}
              {selectedFlight && user && (
                <BookingModal flight={selectedFlight} passengerCount={totalPassengers} onClose={() => setSelectedFlight(null)} onSuccess={handleBookingSuccess} />
              )}
          </div>
      );
  }

  // --- RENDER UTAMA (LANDING PAGE & DASHBOARD) ---
  const userName = user?.user_metadata?.full_name || 'Traveler';

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <Header />

      {/* HERO BACKGROUND */}
      <div className="relative h-[550px] bg-[#001D4A]">
        <img src="https://images.unsplash.com/photo-1542296332-2e44a996aa0d?q=80&w=2074&auto=format&fit=crop" className="absolute inset-0 w-full h-full object-cover opacity-60 mix-blend-overlay" />
        <div className="relative z-10 w-full max-w-7xl mx-auto px-6 md:px-12 flex justify-end pt-32">
           <div className="text-right text-white">
             {user ? (
               <h1 className="text-5xl font-light mb-2 tracking-wide">Welcome aboard, {userName}</h1>
             ) : (
               <>
                 <div className="text-sm font-medium mb-4 text-orange-300 space-x-6"><a href="#" className="hover:underline">Home</a><a href="#" className="hover:underline">Help</a><a href="/login" className="hover:underline">Log in</a><a href="/signup" className="hover:underline">Sign up</a></div>
                 <h1 className="text-5xl font-bold mb-4 tracking-wide leading-tight">One Click, One Journey<br/>Book Your Trip Easily, Anytime, Anywhere</h1>
                 <p className="text-xl font-medium text-orange-300 cursor-pointer" onClick={() => window.scrollTo({top: 500, behavior:'smooth'})}>Book now!</p>
               </>
             )}
           </div>
        </div>
      </div>

      {/* SEARCH FORM */}
      <div className="relative z-20 -mt-32 max-w-6xl mx-auto px-6 mb-16">
          {/* TAMPILKAN FORM BERBEDA SESUAI STATUS LOGIN */}
          {user ? <SearchFormUser /> : <SearchFormGuest />}
          
          <div className="mt-6 max-w-4xl mx-auto bg-[#FFF8E7] border border-[#FDE68A] rounded-md p-4 flex items-start gap-3 shadow-sm">
             <div className="mt-0.5"><AlertTriangle className="w-5 h-5 text-yellow-500" /></div>
             <p className="text-xs text-gray-600 leading-relaxed"><span className="font-bold text-gray-700">Travel Update:</span> Some travel routes may be affected by current weather conditions. Please check your schedule before departure.</p>
          </div>
      </div>

      {/* DASHBOARD CONTENT (HANYA GUEST VIEW SESUAI GAMBAR) */}
      {!user && (
      <div className="max-w-7xl mx-auto px-6 pb-20 space-y-16">
          {/* Traveling from... */}
          <section>
            <div className="flex justify-between items-end mb-6"><div><h2 className="text-2xl font-bold text-gray-900">Traveling from your location</h2><p className="text-sm text-gray-500">round trip - one passenger</p></div><a href="#" className="text-blue-600 text-sm font-bold hover:underline">Explore more destinations</a></div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {travelingFrom.map((item, idx) => (
                   <div key={idx} className="flex bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition cursor-pointer h-40">
                      <img src={item.img} className="w-40 h-full object-cover" />
                      <div className="p-6 flex flex-col justify-between flex-1"><div><h3 className="font-bold text-lg text-gray-800">{item.name}</h3><p className="text-xs text-gray-500">{item.date} • Direct flight • 2h 15m</p></div><p className="text-right font-bold text-gray-900">{item.price}</p></div>
                   </div>
                ))}
            </div>
          </section>

          {/* Discover */}
          <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Discover</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                 {discoverItems.map((item, idx) => (
                    <div key={idx} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition cursor-pointer">
                       <img src={item.img} className="w-full h-48 object-cover" /><div className="p-6"><h3 className="font-bold text-gray-800 mb-2">{item.title}</h3><p className="text-xs text-gray-500 mb-4">{item.desc}</p><div className="flex justify-end"><ArrowRight className="w-4 h-4 text-gray-400" /></div></div>
                    </div>
                 ))}
              </div>
          </section>
      </div>
      )}

      {/* DASHBOARD CONTENT (USER VIEW - SIMPEL) */}
      {user && (
          <div className="max-w-7xl mx-auto px-6 pb-20">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-16">
                  <div className="bg-[#D9E2F3] rounded-2xl p-6 flex flex-col items-center text-center hover:shadow-lg transition cursor-pointer group h-56"><h3 className="font-bold text-[#1E3A8A] text-sm mb-1 group-hover:underline">Security screening</h3><p className="text-[10px] text-blue-700 mb-4">What can I bring?</p><Award className="w-12 h-12 text-blue-300 mt-auto" /></div>
                  <div className="bg-[#F3F4F6] rounded-2xl p-6 flex flex-col items-center text-center hover:shadow-lg transition cursor-pointer group h-56"><h3 className="font-bold text-gray-800 text-sm mb-1 group-hover:underline">Travel tips</h3><p className="text-[10px] text-gray-600 mb-4">Tips & Tricks</p><Smartphone className="w-12 h-12 text-gray-400 mt-auto" /></div>
                  <div className="bg-[#D9E2F3] rounded-2xl p-6 flex flex-col items-center text-center hover:shadow-lg transition cursor-pointer group h-56"><h3 className="font-bold text-[#1E3A8A] text-sm mb-1 group-hover:underline">Procedures</h3><p className="text-[10px] text-blue-700 mb-4">Disabilities</p><MapPin className="w-12 h-12 text-blue-300 mt-auto" /></div>
                  <div className="bg-[#F3F4F6] rounded-2xl p-6 flex flex-col items-center text-center hover:shadow-lg transition cursor-pointer group h-56"><h3 className="font-bold text-gray-800 text-sm mb-1 group-hover:underline">Partners</h3><p className="text-[10px] text-gray-600 mb-4">Airlines</p><Award className="w-12 h-12 text-gray-400 mt-auto" /></div>
              </div>
          </div>
      )}

      <Footer />
      {/* MODAL BOOKING (HANYA MUNCUL JIKA USER LOGIN) */}
      {selectedFlight && user && (
        <BookingProcess flight={selectedFlight} passengerCount={totalPassengers} onClose={() => setSelectedFlight(null)} onSuccess={handleBookingSuccess} />
      )}
    </div>
  );
};