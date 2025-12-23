import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  Bell, Menu, User, HelpCircle, History, LogOut, Plane, Clock, ChevronDown, Ticket, MapPin, Wine, Wallet, X
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import api from '../lib/axios'; 

interface HeaderProps {
  activePage?: 'flight' | 'map' | 'shop';
}

export default function Header({ activePage }: HeaderProps) {
  const { user, signOut, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation(); 
  
  
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isFlightStatusOpen, setIsFlightStatusOpen] = useState(false);
  const [activeMenuLabel, setActiveMenuLabel] = useState('Flight status');
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const getPhotoUrl = (path: string | null | undefined) => {
      if (!path) return "/images/jeno logo.jpg"; 
      if (path.startsWith('http')) return path; 
      return `https://elevengo.rf.gd/storage/${path}`; 
  };

  const getGuestLinkClass = (path: string) => {
    const isActive = location.pathname === path;
    if (isActive) {

      return "text-[#FFC086] border-b-2 border-[#FFC086] pb-1 font-heading2 transition-all";
    } else {

      return "text-white hover:text-gray-300 transition hover:underline hover:decoration-orange-300 font-Heading2";
    }
  };

  const flightMenuItems = [
    { id: 'flight', label: 'Check your flight status', shortLabel: 'Flight status', icon: Ticket, color: 'text-orange-500', path: '/FlightStatus' },
    { id: 'map', label: 'Map', shortLabel: 'Map', icon: MapPin, color: 'text-gray-600', path: '/FlightStatus' },
    { id: 'shop', label: 'Shop and Dine', shortLabel: 'Shop & Dine', icon: Wine, color: 'text-gray-600', path: '/FlightStatus' }
  ];

  const handleFlightMenuClick = (item: typeof flightMenuItems[0]) => {
    setIsFlightStatusOpen(false); 
    setIsMobileMenuOpen(false); 
    setActiveMenuLabel(item.shortLabel);
    navigate(item.path, { 
      state: { activeSidebar: item.id, timestamp: Date.now() } 
    }); 
  };

  useEffect(() => {
    if (activePage) {
      if (activePage === 'map') setActiveMenuLabel('Map');
      else if (activePage === 'shop') setActiveMenuLabel('Shop & Dine');
      else setActiveMenuLabel('Flight status');
    } 
    else if (location.pathname.includes('/FlightStatus')) {
      const state = location.state as { activeSidebar?: string } | null;
      if (state?.activeSidebar === 'map') setActiveMenuLabel('Map');
      else if (state?.activeSidebar === 'shop') setActiveMenuLabel('Shop & Dine');
      else setActiveMenuLabel('Flight status');
    } else {
      setActiveMenuLabel('Flight status');
    }
  }, [location, activePage]);

  useEffect(() => {
    if (user) loadNotifications();
  }, [user]);

  const loadNotifications = async () => {
    try {
      if (!user) return;
      
      const response = await api.get('/bookings');
      const data = response.data || [];
      const recentBookings = data.slice(0, 5);

      const notifs = recentBookings.map((item: any) => {
        if (!item.flight) return null;
        let message = '';
        let type = 'info';

        if (item.status === 'confirmed') { 
            message = `Your flight ${item.flight.flight_number} is confirmed.`; 
            type = 'success'; 
        } 
        else if (item.status === 'cancelled') { 
            message = `Your flight ${item.flight.flight_number} cancelled.`; 
            type = 'error'; 
        } 
        else { 
            message = `Payment pending for ${item.flight.destination}.`; 
            type = 'warning'; 
        }

        return { id: item.id, message, type };
      }).filter(Boolean);

      setNotifications(notifs);
      setUnreadCount(notifs.length);
    } catch (error) { 
        console.error("Gagal load notifikasi:", error); 
    }
  };

  const handleSignOut = () => { 
      localStorage.clear();
      sessionStorage.clear();
      setIsMobileMenuOpen(false);
      signOut().catch((err) => console.warn("Logout background warning:", err));
      window.location.replace('/kelompok11/login'); 
  };

  const getProfileMenuClass = (path: string) => {
    const isActive = location.pathname === path;
    return `w-full text-left px-5 py-3 text-sm flex items-center gap-3 transition-colors ${
      isActive ? 'text-blue-600 bg-blue-50 font-medium' : 'text-gray-600 hover:bg-gray-50'
    }`;
  };

  if (loading) {
    return (
      <nav className="sticky top-0 w-full h-[72px] bg-transparent z-[999]"></nav>
    );
  }

  if (user) {
    return (
      <nav className="sticky top-0 w-full bg-white/95 backdrop-blur-sm shadow-sm border-b border-gray-100 py-1 px-4 md:px-12 z-[999] font-sans transition-all">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          
          {/* LOGO & MENU KIRI */}
          <div className="hidden md:flex items-center gap-8 text-sm font-medium">
            <div className="relative">
              <button 
                onClick={() => { setIsFlightStatusOpen(!isFlightStatusOpen); setIsNotifOpen(false); setIsProfileOpen(false); }}
                className={`flex items-center gap-1 transition-colors focus:outline-none ${location.pathname.includes('/FlightStatus') ? 'text-blue-900 font-bold' : 'text-gray-500 hover:text-blue-900'}`}
              >
                {activeMenuLabel}
                <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isFlightStatusOpen ? 'rotate-180' : ''}`} />
              </button>

              {isFlightStatusOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setIsFlightStatusOpen(false)}></div>
                  <div className="absolute left-0 mt-3 w-64 bg-white shadow-xl rounded-xl border border-gray-100 py-2 z-20 animate-fade-in-down">
                    {flightMenuItems.map((item) => (
                      <button key={item.id} onClick={() => handleFlightMenuClick(item)} className="w-full text-left px-5 py-3 text-sm text-gray-600 hover:bg-gray-50 flex items-center gap-3 transition-colors group">
                        <item.icon className={`w-5 h-5 ${item.color} group-hover:scale-110 transition-transform`} />
                        <span className="font-medium">{item.label}</span>
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
            
            <Link to="/" className={`transition-colors ${location.pathname === '/' ? 'text-blue-900 font-bold' : 'text-gray-500 hover:text-blue-900'}`}>Buy tickets</Link>
            <Link to="/MyBooking" className={`transition-colors ${location.pathname === '/MyBooking' ? 'text-blue-900 font-bold' : 'text-gray-500 hover:text-blue-900'}`}>My Bookings</Link>
          </div>

          <div className="absolute left-1/2 transform -translate-x-1/2 md:block hidden cursor-pointer" onClick={() => navigate('/')}>
             <span className="text-2xl font-bold text-gray-800 tracking-tight">ElevenGo</span>
          </div>
          <div className="md:hidden flex items-center cursor-pointer" onClick={() => navigate('/')}>
             <span className="text-xl font-bold text-gray-800">ElevenGo</span>
          </div>

          
          <div className="hidden md:flex items-center gap-6">
            <div className="relative">
              <button onClick={() => { setIsNotifOpen(!isNotifOpen); setIsProfileOpen(false); setIsFlightStatusOpen(false); }} className="relative text-gray-500 hover:text-gray-700 transition-colors focus:outline-none">
                <Bell className="w-6 h-6 " />
                {unreadCount > 0 && <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-blue-600 rounded-full border-2 border-white"></span>}
              </button>
              {isNotifOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setIsNotifOpen(false)}></div>
                  <div className="absolute right-0 mt-3 w-80 bg-white shadow-xl rounded-xl border border-gray-100 py-2 z-20 animate-fade-in-down overflow-hidden">
                    <div className="px-4 py-2 border-b border-gray-50 bg-gray-50/50"><h3 className="font-bold text-gray-700 text-sm">Notifications</h3></div>
                    <div className="max-h-[300px] overflow-y-auto">
                      {notifications.length > 0 ? (
                        notifications.map((notif) => (
                          <div key={notif.id} className="px-4 py-3 border-b border-gray-50 hover:bg-gray-50 transition-colors flex gap-3 items-start">
                             <div className="mt-1 flex-shrink-0">{notif.type === 'success' ? <Plane className="w-5 h-5 text-blue-600"/> : <Clock className="w-5 h-5 text-gray-400"/>}</div>
                             <div><p className="text-sm text-gray-600 leading-snug">{notif.message}</p></div>
                          </div>
                        ))
                      ) : (<div className="px-4 py-6 text-center text-gray-400 text-sm">No new notifications</div>)}
                    </div>
                  </div>
                </>
              )}
            </div>
            
            <div className="relative">
               <button onClick={() => { setIsProfileOpen(!isProfileOpen); setIsNotifOpen(false); setIsFlightStatusOpen(false); }} className="flex items-center gap-2 focus:outline-none">
                 <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-gray-100 hover:border-blue-200 transition-all">
                   <img src={getPhotoUrl(user.photo_url)} alt="Profile" className="w-full h-full object-cover"/>
                 </div>
                 <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isProfileOpen ? 'rotate-180' : ''}`} />
               </button>
               {isProfileOpen && (
                 <>
                   <div className="fixed inset-0 z-10" onClick={() => setIsProfileOpen(false)}></div>
                   <div className="absolute right-0 mt-3 w-64 bg-white shadow-xl rounded-xl border border-gray-100 py-2 z-20 animate-fade-in-down">
                     <div className="px-4 py-2 border-b border-gray-50 mb-2"><p className="text-xs text-gray-400">Signed in as</p><p className="text-sm font-bold text-gray-800 truncate">{user.email}</p></div>
                     <button onClick={() => { navigate('/profile'); setIsProfileOpen(false); }} className={getProfileMenuClass('/profile')}><User className="w-4 h-4" /> Personal Details</button>
                     <button onClick={() => { navigate('/help'); setIsProfileOpen(false); }} className={getProfileMenuClass('/help')}><HelpCircle className="w-4 h-4" /> Support</button>
                     <button onClick={() => { navigate('/wallet'); setIsProfileOpen(false); }} className={getProfileMenuClass('/wallet')}><Wallet className="w-4 h-4" /> Wallet</button>
                     <button onClick={() => { navigate('/Paymenthistory'); setIsProfileOpen(false); }} className={getProfileMenuClass('/Paymenthistory')}><History className="w-4 h-4" /> Payment History</button>
                     <div className="my-1 border-t border-gray-100"></div>
                     <button onClick={handleSignOut} className="w-full text-left px-5 py-3 text-sm text-gray-600 hover:bg-red-50 hover:text-red-600 flex items-center gap-3 transition-colors"><LogOut className="w-4 h-4" /> Log out</button>
                   </div>
                 </>
               )}
            </div>
          </div>

          <div className="flex md:hidden items-center gap-4">
              <div className="relative">
                  <button onClick={() => { setIsNotifOpen(!isNotifOpen); setIsMobileMenuOpen(false); }} className="relative text-gray-500 p-1">
                    <Bell className="w-6 h-6 " />
                    {unreadCount > 0 && <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-blue-600 rounded-full border-2 border-white"></span>}
                  </button>

                  {isNotifOpen && (
                    <>
                      <div className="fixed inset-0 z-20" onClick={() => setIsNotifOpen(false)}></div>
                      <div className="absolute right-[-60px] top-12 w-[300px] bg-white shadow-2xl rounded-xl border border-gray-100 py-2 z-30 animate-fade-in-down overflow-hidden">
                        <div className="px-4 py-2 border-b border-gray-50 bg-gray-50/50 flex justify-between items-center">
                            <h3 className="font-bold text-gray-700 text-sm">Notifications</h3>
                            <button onClick={() => setIsNotifOpen(false)}><X className="w-4 h-4 text-gray-400"/></button>
                        </div>
                        <div className="max-h-[300px] overflow-y-auto">
                          {notifications.length > 0 ? (
                            notifications.map((notif) => (
                              <div key={notif.id} className="px-4 py-3 border-b border-gray-50 hover:bg-gray-50 transition-colors flex gap-3 items-start">
                                 <div className="mt-1 flex-shrink-0">{notif.type === 'success' ? <Plane className="w-5 h-5 text-blue-600"/> : <Clock className="w-5 h-5 text-gray-400"/>}</div>
                                 <div><p className="text-xs text-gray-600 leading-snug">{notif.message}</p></div>
                              </div>
                            ))
                          ) : (<div className="px-4 py-6 text-center text-gray-400 text-sm">No new notifications</div>)}
                        </div>
                      </div>
                    </>
                  )}
              </div>

              <button onClick={() => { setIsMobileMenuOpen(!isMobileMenuOpen); setIsNotifOpen(false); }} className="text-gray-700 focus:outline-none">
                  {isMobileMenuOpen ? <X className="w-7 h-7" /> : <Menu className="w-7 h-7" />}
              </button>
          </div>

          {isMobileMenuOpen && (
              <div className="absolute top-full left-0 w-full bg-white shadow-lg border-t border-gray-100 flex flex-col py-4 px-6 md:hidden z-50 animate-fade-in-down h-screen overflow-y-auto pb-32">
                  <div className="flex items-center gap-4 mb-6 border-b border-gray-100 pb-4">
                      <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-blue-100">
                          <img src={getPhotoUrl(user.photo_url)} alt="Profile" className="w-full h-full object-cover"/>
                      </div>
                      <div>
                          <p className="font-bold text-gray-800">{user.email?.split('@')[0]}</p>
                          <p className="text-xs text-gray-500">{user.email}</p>
                      </div>
                  </div>
                  
                  <Link to="/" onClick={() => setIsMobileMenuOpen(false)} className="py-3 text-gray-700 font-medium border-b border-gray-50 flex items-center gap-3"><Plane className="w-4 h-4"/> Buy tickets</Link>
                  <Link to="/MyBooking" onClick={() => setIsMobileMenuOpen(false)} className="py-3 text-gray-700 font-medium border-b border-gray-50 flex items-center gap-3"><Ticket className="w-4 h-4"/> My Bookings</Link>
                  <Link to="/FlightStatus" onClick={() => setIsMobileMenuOpen(false)} className="py-3 text-gray-700 font-medium border-b border-gray-50 flex items-center gap-3"><Clock className="w-4 h-4"/> Flight Status</Link>
                  
                  <Link to="/profile" onClick={() => setIsMobileMenuOpen(false)} className="py-3 text-gray-600 text-sm flex items-center gap-3"><User className="w-4 h-4"/> Personal Details</Link>
                  <Link to="/help" onClick={() => setIsMobileMenuOpen(false)} className="py-3 text-gray-600 text-sm flex items-center gap-3"><HelpCircle className="w-4 h-4"/> Support</Link>
                  <Link to="/wallet" onClick={() => setIsMobileMenuOpen(false)} className="py-3 text-gray-600 text-sm flex items-center gap-3"><Wallet className="w-4 h-4"/> Wallet</Link>
                  <Link to="/Paymenthistory" onClick={() => setIsMobileMenuOpen(false)} className="py-3 text-gray-600 text-sm flex items-center gap-3"><History className="w-4 h-4"/> Payment History</Link>
                  
                  <button onClick={handleSignOut} className="py-3 text-red-500 text-sm font-bold flex items-center gap-3 mt-4"><LogOut className="w-4 h-4"/> Log out</button>
              </div>
          )}

        </div>
      </nav>
    );
  }

  return (
    <nav className="absolute top-0 left-0 w-full z-50 transition-all">
      <div className="flex items-center justify-between px-6 -py-1 md:px-12 bg-transparent text-white font-sans max-w-7xl mx-auto">
        <div 
        className="flex items-center gap-2 cursor-pointer" 
        onClick={() => navigate('/')}>
        <img
          src="/images/logo.png"
          alt="ElevenGo"
          className="h-20 md:h-16 object-contain"
          />
        </div>


        <div className="hidden md:flex items-center gap-8 text-sm font-medium">
          <Link to="/" className={getGuestLinkClass('/')}>Home</Link>
          <Link to="/help" className={getGuestLinkClass('/help')}>Help</Link>
          <Link to="/login" className={getGuestLinkClass('/login')}>Log in</Link>
          <Link to="/signup" className={getGuestLinkClass('/signup')}>Sign Up</Link>
        </div>


        <div className="md:hidden">
            <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="text-white focus:outline-none">
                {isMobileMenuOpen ? <X className="w-7 h-7" /> : <Menu className="w-7 h-7" />}
            </button>
        </div>
      </div>


      {isMobileMenuOpen && (
          <div className="absolute top-full left-0 w-full bg-[#00173F] text-white shadow-xl flex flex-col py-6 px-8 md:hidden z-50 animate-fade-in-down border-t border-white/10 h-screen">
              
              <Link to="/" onClick={() => setIsMobileMenuOpen(false)} className={`py-3 border-b border-white/10 font-medium ${location.pathname === '/' ? 'text-[#FFC086]' : 'text-white hover:text-gray-300'}`}>Home</Link>
              <Link to="/help" onClick={() => setIsMobileMenuOpen(false)} className={`py-3 border-b border-white/10 font-medium ${location.pathname === '/help' ? 'text-[#FFC086]' : 'text-white hover:text-gray-300'}`}>Help</Link>
              <Link to="/login" onClick={() => setIsMobileMenuOpen(false)} className={`py-3 border-b border-white/10 font-medium ${location.pathname === '/login' ? 'text-[#FFC086]' : 'text-white hover:text-gray-300'}`}>Log in</Link>
              <Link to="/signup" onClick={() => setIsMobileMenuOpen(false)} className={`py-3 font-medium ${location.pathname === '/signup' ? 'text-[#FFC086]' : 'text-white hover:text-gray-300'}`}>Sign Up</Link>
          </div>
      )}
    </nav>
  );
}