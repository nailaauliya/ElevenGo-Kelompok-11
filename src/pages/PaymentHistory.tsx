import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  User, HelpCircle, Wallet, History, LogOut, 
  Plane, Calendar, FileText, ChevronRight, Search, Loader2
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import api from '../lib/axios'; 
import Header from '../components/Header';
import Footer from '../components/Footer';

export default function PaymentHistory() {
  const navigate = useNavigate();
  const { user, signOut } = useAuth(); 

  const [activeFilter, setActiveFilter] = useState('All');
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
      const fetchHistory = async () => {
          try {
              const response = await api.get('/bookings');
              const data = response.data || [];
              
              const formattedData = data.map((booking: any) => ({
                  id: booking.booking_code || `INV-${booking.id}`,
                  flightCode: booking.flight?.flight_number || 'Unknown',
                  route: `${booking.flight?.origin} (${booking.flight?.origin_code}) → ${booking.flight?.destination} (${booking.flight?.destination_code})`,
                  date: new Date(booking.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
                  amount: booking.total_price,
                  status: booking.status === 'confirmed' ? 'Success' : (booking.status === 'cancelled' ? 'Failed' : 'Pending'),
                  method: booking.payment_method || 'Credit Card',
                  bookingDate: booking.created_at
              }));

              setPayments(formattedData);
          } catch (error) {
              console.error("Gagal load history:", error);
              // Fallback Dummy Data jika API error/kosong (Opsional, bisa dihapus jika production)
              setPayments([]);
          } finally {
              setLoading(false);
          }
      };

      if (user) {
          fetchHistory();
      }
  }, [user]);

  // Filter Logic (Status & Search)
  const filteredPayments = payments.filter(p => {
      const matchesFilter = activeFilter === 'All' || p.status === activeFilter;
      const matchesSearch = p.id.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            p.route.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesFilter && matchesSearch;
  });

  // Helper Format Rupiah
  const formatIDR = (amount: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);
  };

  // Helper Warna Status
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Success': return 'bg-green-100 text-green-700 border-green-200';
      case 'Pending': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'Failed': return 'bg-red-100 text-red-700 border-red-200';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const handleLogout = async () => {
    try { await signOut(); navigate('/'); } catch (error) { console.error(error); }
  };

  // Helper Foto Profil
  const getPhotoUrl = (path: string | null | undefined) => {
      if (!path) return "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=200&auto=format&fit=crop"; 
      if (path.startsWith('http')) return path; 
      return `https://elevengo.rf.gd/storage/${path}`; 
  };

  const userPhoto = getPhotoUrl(user?.photo_url);

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 font-sans">
      
      {/* HEADER */}
      <div className="bg-white sticky top-0 z-50 shadow-sm"><Header /></div>

      {/* MAIN CONTENT */}
      <div className="flex-grow w-full max-w-7xl mx-auto px-4 md:px-8 py-8 flex flex-col lg:flex-row gap-8">
        
        {/* --- SIDEBAR KIRI (DINAMIS USER) --- */}
        <div className="w-full lg:w-1/4">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col items-center sticky top-24">
            
            <div className="relative mb-4">
              <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-gray-100">
                <img src={userPhoto} alt="Profile" className="w-full h-full object-cover" />
              </div>
            </div>
            
            <h2 className="font-bold text-gray-800 text-lg mb-6 text-center">{user?.full_name || 'User'}</h2>

            <div className="w-full space-y-1">
              <button onClick={() => navigate('/profile')} className="w-full flex items-center justify-between px-4 py-3 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-3"><User size={18}/> Personal Details</div>
              </button>
              <button onClick={() => navigate('/help')} className="w-full flex items-center justify-between px-4 py-3 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-3"><HelpCircle size={18}/> Support</div>
              </button>
              <button onClick={() => navigate('/wallet')} className="w-full flex items-center justify-between px-4 py-3 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-3"><Wallet size={18}/> Wallet</div>
              </button>
              {/* Menu Aktif: Payment History */}
              <button className="w-full flex items-center justify-between px-4 py-3 rounded-lg text-sm font-medium bg-blue-50 text-blue-700 transition-colors border-l-4 border-blue-600">
                <div className="flex items-center gap-3"><History size={18}/> Payment History</div>
                <ChevronRight size={16} />
              </button>
              <button onClick={handleLogout} className="w-full flex items-center justify-between px-4 py-3 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-colors mt-4">
                <div className="flex items-center gap-3"><LogOut size={18}/> Log out</div>
              </button>
            </div>
          </div>
        </div>

        {/* --- KONTEN KANAN (HISTORY LIST) --- */}
        <div className="w-full lg:w-3/4 space-y-6">
          
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-2">
            <h1 className="text-2xl font-bold text-gray-800">Payment History</h1>
            
            {/* Filter Search */}
            <div className="relative w-full md:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input 
                    type="text" 
                    placeholder="Search booking ID..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-blue-500" 
                />
            </div>
          </div>

          {/* FILTER TABS */}
          <div className="flex gap-2 overflow-x-auto pb-2">
            {['All', 'Success', 'Pending', 'Failed'].map((status) => (
                <button
                    key={status}
                    onClick={() => setActiveFilter(status)}
                    className={`px-4 py-2 rounded-full text-xs font-bold transition-all whitespace-nowrap
                        ${activeFilter === status 
                            ? 'bg-blue-600 text-white shadow-md' 
                            : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'}
                    `}
                >
                    {status}
                </button>
            ))}
          </div>

          {/* LIST TRANSAKSI */}
          <div className="space-y-4">
            {loading ? (
                <div className="flex justify-center py-12"><Loader2 className="animate-spin text-blue-600 w-8 h-8" /></div>
            ) : filteredPayments.length > 0 ? (
                filteredPayments.map((item) => (
                    <div key={item.id} className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm hover:shadow-md transition-shadow flex flex-col md:flex-row gap-6 items-start md:items-center">
                        
                        {/* Kiri: Icon & Info Penerbangan */}
                        <div className="flex items-start gap-4 flex-1">
                            <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center flex-shrink-0">
                                <Plane className="w-6 h-6 text-blue-600 transform rotate-45" />
                            </div>
                            <div>
                                <h3 className="font-bold text-gray-800 text-lg">{item.route}</h3>
                                <div className="flex items-center gap-3 text-sm text-gray-500 mt-1">
                                    <span className="flex items-center gap-1"><Calendar size={14}/> {item.date}</span>
                                    <span>•</span>
                                    <span className="font-mono bg-gray-100 px-2 py-0.5 rounded text-xs text-gray-600">{item.flightCode}</span>
                                </div>
                                <p className="text-xs text-gray-400 mt-2">Booking ID: <span className="text-gray-600 font-medium">{item.id}</span></p>
                            </div>
                        </div>

                        {/* Tengah: Status & Metode */}
                        <div className="flex flex-col items-start md:items-end gap-2 min-w-[140px]">
                            <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getStatusColor(item.status)}`}>
                                {item.status}
                            </span>
                            <p className="text-xs text-gray-500 mt-1 capitalize">{item.method.replace('_', ' ')}</p>
                        </div>

                        {/* Kanan: Harga & Aksi */}
                        <div className="flex flex-col items-start md:items-end gap-3 min-w-[150px] border-t md:border-t-0 md:border-l border-gray-100 pt-4 md:pt-0 md:pl-6 w-full md:w-auto">
                            <p className="font-bold text-gray-800 text-lg">{formatIDR(item.amount)}</p>
                            
                            {item.status === 'Success' && (
                                <button className="flex items-center gap-2 text-blue-600 text-sm font-bold hover:underline">
                                    <FileText size={16} /> E-Ticket
                                </button>
                            )}
                            {item.status === 'Pending' && (
                                <button className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg text-xs font-bold transition-colors shadow-sm w-full md:w-auto text-center">
                                    Pay Now
                                </button>
                            )}
                            {item.status === 'Failed' && (
                                <span className="text-xs text-red-400 font-medium">Payment Expired</span>
                            )}
                        </div>

                    </div>
                ))
            ) : (
                // Empty State
                <div className="bg-white rounded-xl border border-dashed border-gray-300 p-12 flex flex-col items-center justify-center text-center">
                    <History className="w-12 h-12 text-gray-300 mb-3" />
                    <p className="text-gray-500 font-medium">No transaction history found.</p>
                </div>
            )}
          </div>

        </div>
      </div>
      
      {/* Footer otomatis di bawah */}
      <Footer />
    </div>
  );
}