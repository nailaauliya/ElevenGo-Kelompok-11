import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  User, HelpCircle, Wallet as WalletIcon, History, LogOut, 
  Plus, ArrowUpRight, ArrowDownLeft, QrCode, ChevronRight, X, Loader2
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import api from '../lib/axios'; 
import Header from '../components/Header';
import Footer from '../components/Footer';

const TopUpModal = ({ isOpen, onClose, onTopUp, loading }: any) => {
    const [amount, setAmount] = useState('');
    
    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onTopUp(parseInt(amount));
        setAmount('');
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-sm overflow-hidden animate-fade-in-up">
                <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                    <h3 className="font-bold text-gray-800">Top Up Balance</h3>
                    <button onClick={onClose} disabled={loading}><X className="w-5 h-5 text-gray-400 hover:text-gray-600"/></button>
                </div>
                <form onSubmit={handleSubmit} className="p-6">
                    <label className="block text-xs font-bold text-gray-500 mb-2 uppercase">Amount (IDR)</label>
                    <input 
                        type="number" 
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        placeholder="e.g 100000"
                        className="w-full border border-gray-300 rounded-lg p-3 text-lg font-bold text-gray-800 focus:ring-2 focus:ring-blue-500 outline-none mb-6"
                        required
                        min="10000"
                        disabled={loading}
                    />
                    <div className="grid grid-cols-3 gap-2 mb-6">
                        {[50000, 100000, 200000].map(val => (
                            <button key={val} type="button" onClick={() => setAmount(val.toString())} disabled={loading} className="border border-gray-200 py-2 rounded text-xs font-medium hover:bg-blue-50 hover:text-blue-600 transition-colors">
                                {val.toLocaleString()}
                            </button>
                        ))}
                    </div>
                    <button type="submit" disabled={loading} className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-bold py-3 rounded-lg shadow-lg shadow-blue-500/30 transition-transform active:scale-95 flex justify-center gap-2">
                        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Confirm Top Up'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default function Wallet() {
  const navigate = useNavigate();
  const { user, signOut, setUser } = useAuth(); 

  
  const [balance, setBalance] = useState(0); 
  const [transactions, setTransactions] = useState<any[]>([]);
  const [isTopUpOpen, setIsTopUpOpen] = useState(false);
  const [loading, setLoading] = useState(false);


  useEffect(() => {
      if (user) {
         setBalance(user.wallet_balance || 0);
      }
      
      fetchWalletData();
  }, []); 

  const fetchWalletData = async () => {
      try {

          try {
            const historyRes = await api.get('/wallet/history');
            setTransactions(historyRes.data);
          } catch (err) {
            console.warn("Gagal load history (abaikan jika belum ada transaksi)");
          }
          const userRes = await api.get('/user'); 
          
          if (userRes.data && userRes.data.wallet_balance !== undefined) {
             setBalance(userRes.data.wallet_balance);
             // Update global context
             if (setUser) setUser(userRes.data);
          }

      } catch (error) {
          console.error("Gagal load data wallet", error);
          if (user) setBalance(user.wallet_balance || 0);
      }
  };

  const handleTopUp = async (amount: number) => {
      setLoading(true);
      try {
     
          const res = await api.post('/wallet/topup', { amount });
          
          setBalance(res.data.balance); 
          fetchWalletData();

          setIsTopUpOpen(false);
          alert(`Top up success! New Balance: ${formatIDR(res.data.balance)}`);

      } catch (error) {
          console.error("Top up failed", error);
          alert("Top up failed. Please try again.");
      } finally {
          setLoading(false);
      }
  };

  const formatIDR = (amount: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(Math.abs(amount));
  };

  const formatDate = (dateString: string) => {
      return new Date(dateString).toLocaleString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
  };

  const handleLogout = async () => {
    try { await signOut(); navigate('/'); } catch (error) { console.error(error); }
  };

  const getPhotoUrl = (path: string | null | undefined) => {
      if (!path) return "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=200&auto=format&fit=crop"; 
      if (path.startsWith('http')) return path; 
      return `https://elevengo.rf.gd/storage/${path}`; 
  };

  const userName = user?.full_name || "User";
  const userPhoto = getPhotoUrl(user?.photo_url);

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 font-sans">
      
      <div className="bg-white sticky top-0 z-50 shadow-sm"><Header /></div>

      <TopUpModal isOpen={isTopUpOpen} onClose={() => setIsTopUpOpen(false)} onTopUp={handleTopUp} loading={loading} />

      <div className="flex-grow w-full max-w-7xl mx-auto px-4 md:px-8 py-8 flex flex-col lg:flex-row gap-8">
        
        <div className="w-full lg:w-1/4">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col items-center sticky top-24">
            
            <div className="relative mb-4">
              <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-gray-100">
                <img src={userPhoto} alt="Profile" className="w-full h-full object-cover" />
              </div>
            </div>
            
            <h2 className="font-bold text-gray-800 text-lg mb-6 text-center">{userName}</h2>

            <div className="w-full space-y-1">
              <button onClick={() => navigate('/profile')} className="w-full flex items-center justify-between px-4 py-3 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-3"><User size={18}/> Personal Details</div>
              </button>
              <button onClick={() => navigate('/help')} className="w-full flex items-center justify-between px-4 py-3 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-3"><HelpCircle size={18}/> Support</div>
              </button>
              {/* Menu Aktif: Wallet */}
              <button className="w-full flex items-center justify-between px-4 py-3 rounded-lg text-sm font-medium bg-blue-50 text-blue-700 transition-colors border-l-4 border-blue-600">
                <div className="flex items-center gap-3"><WalletIcon size={18}/> Wallet</div>
                <ChevronRight size={16} />
              </button>
              <button onClick={() => navigate('/Paymenthistory')} className="w-full flex items-center justify-between px-4 py-3 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-3"><History size={18}/> Payment History</div>
              </button>
              <button onClick={handleLogout} className="w-full flex items-center justify-between px-4 py-3 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-colors mt-4">
                <div className="flex items-center gap-3"><LogOut size={18}/> Log out</div>
              </button>
            </div>
          </div>
        </div>
        <div className="w-full lg:w-3/4 space-y-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">My Wallet</h1>
          <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl p-8 text-white shadow-lg relative overflow-hidden">
             <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full -mr-16 -mt-16 blur-3xl pointer-events-none"></div>
             <div className="absolute bottom-0 left-0 w-40 h-40 bg-purple-500 opacity-20 rounded-full -ml-10 -mb-10 blur-2xl pointer-events-none"></div>

             <div className="relative z-10">
                <p className="text-blue-100 text-sm font-medium mb-1">Total Balance</p>
                <h2 className="text-4xl font-bold mb-8">{formatIDR(balance)}</h2>

                <div className="flex gap-4">
                   <button onClick={() => setIsTopUpOpen(true)} className="flex items-center gap-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm px-4 py-2.5 rounded-lg text-sm font-bold transition-all active:scale-95">
                      <Plus size={16} /> Top Up
                   </button>
                   <button className="flex items-center gap-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm px-4 py-2.5 rounded-lg text-sm font-bold transition-all active:scale-95 opacity-50 cursor-not-allowed">
                      <ArrowUpRight size={16} /> Transfer
                   </button>
                   <button className="flex items-center gap-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm px-4 py-2.5 rounded-lg text-sm font-bold transition-all active:scale-95 opacity-50 cursor-not-allowed">
                      <QrCode size={16} /> Scan
                   </button>
                </div>
             </div>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
             <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
                <h3 className="font-bold text-gray-800">Recent Transactions</h3>
                <button className="text-blue-600 text-xs font-bold hover:underline">View All</button>
             </div>
             
             <div className="divide-y divide-gray-100">
                {transactions.map((trx) => (
                   <div key={trx.id} className="px-6 py-4 flex justify-between items-center hover:bg-gray-50 transition-colors cursor-pointer group">
                      <div className="flex items-center gap-4">
                          <div>
                             <p className="text-sm font-bold text-gray-800 group-hover:text-blue-600 transition-colors">{trx.title}</p>
                             <p className="text-xs text-gray-500">{formatDate(trx.created_at)}</p>
                          </div>
                       </div>
                       <div className="text-right">
                          <p className={`text-sm font-bold ${trx.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                             {trx.type === 'income' ? '+' : '-'} {formatIDR(trx.amount)}
                          </p>
                          {trx.type === 'income' ? (
                             <span className="text-[10px] text-green-500 flex items-center justify-end gap-1"><ArrowDownLeft size={10}/> Income</span>
                          ) : (
                             <span className="text-[10px] text-red-400 flex items-center justify-end gap-1"><ArrowUpRight size={10}/> Expense</span>
                          )}
                       </div>
                    </div>
                ))}
             </div>
             
             {transactions.length === 0 && (
                <div className="p-8 text-center text-gray-400 text-sm">No transactions yet.</div>
             )}
          </div>

        </div>
      </div>
      
      <Footer />
    </div>
  );
}