import { Routes, Route } from "react-router-dom";
import { AuthProvider } from './contexts/AuthContext';
import { X } from 'lucide-react'; // Tambahan Icon Close

import { Home } from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Payment from './pages/payment';
import BookingProcess from './pages/BookingProcess';
import Profile from './pages/Profile';
import Help from './pages/help';
import FlightStatus from './pages/FlightStatus';
import Wallet from './pages/Wallet';
import PaymentHistory from "./pages/PaymentHistory";
import MyBooking from "./pages/MyBookings";
import { useRegisterSW } from 'virtual:pwa-register/react';

function App() {
  // --- LOGIKA CEK UPDATE PWA ---
  const {
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegistered(r) {
      console.log('SW Registered: ' + r)
    },
    onRegisterError(error) {
      console.log('SW registration error', error)
    },
  });

  return (
    <AuthProvider>
      {needRefresh && (
        <div className="fixed bottom-6 right-6 bg-[#1e293b] border border-gray-700 text-white p-5 rounded-xl shadow-2xl z-[9999] flex flex-col gap-3 max-w-xs animate-bounce">
          <div className="flex justify-between items-start gap-4">
             <div>
                <h3 className="font-bold text-sm text-blue-400">Update Tersedia! 🚀</h3>
                <p className="text-xs text-gray-300 mt-1">Versi baru ElevenGo siap digunakan.</p>
             </div>
             <button onClick={() => setNeedRefresh(false)} className="text-gray-500 hover:text-white transition-colors">
                <X size={16}/>
             </button>
          </div>
          <button
            className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold py-2.5 px-4 rounded-lg w-full transition-colors shadow-lg"
            onClick={() => updateServiceWorker(true)}
          >
            Refresh Sekarang
          </button>
        </div>
      )}

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/payment" element={<Payment />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/booking" element={<BookingProcess />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/help" element={<Help />} />
        <Route path="/FlightStatus" element={<FlightStatus />} />
        <Route path="/wallet" element={<Wallet />} />
        <Route path="/paymenthistory" element={<PaymentHistory />} />
        <Route path="/MyBooking" element={<MyBooking />} />
      </Routes>
    </AuthProvider>
  );
}

export default App;