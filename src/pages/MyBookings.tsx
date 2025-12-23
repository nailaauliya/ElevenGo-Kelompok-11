import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  User, CreditCard, HelpCircle, Wallet, History, LogOut, 
  Plane, Clock, MapPin, Ticket, ChevronRight, Download, QrCode, X, Printer, Share2
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import Header from '../components/Header';
import Footer from '../components/Footer';
import api from '../lib/axios'; // Import API Axios

// --- 1. KOMPONEN MODAL QR CODE (TIDAK BERUBAH) ---
const QrModal = ({ booking, onClose }: { booking: any, onClose: () => void }) => {
  if (!booking) return null;
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${booking.id}-${booking.flightNumber}`;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xs overflow-hidden relative">
        <button onClick={onClose} className="absolute top-3 right-3 p-1.5 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors">
          <X size={16} className="text-gray-600" />
        </button>
        
        <div className="bg-[#03153E] p-4 text-center text-white">
          <h3 className="text-base font-bold">Boarding Pass</h3>
          <p className="text-[10px] text-blue-200 uppercase tracking-widest mt-0.5">Scan at Gate</p>
        </div>

        <div className="p-6 flex flex-col items-center">
          <div className="border-4 border-gray-900 rounded-xl p-2 mb-4">
             <img src={qrUrl} alt="QR Code" className="w-32 h-32" />
          </div>
          
          <h2 className="text-xl font-bold text-gray-800 mb-0.5">{booking.flightNumber}</h2>
          <p className="text-xs text-gray-500 font-medium mb-4">{booking.airline}</p>

          <div className="w-full grid grid-cols-2 gap-3 text-center bg-gray-50 p-3 rounded-xl border border-gray-100">
             <div><p className="text-[10px] text-gray-400 uppercase">Terminal</p><p className="text-sm font-bold text-gray-800">{booking.terminal}</p></div>
             <div><p className="text-[10px] text-gray-400 uppercase">Gate</p><p className="text-sm font-bold text-gray-800">{booking.gate}</p></div>
             <div><p className="text-[10px] text-gray-400 uppercase">Seat</p><p className="text-sm font-bold text-gray-800">{booking.seatNumber || 'Any'}</p></div>
             <div><p className="text-[10px] text-gray-400 uppercase">Class</p><p className="text-sm font-bold text-gray-800">{booking.class}</p></div>
          </div>
        </div>
        
        <div className="p-3 border-t border-gray-100 bg-gray-50 text-center">
           <p className="text-[10px] text-green-600 font-bold flex items-center justify-center gap-1">
             <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
             Ready
           </p>
        </div>
      </div>
    </div>
  );
};

const TicketModal = ({ booking, onClose }: { booking: any, onClose: () => void }) => {
  if (!booking) return null;
  const handlePrint = () => { window.print(); };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
      <button onClick={onClose} className="fixed top-6 right-6 p-3 bg-white/20 hover:bg-white/30 rounded-full text-white backdrop-blur-md transition-colors z-50 print-hide"><X size={24} /></button>

      <div id="printable-ticket" className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden">
        <div className="bg-[#FF8C00] p-6 flex justify-between items-center text-white print:bg-[#FF8C00] print:text-white print-color-adjust">
           <div className="flex items-center gap-3">
              <Plane className="w-8 h-8 transform -rotate-45" />
              <div><h2 className="text-2xl font-bold tracking-tight">ElevenGo E-Ticket</h2><p className="text-xs text-orange-100 font-medium">Booking ID: {booking.id}</p></div>
           </div>
           <div className="text-right"><p className="text-sm font-bold uppercase tracking-wider">{booking.airline}</p><p className="text-xs text-orange-100">{booking.class} Class</p></div>
        </div>

        <div className="p-8">
           <div className="flex justify-between items-center mb-8 pb-8 border-b-2 border-dashed border-gray-200">
              <div className="text-left">
                 <p className="text-4xl font-bold text-gray-800">{booking.fromCode}</p>
                 <p className="text-sm text-gray-500 mt-1">{booking.fromCity}</p>
                 <p className="text-lg font-bold text-blue-600 mt-2">{booking.departureTime}</p>
              </div>
              <div className="flex-1 px-8 flex flex-col items-center">
                 <p className="text-xs text-gray-400 mb-2">{booking.duration}</p>
                 <div className="w-full h-[2px] bg-gray-200 relative flex items-center">
                    <div className="w-2 h-2 bg-gray-400 rounded-full absolute left-0"></div>
                    <Plane className="w-5 h-5 text-blue-500 absolute left-1/2 -translate-x-1/2 transform rotate-90" />
                    <div className="w-2 h-2 bg-gray-400 rounded-full absolute right-0"></div>
                 </div>
                 <p className="text-xs text-gray-400 mt-2">{booking.flightNumber}</p>
              </div>
              <div className="text-right">
                 <p className="text-4xl font-bold text-gray-800">{booking.toCode}</p>
                 <p className="text-sm text-gray-500 mt-1">{booking.toCity}</p>
                 <p className="text-lg font-bold text-blue-600 mt-2">{booking.arrivalTime}</p>
              </div>
           </div>

           <div className="grid grid-cols-4 gap-6 mb-8">
              <div><p className="text-xs text-gray-400 uppercase mb-1">Date</p><p className="font-bold text-gray-800">{booking.date}</p></div>
              <div><p className="text-xs text-gray-400 uppercase mb-1">Boarding Time</p><p className="font-bold text-gray-800">{booking.departureTime}</p></div>
              <div><p className="text-xs text-gray-400 uppercase mb-1">Gate</p><p className="font-bold text-gray-800">{booking.gate}</p></div>
              <div><p className="text-xs text-gray-400 uppercase mb-1">Terminal</p><p className="font-bold text-gray-800">{booking.terminal}</p></div>
           </div>

           <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 flex justify-between items-center print:bg-gray-100">
              <div className="flex items-center gap-3">
                 <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">U</div>
                 <div><p className="text-sm font-bold text-gray-800">Passenger</p><p className="text-xs text-gray-500">Adult • 1 Baggage (20kg)</p></div>
              </div>
              <div className="text-right"><p className="text-xs text-gray-400">Seat</p><p className="text-xl font-bold text-orange-500">{booking.seatNumber || 'Any'}</p></div>
           </div>
        </div>

        <div className="bg-gray-50 p-6 flex justify-between items-center border-t border-gray-200 print-hide">
           <div className="text-xs text-gray-400">* Show this e-ticket at the check-in counter.</div>
           <div className="flex gap-3">
              <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-sm font-bold text-gray-600 hover:bg-white transition-colors"><Share2 size={16} /> Share</button>
              <button onClick={handlePrint} className="flex items-center gap-2 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-bold transition-colors shadow-sm"><Printer size={16} /> Print / Save PDF</button>
           </div>
        </div>
      </div>
    </div>
  );
};

export default function MyBookings() {
  const navigate = useNavigate();
  const { user, signOut } = useAuth(); 
  const [activeTab, setActiveTab] = useState<'upcoming' | 'completed' | 'canceled'>('upcoming');
  const [selectedQrBooking, setSelectedQrBooking] = useState<any>(null);
  const [selectedTicketBooking, setSelectedTicketBooking] = useState<any>(null);
  
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMyBookings();
  }, []);

  const fetchMyBookings = async () => {
    try {
      setLoading(true);
      const res = await api.get('/bookings'); 
      
      const mappedData = res.data.map((b: any) => {
        const flight = b.flight || {}; 
        const departureDate = new Date(`${flight.departure_time}`);
        const now = new Date();

        let type = 'upcoming';
        if (b.status === 'canceled') {
            type = 'canceled';
        } else if (departureDate < now) {
            type = 'completed';
        }

        const arrivalDate = new Date(`${flight.arrival_time}`);
        const diffMs = arrivalDate.getTime() - departureDate.getTime();
        const diffHrs = Math.floor(diffMs / 3600000);
        const diffMins = Math.round(((diffMs % 3600000) / 60000));

        return {
            id: b.booking_code, 
            airline: flight.airline,
            flightNumber: flight.flight_number,
            from: `${flight.origin} (${flight.origin_code})`,
            to: `${flight.destination} (${flight.destination_code})`,
            // Field terpisah untuk tiket modal
            fromCity: flight.origin,
            fromCode: flight.origin_code,
            toCity: flight.destination,
            toCode: flight.destination_code,
            
            date: departureDate.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
            departureTime: departureDate.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit', hour12: false}),
            arrivalTime: arrivalDate.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit', hour12: false}),
            duration: `${diffHrs}h ${diffMins}m`,
            
            status: b.status === 'confirmed' ? (departureDate < now ? 'Landed' : 'On Time') : b.status,
            terminal: '1', 
            gate: 'G2',   
            seatNumber: b.seat_number || 'Any',
            type: type,
            class: 'Economy' 
        };
      });

      setBookings(mappedData);
    } catch (error) {
      console.error("Gagal load booking:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredBookings = bookings.filter(b => b.type === activeTab);
  
  const handleLogout = async () => { try { await signOut(); navigate('/'); } catch (error) { console.error(error); } };

  const getPhotoUrl = (path: string | null | undefined) => {
    if (!path) return "/images/jeno logo.jpg"; 
    if (path.startsWith('http')) return path; 
    return `https://elevengo.rf.gd/storage/${path}`; 
  };

  const userName = user?.full_name || "User";
  const userPhoto = getPhotoUrl(user?.photo_url);

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 font-sans">
      
      {/* CSS PRINT */}
      <style>{`
        @media print {
          body * { visibility: hidden; }
          #printable-ticket, #printable-ticket * { visibility: visible; }
          #printable-ticket { position: absolute; left: 0; top: 0; width: 100%; margin: 0; padding: 0; box-shadow: none; border: 1px solid #ddd; }
          * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
          .print-hide { display: none !important; }
        }
      `}</style>

    
      <div className="bg-white sticky top-0 z-50 shadow-sm print-hide"><Header /></div>

      <div className="flex-grow w-full max-w-7xl mx-auto px-4 md:px-8 py-8 flex flex-col lg:flex-row gap-8 print-hide">
        <div className="w-full lg:w-1/4">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col items-center sticky top-24">
            <div className="relative mb-4">
                <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-gray-100">
                    <img src={userPhoto} alt="Profile" className="w-full h-full object-cover" />
                </div>
            </div>
            <h2 className="font-bold text-gray-800 text-lg mb-6 text-center">{userName}</h2>
            <div className="w-full space-y-1">
              <button onClick={() => navigate('/profile')} className="w-full flex items-center justify-between px-4 py-3 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"><div className="flex items-center gap-3"><User size={18}/> Personal Details</div></button>
              <button className="w-full flex items-center justify-between px-4 py-3 rounded-lg text-sm font-medium bg-blue-50 text-blue-700 transition-colors border-l-4 border-blue-600"><div className="flex items-center gap-3"><Ticket size={18}/> My Bookings</div><ChevronRight size={16} /></button>
              <button onClick={() => navigate('/wallet')} className="w-full flex items-center justify-between px-4 py-3 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"><div className="flex items-center gap-3"><Wallet size={18}/> Wallet</div></button>
              <button onClick={() => navigate('/paymenthistory')} className="w-full flex items-center justify-between px-4 py-3 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"><div className="flex items-center gap-3"><History size={18}/> Payment History</div></button>
              
              <button onClick={handleLogout} className="w-full flex items-center justify-between px-4 py-3 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-colors mt-4"><div className="flex items-center gap-3"><LogOut size={18}/> Log out</div></button>
            </div>
          </div>
        </div>

        <div className="w-full lg:w-3/4 space-y-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">My Bookings</h1>
          <div className="flex border-b border-gray-200 mb-6">
             <button onClick={() => setActiveTab('upcoming')} className={`px-6 py-3 text-sm font-bold transition-all border-b-2 ${activeTab === 'upcoming' ? 'border-orange-500 text-orange-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>Upcoming</button>
             <button onClick={() => setActiveTab('completed')} className={`px-6 py-3 text-sm font-bold transition-all border-b-2 ${activeTab === 'completed' ? 'border-orange-500 text-orange-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>Completed</button>
             <button onClick={() => setActiveTab('canceled')} className={`px-6 py-3 text-sm font-bold transition-all border-b-2 ${activeTab === 'canceled' ? 'border-orange-500 text-orange-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>Canceled</button>
          </div>
          
          <div className="space-y-6">
             {loading ? (
                <div className="text-center py-12 text-gray-400 text-sm">Loading bookings...</div>
             ) : filteredBookings.length > 0 ? (
                filteredBookings.map((flight) => (
                   <div key={flight.id} className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                      <div className="bg-gray-50 px-6 py-4 flex justify-between items-center border-b border-gray-100">
                         <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center border border-gray-200 shadow-sm"><Plane className="w-4 h-4 text-blue-600" /></div>
                            <div><h3 className="text-sm font-bold text-gray-800">{flight.airline}</h3><p className="text-xs text-gray-500">Booking ID: {flight.id}</p></div>
                         </div>
                         <span className={`px-3 py-1 rounded-full text-xs font-bold ${flight.status === 'On Time' ? 'bg-green-100 text-green-700' : flight.status === 'Delayed' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'}`}>{flight.status}</span>
                      </div>
                      <div className="p-6">
                         <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                            <div className="text-center md:text-left"><p className="text-2xl font-bold text-gray-800">{flight.departureTime}</p><p className="text-sm text-gray-500 font-medium">{flight.from}</p><p className="text-xs text-gray-400 mt-1">{flight.date}</p></div>
                            <div className="flex-1 flex flex-col items-center px-4 w-full"><p className="text-xs text-gray-400 mb-1">{flight.duration}</p><div className="w-full h-[2px] bg-gray-200 relative flex items-center"><div className="w-2 h-2 bg-gray-300 rounded-full absolute left-0"></div><Plane className="w-4 h-4 text-gray-300 absolute left-1/2 -translate-x-1/2 transform rotate-90" /><div className="w-2 h-2 bg-gray-300 rounded-full absolute right-0"></div></div><p className="text-xs text-gray-400 mt-1">{flight.class}</p></div>
                            <div className="text-center md:text-right"><p className="text-2xl font-bold text-gray-800">{flight.arrivalTime}</p><p className="text-sm text-gray-500 font-medium">{flight.to}</p><p className="text-xs text-gray-400 mt-1">{flight.date}</p></div>
                         </div>
                         <div className="mt-6 pt-4 border-t border-dashed border-gray-200 flex flex-wrap justify-between items-center gap-4">
                            <div className="flex gap-6 text-xs text-gray-600">
                               <div className="flex items-center gap-1.5"><Ticket size={14} className="text-gray-400"/><span>Flight: <strong>{flight.flightNumber}</strong></span></div>
                               <div className="flex items-center gap-1.5"><MapPin size={14} className="text-gray-400"/><span>Gate: <strong>{flight.gate}</strong></span></div>
                               <div className="flex items-center gap-1.5"><Clock size={14} className="text-gray-400"/><span>Terminal: <strong>{flight.terminal}</strong></span></div>
                            </div>
                            <div className="flex gap-3">
                               {activeTab === 'upcoming' && (
                                  <button onClick={() => setSelectedQrBooking(flight)} className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg transition-colors shadow-sm"><QrCode size={14} /> Check-in</button>
                               )}
                               <button onClick={() => setSelectedTicketBooking(flight)} className="flex items-center gap-2 px-4 py-2 border border-gray-300 hover:bg-gray-50 text-gray-700 text-xs font-bold rounded-lg transition-colors"><Download size={14} /> E-Ticket</button>
                            </div>
                         </div>
                      </div>
                   </div>
                ))
             ) : (
                <div className="bg-white rounded-xl border-2 border-dashed border-gray-300 p-12 flex flex-col items-center justify-center text-center">
                   <Plane className="w-12 h-12 text-gray-300 mb-3" /><p className="text-gray-500 font-medium">No {activeTab} bookings found.</p>
                </div>
             )}
          </div>
        </div>
      </div>
      
      <div className="print-hide"><Footer /></div>

      {selectedQrBooking && <QrModal booking={selectedQrBooking} onClose={() => setSelectedQrBooking(null)} />}
      {selectedTicketBooking && <TicketModal booking={selectedTicketBooking} onClose={() => setSelectedTicketBooking(null)} />}

    </div>
  );
}