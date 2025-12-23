import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { User, Luggage, CreditCard, Receipt, ArrowRight, Check, Plane, Calendar } from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import api from '../lib/axios'; 
import { useAuth } from '../contexts/AuthContext'; 

// Helper Format Rupiah
const formatIDR = (amount: number) => {
  if (typeof amount !== 'number') return 'Rp 0';
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);
};

export default function Payment() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, setUser } = useAuth(); 
  const [isPaid, setIsPaid] = useState(false);
  const [loading, setLoading] = useState(false);

 
  const defaultBookingData = {
    contactDetails: { title: 'Mr/Ms', firstName: 'Guest', lastName: '' },
    passengerCount: 1,
    passengers: [], 
    flightDetails: { 
        segments: [
            { id: 0, origin: 'JKT', destination: 'DPS', departureTime: new Date().toISOString(), airline: 'Airline', price: 0 }
        ],
        airline: 'Airline'
    },
    seatsSelected: [], 
    luggage: { totalCost: 0, label: 'Standard (20kg)' },
    paymentMethod: 'visa',
    pricing: { basePrice: 0, tax: 0, discount: 0, total: 0 }
  };

 
  const rawState = location.state;
  const bookingData = {
      ...defaultBookingData,
      ...rawState,
      passengers: rawState?.passengers || [], 
      contactDetails: rawState?.contactDetails || defaultBookingData.contactDetails,
      flightDetails: rawState?.flightDetails || defaultBookingData.flightDetails,
      pricing: rawState?.pricing || defaultBookingData.pricing,
      luggage: rawState?.luggage || defaultBookingData.luggage,
      seatsSelected: rawState?.seatsSelected || []
  };

  const getSeatsForFlight = (flightIndex: number) => {
      const seats = bookingData.seatsSelected;
      if (!seats || (Array.isArray(seats) && seats.length === 0)) return 'Auto-assigned';
      try {
          if (Array.isArray(seats) && Array.isArray(seats[0])) {
              const seatsForThisSegment = seats.map((paxSeats: any) => paxSeats[flightIndex]).filter(Boolean);
              return seatsForThisSegment.length > 0 ? seatsForThisSegment.join(', ') : 'Auto-assigned';
          }
          if (Array.isArray(seats)) {
              return seats[flightIndex] || seats[0] || 'Auto-assigned';
          }
          if (typeof seats === 'string') return seats;
          return 'Auto-assigned';
      } catch (e) {
          return 'Auto-assigned';
      }
  };

  const getAllSeatsString = () => {
      const seats = bookingData.seatsSelected;
      if (Array.isArray(seats)) return seats.flat().join(', ');
      return String(seats);
  };

  const handlePayment = async () => {
    setLoading(true);


    if (bookingData.paymentMethod === 'wallet') {
        const currentBalance = user?.wallet_balance || 0;
        const totalCost = bookingData.pricing?.total || 0;

        if (currentBalance < totalCost) {
            alert(`Saldo tidak cukup! Saldo: ${formatIDR(currentBalance)}, Tagihan: ${formatIDR(totalCost)}`);
            setLoading(false);
            return;
        }
    }

    try {
        const segments = bookingData.flightDetails?.segments || [];
        const seatString = getAllSeatsString(); 

        const bookingsPromises = segments.map((segment: any) => {
            return api.post('/bookings', {
                flight_id: segment.id || 1, 
                payment_method: bookingData.paymentMethod, 
                total_price: bookingData.pricing?.total || 0,
                status: 'confirmed', 
                seat_number: seatString, 
         
            });
        });

        await Promise.all(bookingsPromises);
        try {
            const userRes = await api.get('/user');
            if (userRes.data && setUser) {
                console.log("Saldo Updated dari Server:", userRes.data.wallet_balance);
                setUser(userRes.data); 
            }
        } catch (fetchError) {
            console.error("Gagal refresh saldo, melakukan update manual sementara...");
            if (bookingData.paymentMethod === 'wallet' && user) {
                const newBalance = (user.wallet_balance || 0) - (bookingData.pricing?.total || 0);
                if (setUser) setUser({ ...user, wallet_balance: newBalance });
            }
        }

        setIsPaid(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });

    } catch (error) {
        console.error("Booking failed:", error);
        alert("Pembayaran gagal. Silakan coba lagi.");
    } finally {
        setLoading(false);
    }
  };

 
  if (isPaid) {
    return (
      <div className="min-h-screen bg-gray-50 font-sans flex flex-col">
        <style>{`
          @keyframes popIn {
            0% { transform: scale(0); opacity: 0; }
            50% { transform: scale(1.2); }
            100% { transform: scale(1); opacity: 1; }
          }
          .animate-pop {
            animation: popIn 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
          }
        `}</style>

        <div className="bg-white"><Header /></div>

        <div className="flex flex-col items-center justify-start text-center px-6 pt-10 pb-0 w-full max-w-5xl mx-auto">
           <div className="w-20 h-20 rounded-full border-4 border-[#00C058] flex items-center justify-center mb-6 animate-pop shadow-lg shadow-green-100">
              <Check className="w-10 h-10 text-[#00C058] stroke-[4]" />
           </div>
           <p className="text-1xl font-normal text-gray-600 mb-1 animate-fade-in-up">Your payment has been successfully processed</p>
           <p className="text-gray-600 mb-1 text-sm animate-fade-in-up delay-100">
               Total paid: <span className="font-bold text-gray-800">{formatIDR(bookingData.pricing?.total)}</span> via {(bookingData.paymentMethod === 'wallet' ? 'ElevenPay Wallet' : bookingData.paymentMethod).toUpperCase()}
           </p>
           <p className="text-gray-600 mb-6 text-sm animate-fade-in-up delay-100">Check the <span onClick={() => navigate('/MyBooking')} className="text-blue-600 font-semibold cursor-pointer hover:underline">My Bookings</span> from your profile to see all available tickets</p>
           <p className="text-gray-600 mb-1 text-sm animate-fade-in-up delay-100"> We will notify you two days before departure to prepare.</p>
           <p className="text-gray-600 mb-1 text-sm animate-fade-in-up delay-100"> Until then, pack your bags and get ready for your trip</p>
           <div className="w-full max-w-6xl relative mt-1 animate-fade-in delay-300">
              <img src="/images/plane3.png" alt="Airplane Success" className="w-full h-auto object-contain drop-shadow-xl"/>
           </div>
        </div>
        <Footer />
      </div>
    );
  }

  
  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-800 flex flex-col">
      <div className="bg-white"><Header /></div>

      <div className="flex-grow max-w-5xl mx-auto w-full px-6 py-10 pb-20">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Confirm information</h1>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 mb-6 overflow-hidden">
            <div className="p-6">
                
                
                <div className="flex items-start gap-4 mb-6 border-b border-gray-100 pb-4">
                    <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 shrink-0">
                        <User className="w-5 h-5" />
                    </div>
                    <div className="w-full">
                        <p className="text-sm font-bold text-gray-900 mb-2">Passenger List</p>
                        <div className="space-y-2">
                            {bookingData.passengers && bookingData.passengers.length > 0 ? (
                                bookingData.passengers.map((p: any, idx: number) => (
                                    <div key={idx} className="flex justify-between items-center bg-gray-50 p-2 rounded-md">
                                        <div className="text-sm text-gray-700">
                                            <span className="font-semibold">{p.title} {p.firstName} {p.lastName}</span>
                                        </div>
                                        <span className="text-[10px] bg-white border border-gray-200 px-2 py-0.5 rounded text-gray-500 uppercase font-bold tracking-wider">
                                            {p.type}
                                        </span>
                                    </div>
                                ))
                            ) : (
                                // Fallback jika data kosong
                                <p className="text-sm text-gray-500">
                                    {bookingData.contactDetails?.firstName || 'Guest'} {bookingData.contactDetails?.lastName || ''}
                                </p>
                            )}
                        </div>
                    </div>
                </div>
               
                <div className="space-y-4">
                    {bookingData.flightDetails?.segments?.map((seg: any, idx: number) => (
                        <div key={idx} className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gray-50 p-4 rounded-lg">
                            {/* Rute Info */}
                            <div className="flex items-center gap-3 md:w-1/3">
                                <Plane className={`w-5 h-5 text-gray-600 ${idx % 2 !== 0 ? 'rotate-180' : ''}`} />
                                <div>
                                    <p className="text-xs font-bold text-gray-700 uppercase">
                                      Flight {idx + 1}
                                    </p>
                                    <p className="text-sm font-semibold text-gray-900">{seg.origin} <span className="text-gray-400">→</span> {seg.destination}</p>
                                    <p className="text-xs text-gray-500 flex items-center gap-1">
                                        <Calendar className="w-3 h-3"/> 
                                        {seg.departureTime ? new Date(seg.departureTime).toLocaleDateString() : 'Date TBD'}
                                    </p>
                                </div>
                            </div>

                            {/* Bagasi Info */}
                            <div className="flex items-center gap-3 md:w-1/3">
                                <Luggage className="w-5 h-5 text-gray-400" />
                                <div className="text-xs text-gray-600">
                                    <p>Baggage: {bookingData.luggage?.totalCost > 0 ? 'Extra Added' : 'Standard 20kg'}</p>
                                </div>
                            </div>

                            {/* Kursi Info */}
                            <div className="md:w-1/3 text-right">
                                <p className="text-xs font-bold text-gray-700">Seats</p>
                                <p className="text-xs text-gray-600 font-bold text-blue-600">
                                    {getSeatsForFlight(idx)}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 mb-6 p-8">
          <div className="flex items-center gap-3 mb-6">
            <CreditCard className="w-5 h-5 text-gray-600" />
            <h2 className="font-semibold text-gray-800">Payment method</h2>
          </div>
          
          <div className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg max-w-md bg-gray-50/50">
            {bookingData.paymentMethod === 'visa' ? (
               <>
                 <div className="w-12 h-8 bg-white border border-gray-200 rounded flex items-center justify-center">
                    <span className="text-blue-800 font-bold italic text-sm">VISA</span>
                 </div>
                 <div><p className="font-mono text-gray-700 font-semibold">**** **** **** 5174</p></div>
               </>
            ) : bookingData.paymentMethod === 'master' || bookingData.paymentMethod === 'mastercard' ? (
               <>
                 <div className="flex -space-x-1">
                    <div className="w-4 h-4 rounded-full bg-red-500 opacity-80"></div>
                    <div className="w-4 h-4 rounded-full bg-yellow-500 opacity-80"></div>
                 </div>
                 <div><p className="font-mono text-gray-700 font-semibold">**** **** **** 3333</p></div>
               </>
            ) : (
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center font-bold text-xs">
                        {bookingData.paymentMethod ? bookingData.paymentMethod[0].toUpperCase() : 'C'}
                    </div>
                    <p className="font-semibold capitalize">{bookingData.paymentMethod === 'wallet' ? 'ElevenPay Wallet' : bookingData.paymentMethod}</p>
                </div>
            )}
          </div>
        </div>


        <div className="bg-white rounded-xl shadow-sm border border-gray-100 mb-8 p-8">
          <div className="flex items-center gap-3 mb-6"><Receipt className="w-5 h-5 text-gray-600" /><h2 className="font-semibold text-gray-800">Subtotal</h2></div>
          <div className="space-y-3 pl-8">
            <div className="flex justify-between text-sm">
                <span className="text-blue-600 font-medium">
                    Flight tickets ({bookingData.passengerCount} Pax x {bookingData.flightDetails?.segments?.length || 1} Flights)
                </span>
                <span className="text-gray-600">{formatIDR(bookingData.pricing?.basePrice)}</span>
            </div>
            
            {bookingData.luggage?.totalCost > 0 && (
                <div className="flex justify-between text-sm">
                    <span className="text-blue-600 font-medium">Extra Luggage</span>
                    <span className="text-gray-600">{formatIDR(bookingData.luggage.totalCost)}</span>
                </div>
            )}

            {bookingData.pricing?.tax > 0 && (
                <div className="flex justify-between text-sm">
                    <span className="text-gray-500 font-medium">Tax & Fees</span>
                    <span className="text-gray-600">{formatIDR(bookingData.pricing.tax)}</span>
                </div>
            )}

            {bookingData.pricing?.discount > 0 ? (
                <div className="flex justify-between text-sm pb-4 border-b border-gray-100">
                    <span className="text-green-600 font-medium">Ticket Discount</span>
                    <span className="text-green-600">- {formatIDR(bookingData.pricing.discount)}</span>
                </div>
            ) : (
                <div className="pb-4 border-b border-gray-100"></div>
            )}
            
            <div className="flex justify-end items-center gap-4 pt-2">
                <span className="text-gray-800 font-bold">Total :</span>
                <span className="text-xl font-bold text-orange-500">
                    {formatIDR(bookingData.pricing?.total)}
                </span>
            </div>
          </div>
        </div>

          <div className="flex justify-end">
          <button 
            onClick={handlePayment} 
            disabled={loading}
            className="flex items-center gap-2 bg-[#FF8C00] hover:bg-orange-600 disabled:bg-gray-400 text-white font-bold py-3 px-8 rounded-lg shadow-md transition-all active:scale-95"
          >
            {loading ? (
                <>Processing...</>
            ) : (
                <>Confirm and pay <ArrowRight className="w-4 h-4" /></>
            )}
          </button>
        </div>
      </div>

      <Footer />
    </div>
  );
}