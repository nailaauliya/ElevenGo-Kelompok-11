import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Receipt, User, Luggage, Armchair, ShieldCheck, CreditCard, 
  Check, ChevronDown, AlertCircle, Plane, X, ArrowRight, Wallet
} from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { useAuth } from '../contexts/AuthContext';
import api from '../lib/axios';

// Helper Format Rupiah
const formatIDR = (amount: number) => {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);
};

export default function BookingProcess() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, setUser } = useAuth(); 
  const [isLoading, setIsLoading] = useState(false);

  // 1. AMBIL DATA DARI STATE
  const bookingParams = location.state as { 
      flight: any; 
      passengerCounts: { adult: number; child: number; infant: number } | number; 
  } || null;

  // 2. SAFETY CHECK
  useEffect(() => {
      if (!bookingParams || !bookingParams.flight) {
          navigate('/');
      }
  }, [bookingParams, navigate]);

  if (!bookingParams || !bookingParams.flight) return null; 

  const { flight, passengerCounts } = bookingParams;

  // Normalisasi jumlah penumpang
  const counts = typeof passengerCounts === 'number' 
      ? { adult: passengerCounts, child: 0, infant: 0 } 
      : passengerCounts || { adult: 1, child: 0, infant: 0 };

  const passengerTypes = [
      ...Array(counts.adult).fill('Adult'),
      ...Array(counts.child).fill('Child'),
      ...Array(counts.infant).fill('Infant')
  ];
  
  const passengerCount = passengerTypes.length;

  // --- NORMALISASI DATA PENERBANGAN ---
  let flightSegments: any[] = [];
  if (flight?.isMultiCity && flight?.multiFlights) {
      flightSegments = flight.multiFlights;
  } else if (flight?.isRoundTrip && flight?.returnFlight) {
      flightSegments = [
          { 
            id: flight.id, 
            departureTime: flight.departure_time || flight.departureTime, 
            origin: flight.origin, 
            destination: flight.destination, 
            airline: flight.airline?.name || flight.airline, 
            price: flight.price 
          },
          { 
            id: flight.returnFlight.id, 
            departureTime: flight.returnFlight.departureTime, 
            origin: flight.returnFlight.origin, 
            destination: flight.returnFlight.destination, 
            airline: flight.returnFlight.airline?.name || flight.returnFlight.airline, 
            price: flight.returnFlight.price 
          }
      ];
  } else {
      flightSegments = [
          { 
            id: flight.id, 
            departureTime: flight.departure_time || flight.departureTime, 
            origin: flight.origin, 
            destination: flight.destination, 
            airline: flight.airline?.name || flight.airline, 
            price: flight.price 
          }
      ];
  }

  const [passengers, setPassengers] = useState(
    passengerTypes.map((type, index) => ({
      id: index,
      type: type,
      firstName: index === 0 ? (user?.full_name?.split(' ')[0] || '') : '', 
      lastName: index === 0 ? (user?.full_name?.split(' ').slice(1).join(' ') || '') : '',
      dob: '',
      title: (type === 'Child' || type === 'Infant') ? '' : '', 
      luggage: Array(flightSegments.length).fill(0), 
      seats: Array(flightSegments.length).fill(null) as (string | null)[], 
    }))
  );

  const [activeFlightIndex, setActiveFlightIndex] = useState(0); 
  const [activePassengerIndex, setActivePassengerIndex] = useState(0); 
  const [selectedCardId, setSelectedCardId] = useState<string>('wallet'); 
  const [showErrorPopup, setShowErrorPopup] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // --- CALCULATIONS ---
  const totalTicketPrice = flightSegments.reduce((acc, seg) => acc + Number(seg.price), 0) * passengerCount;
  const totalLuggageCost = passengers.reduce((total, p) => {
      return total + p.luggage.reduce((subTotal: number, lugPrice: number) => subTotal + lugPrice, 0);
  }, 0);
  const DISCOUNT = 0; 
  const grandTotal = totalTicketPrice + totalLuggageCost - DISCOUNT;
  
  const walletBalance = user?.wallet_balance || 0;
  const isWalletInsufficient = walletBalance < grandTotal;

  // --- HANDLERS ---
  const handlePassengerChange = (index: number, field: string, value: any) => {
    const updated = [...passengers];
    updated[index] = { ...updated[index], [field]: value };
    setPassengers(updated);
  };

  const handleLuggageChange = (pIndex: number, fIndex: number, cost: string) => {
    const updated = [...passengers];
    updated[pIndex].luggage[fIndex] = parseInt(cost);
    setPassengers(updated);
  };

  const handleSeatSelect = (seatId: string) => {
    const occupied = ['4C', '11A']; 
    const isTakenByOther = passengers.some((p, idx) => idx !== activePassengerIndex && p.seats[activeFlightIndex] === seatId);

    if (occupied.includes(seatId) || isTakenByOther) return;

    const updated = [...passengers];
    if (updated[activePassengerIndex].seats[activeFlightIndex] === seatId) {
      updated[activePassengerIndex].seats[activeFlightIndex] = null;
    } else {
      updated[activePassengerIndex].seats[activeFlightIndex] = seatId;
    }
    setPassengers(updated);
  };

  const handleProceedToPayment = async () => {
    // 1. Validasi Nama
    const isNamesComplete = passengers.every(p => p.firstName.trim() !== '' && p.lastName.trim() !== '');
    if (!isNamesComplete) {
        setErrorMessage("Please fill in the First Name and Last Name for all passengers.");
        setShowErrorPopup(true);
        return;
    }

    // 2. Validasi Kursi
    const allSeatsSelected = passengers.every(p => p.seats.every(s => s !== null));
    if (!allSeatsSelected) {
        setErrorMessage(`Please select seats for ALL flights and ALL passengers.`);
        setShowErrorPopup(true);
        return;
    }

    // 3. Validasi Saldo
    if (selectedCardId === 'wallet' && isWalletInsufficient) {
        setErrorMessage("Your wallet balance is insufficient.");
        setShowErrorPopup(true);
        return;
    }

    // --- PEMBUATAN PAYLOAD UNTUK PAYMENT ---
    const finalPayload = {
        contactDetails: { 
            title: passengers[0].title,
            firstName: passengers[0].firstName,
            lastName: passengers[0].lastName,
            email: user?.email, 
            phone: user?.phone
        },
        
        
        passengers: passengers, 

        passengerCount: passengerCount,
        flightDetails: {
            airline: flightSegments[0].airline, 
            segments: flightSegments 
        },
        
    
        seatsSelected: passengers.map(p => p.seats), 
        
        luggage: { totalCost: totalLuggageCost, label: totalLuggageCost > 0 ? 'Extra Baggage' : 'Standard 20kg' },
        paymentMethod: selectedCardId,
        pricing: {
            basePrice: totalTicketPrice,
            tax: 0, 
            discount: DISCOUNT,
            total: grandTotal
        }
    };

    setIsLoading(true);

    try {
        if (selectedCardId === 'wallet') {
            const newBalance = (user?.wallet_balance || 0) - grandTotal;
            if (setUser) {
                setUser({
                    ...user,
                    wallet_balance: newBalance
                });
            }
            await new Promise(resolve => setTimeout(resolve, 500));
        }
        navigate('/payment', { state: finalPayload });
    } catch (error) {
        console.error("Payment preparation failed", error);
        setErrorMessage("Something went wrong. Please try again.");
        setShowErrorPopup(true);
    } finally {
        setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F4F7FE] font-sans flex flex-col relative">
      <div className="bg-white sticky top-0 z-50 shadow-sm"><Header /></div>

      <main className="flex-grow max-w-7xl mx-auto w-full px-4 md:px-8 py-8 flex flex-col md:flex-row gap-6">
        
        {/* SIDEBAR KIRI (RECEIPT) */}
        <aside className="w-full md:w-1/4 h-fit hidden md:block">
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm sticky top-24">
            <div className="flex items-center gap-2 mb-4">
              <Receipt className="w-5 h-5 text-gray-500" />
              <h2 className="font-bold text-gray-800">Receipt</h2>
            </div>
            <div className="space-y-3 mb-6">
              <h3 className="font-bold text-xs text-gray-800 uppercase border-b pb-2">Flight tickets</h3>
              <div className="flex justify-between text-xs text-gray-500">
                <span>{passengerCount}x Tickets ({flightSegments.length} Flights)</span>
                <span>{formatIDR(totalTicketPrice)}</span>
              </div>
              <div className="flex justify-between text-xs text-green-600">
                <span>Voucher discount</span>
                <span>-{formatIDR(DISCOUNT)}</span>
              </div>
              {totalLuggageCost > 0 && (
                <div className="flex justify-between text-xs text-gray-500 border-t pt-2">
                  <span>Total Luggage</span>
                  <span>+{formatIDR(totalLuggageCost)}</span>
                </div>
              )}
            </div>
            <div className="border-t border-gray-100 pt-4 flex justify-between items-center">
              <span className="text-sm font-bold text-gray-700">Total</span>
              <span className="text-lg font-bold text-orange-600">{formatIDR(grandTotal)}</span>
            </div>
          </div>
        </aside>

        <div className="w-full md:w-3/4 space-y-4">
          {/* 1. SELECTED FLIGHTS INFO */}
          <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm hover:bg-gray-50 transition-colors">
              <div className="flex items-start gap-3">
                <Plane className="w-5 h-5 text-gray-500 mt-1" />
                <div className="flex-1">
                   <div className="flex justify-between items-center mb-2">
                       <h3 className="font-bold text-sm text-gray-800">Selected Flights ({flightSegments.length})</h3>
                       <ChevronDown className="w-5 h-5 text-gray-400" />
                   </div>
                   <div className="space-y-3">
                       {flightSegments.map((seg, idx) => (
                           <div key={idx} className="flex flex-col border-l-2 border-blue-200 pl-3 py-1">
                                <p className="text-[10px] font-bold text-blue-600 uppercase mb-0.5">
                                    {flight.isRoundTrip ? (idx === 0 ? "Outbound" : "Return") : `Flight ${idx + 1}`}
                                </p>
                                <p className="text-xs text-gray-700 font-semibold">
                                    {seg.origin} <ArrowRight className="w-3 h-3 inline text-gray-400 mx-1"/> {seg.destination}
                                </p>
                                <p className="text-[10px] text-gray-500">
                                    {new Date(seg.departureTime || seg.departure_time).toLocaleDateString()} • {seg.airline}
                                </p>
                           </div>
                       ))}
                   </div>
                </div>
             </div>
          </div>

          {/* 2. PASSENGER DETAILS FORM */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
             <div className="p-4 border-b border-gray-100 flex items-center gap-3 bg-gray-50/50">
                <User className="w-5 h-5 text-gray-600" />
                <div><h3 className="font-bold text-sm text-gray-800">Passenger Details</h3><p className="text-[10px] text-gray-500">Fill for {passengerCount} pax</p></div>
             </div>
             <div className="p-6 space-y-8">
               {passengers.map((p, index) => (
                 <div key={index} className="border-b border-gray-100 pb-6 last:border-0 last:pb-0">
                    <h4 className="text-sm font-bold text-gray-700 mb-4 flex items-center gap-2">
                      <span className="bg-blue-100 text-blue-800 text-[10px] px-2 py-0.5 rounded">Passenger {index + 1}</span>
                      <span className="bg-gray-100 text-gray-600 text-[10px] px-2 py-0.5 rounded ml-2">{p.type}</span>
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                       <div>
                          <label className="block text-xs text-gray-500 mb-1">First name</label>
                          <input type="text" value={p.firstName} onChange={(e) => handlePassengerChange(index, 'firstName', e.target.value)} className="w-full border border-gray-200 rounded p-2 text-sm focus:border-blue-500 outline-none" placeholder="e.g Lee" />
                       </div>
                       <div>
                          <label className="block text-xs text-gray-500 mb-1">Last name</label>
                          <input type="text" value={p.lastName} onChange={(e) => handlePassengerChange(index, 'lastName', e.target.value)} className="w-full border border-gray-200 rounded p-2 text-sm focus:border-blue-500 outline-none" placeholder="e.g Jeno" />
                       </div>
                    </div>
                 </div>
               ))}
             </div>
          </div>

          {/* 3. LUGGAGE */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
             <div className="p-4 border-b border-gray-100 flex items-center gap-3 bg-gray-50/50">
                <Luggage className="w-5 h-5 text-gray-600" />
                <div><h3 className="font-bold text-sm text-gray-800">Luggage</h3></div>
             </div>
             <div className="p-6 space-y-6">
                {passengers.map((p, pIndex) => (
                  <div key={pIndex} className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-xs font-bold text-gray-700 mb-3">Passenger {pIndex + 1}: {p.firstName || `(Enter Name)`} {p.lastName} <span className="text-gray-400 font-normal">({p.type})</span></p>
                    <div className={`grid gap-4 ${flightSegments.length > 2 ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1 md:grid-cols-2'}`}>
                      {flightSegments.map((seg, fIndex) => (
                          <div key={fIndex}>
                            <p className="text-[10px] text-gray-500 mb-1 font-semibold truncate">
                                {flight.isRoundTrip ? (fIndex === 0 ? "Outbound" : "Return") : `Flight ${fIndex + 1}`} 
                                <span className="font-normal text-gray-400 ml-1">({seg.origin}-{seg.destination})</span>
                            </p>
                            <select className="w-full border border-gray-200 rounded p-2 text-xs" value={p.luggage[fIndex]} onChange={(e) => handleLuggageChange(pIndex, fIndex, e.target.value)}>
                              <option value="0">0kg (Free)</option>
                              <option value="200000">20kg (+ IDR 200.000)</option>
                              <option value="350000">30kg (+ IDR 350.000)</option>
                            </select>
                          </div>
                      ))}
                    </div>
                  </div>
                ))}
             </div>
          </div>

          {/* 4. SEAT SELECTION */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
             <div className="p-4 border-b border-gray-100 flex items-center gap-3 bg-gray-50/50">
                <Armchair className="w-5 h-5 text-gray-600" />
                <div><h3 className="font-bold text-sm text-gray-800">Select seats</h3></div>
             </div>

             <div className="p-6">
                <div className="flex gap-4 mb-6 overflow-x-auto pb-2">
                   {flightSegments.map((seg, idx) => (
                       <button 
                         key={idx}
                         onClick={() => setActiveFlightIndex(idx)}
                         className={`flex-1 min-w-[120px] border py-2 rounded text-xs font-bold flex items-center justify-center gap-2 transition-all
                           ${activeFlightIndex === idx ? 'bg-green-50 border-green-500 text-green-700 shadow-sm' : 'bg-white text-gray-500 hover:bg-gray-50'}`}
                       >
                          <Plane className={`w-4 h-4 ${idx % 2 !== 0 ? 'rotate-180' : ''}`} /> 
                          <span>{flight.isRoundTrip ? (idx === 0 ? "Outbound" : "Return") : `Flight ${idx + 1}`}</span>
                       </button>
                   ))}
                </div>

                <div className="flex flex-col md:flex-row gap-8">
                   <div className="w-full md:w-1/3 space-y-3">
                      <p className="text-xs font-bold text-gray-700">Select Seat for:</p>
                      {passengers.map((p, idx) => {
                        const currentSeat = p.seats[activeFlightIndex];
                        return (
                          <div 
                            key={idx}
                            onClick={() => setActivePassengerIndex(idx)}
                            className={`p-3 rounded-lg border cursor-pointer transition-all flex justify-between items-center ${activePassengerIndex === idx ? 'bg-blue-600 text-white border-blue-600 shadow-md' : 'bg-white border-gray-200 hover:bg-gray-50'}`}
                          >
                            <div className="text-xs">
                              <p className="font-bold">{p.firstName || `Passenger ${idx+1}`}</p>
                              <p className={`text-[10px] ${activePassengerIndex === idx ? 'text-blue-100' : 'text-gray-500'}`}>{currentSeat ? `Seat: ${currentSeat}` : 'No seat selected'}</p>
                            </div>
                            {currentSeat && <Check className="w-4 h-4" />}
                          </div>
                        )
                      })}
                      <div className="mt-6 space-y-2 border-t pt-4">
                          <div className="flex items-center gap-2"><div className="w-4 h-4 bg-blue-900 rounded"></div><span className="text-xs text-gray-500">Available</span></div>
                          <div className="flex items-center gap-2"><div className="w-4 h-4 bg-orange-500 rounded"></div><span className="text-xs text-gray-500">Selected</span></div>
                          <div className="flex items-center gap-2"><div className="w-4 h-4 bg-blue-400 rounded"></div><span className="text-xs text-gray-500">Taken</span></div>
                      </div>
                   </div>

                   <div className="w-full md:w-2/3 overflow-hidden flex justify-center bg-gray-50 rounded-lg border border-gray-200 py-4">
                      <div className="relative w-[600px] h-[550px] shrink-0 bg-white shadow-sm rounded-xl overflow-hidden border border-gray-100">
                          <img 
                            src="/images/plane8.png" 
                            alt="plane" 
                            draggable={false}
                            className="w-[300px] absolute top-1 left-[119px] z-0 select-none pointer-events-none opacity-90" 
                          />
                          {[
                              { id: "2A", top: 135, left: 225 }, { id: "2D", top: 135, left: 288 }, { id: "2F", top: 135, left: 323 },
                              { id: "3A", top: 168, left: 225 }, { id: "3D", top: 168, left: 288 }, { id: "3F", top: 168, left: 323 },
                              { id: "4A", top: 201, left: 225 }, { id: "4D", top: 201, left: 288 }, { id: "4F", top: 201, left: 323 },
                              { id: "5A", top: 234, left: 225 }, { id: "5D", top: 234, left: 288 }, { id: "5F", top: 234, left: 323 },
                              { id: "6A", top: 267, left: 225 }, { id: "6D", top: 267, left: 288 }, { id: "6F", top: 267, left: 323 },
                              { id: "7A", top: 300, left: 225 }, { id: "7D", top: 300, left: 288 }, { id: "7F", top: 300, left: 323 },
                              { id: "8A", top: 333, left: 225 }, { id: "8D", top: 333, left: 288 }, { id: "8F", top: 333, left: 323 },
                              { id: "9A", top: 365, left: 225 }, { id: "9D", top: 365, left: 288 }, { id: "9F", top: 365, left: 323 },
                              { id: "10A", top: 397, left: 225 }, { id: "10D", top: 397, left: 288 }, { id: "10F", top: 397, left: 323 },
                              { id: "11A", top: 430, left: 225 }, { id: "11D", top: 430, left: 288 }, { id: "11F", top: 430, left: 323 },
                              { id: "12A", top: 465, left: 225 }, { id: "12C", top: 465, left: 288 }, { id: "12D", top: 465, left: 323 }, { id: "12F", top: 465, left: 257 },
                          ].map((seat) => {
                              const isSelectedByCurrent = passengers[activePassengerIndex].seats[activeFlightIndex] === seat.id;
                              const isTakenByOther = passengers.some((p, idx) => idx !== activePassengerIndex && p.seats[activeFlightIndex] === seat.id);
                              const occupied = ['4C', '11A']; 
                              const isReallyOccupied = occupied.includes(seat.id);
                              
                              const scaleClass = isSelectedByCurrent ? "scale-105" : "scale-100";
                              let bgClass = "bg-blue-900 hover:bg-blue-800"; 
                              if (isSelectedByCurrent) bgClass = "bg-orange-500 border-orange-600 shadow-lg z-20";
                              if (isTakenByOther || isReallyOccupied) bgClass = "bg-blue-400 cursor-not-allowed";

                              return (
                                  <div
                                  key={seat.id}
                                  className={`absolute z-10 w-8 h-8 rounded-md border border-gray-300 flex items-center justify-center text-xs font-bold text-white ${bgClass} ${scaleClass} cursor-pointer transition-transform`}
                                  style={{ top: seat.top, left: seat.left }}
                                  onClick={() => handleSeatSelect(seat.id)}
                                  >
                                  {seat.id}
                                  </div>
                              );
                          })}
                      </div>
                   </div>
                </div>
             </div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex justify-between items-center cursor-pointer hover:bg-gray-50">
             <div className="flex items-center gap-3">
                <ShieldCheck className="w-5 h-5 text-gray-600" />
                <div><h3 className="font-bold text-sm text-gray-800">Insurance</h3><p className="text-xs text-gray-500">Flexible Ticket included</p></div>
             </div>
             <Check className="w-5 h-5 text-green-500" />
          </div>
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
             <div className="p-4 border-b border-gray-100 flex items-center gap-3 bg-gray-50/50">
                <CreditCard className="w-5 h-5 text-gray-600" />
                <div><h3 className="font-bold text-sm text-gray-800">Payment method</h3></div>
             </div>
             <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                
                <label 
                    onClick={() => !isWalletInsufficient && setSelectedCardId('wallet')} 
                    className={`border rounded-lg p-4 flex items-center gap-4 transition-all relative
                        ${isWalletInsufficient 
                            ? 'opacity-50 bg-gray-100 cursor-not-allowed border-gray-200' 
                            : (selectedCardId === 'wallet' ? 'border-blue-500 bg-blue-50 cursor-pointer' : 'border-gray-200 cursor-pointer hover:bg-gray-50')
                        }
                    `}
                >
                    <input 
                        type="radio" 
                        checked={selectedCardId === 'wallet'} 
                        disabled={isWalletInsufficient}
                        readOnly 
                        className="text-blue-600 disabled:text-gray-400" 
                    />
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isWalletInsufficient ? 'bg-gray-200 text-gray-500' : 'bg-blue-100 text-blue-600'}`}>
                        <Wallet size={20} />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-gray-700">ElevenPay (Wallet)</p>
                      <p className={`text-[10px] font-bold ${isWalletInsufficient ? 'text-red-500' : 'text-blue-600'}`}>
                        Balance: {formatIDR(walletBalance)}
                        {isWalletInsufficient && " (Insufficient)"}
                      </p>
                    </div>
                </label>

                {/* BCA CARD */}
                <label onClick={() => setSelectedCardId('bca')} className={`border rounded-lg p-4 flex items-center gap-4 cursor-pointer transition-all ${selectedCardId === 'bca' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:bg-gray-50'}`}>
                    <input type="radio" checked={selectedCardId === 'bca'} readOnly className="text-blue-600" />
                    <div className="bg-blue-700 text-white px-2 py-0.5 rounded text-[10px] font-bold">BCA</div>
                    <div>
                      <p className="text-xs font-bold text-gray-700">BCA •••• 8888</p>
                      <p className="text-[9px] text-gray-400 font-medium">Exp: 12/28</p>
                    </div>
                </label>

                {/* BRI CARD */}
                <label onClick={() => setSelectedCardId('bri')} className={`border rounded-lg p-4 flex items-center gap-4 cursor-pointer transition-all ${selectedCardId === 'bri' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:bg-gray-50'}`}>
                    <input type="radio" checked={selectedCardId === 'bri'} readOnly className="text-blue-600" />
                    <div className="bg-blue-500 text-white px-2 py-0.5 rounded text-[10px] font-bold">BRI</div>
                    <div>
                      <p className="text-xs font-bold text-gray-700">BRI •••• 5678</p>
                      <p className="text-[9px] text-gray-400 font-medium">Exp: 09/26</p>
                    </div>
                </label>

             </div>
          </div>

          <div className="flex justify-end pb-12">
            <button 
                disabled={isLoading || (selectedCardId === 'wallet' && isWalletInsufficient)}
                className={`
                    bg-[#FF8C00] hover:bg-orange-600 text-white font-bold py-3 px-8 rounded shadow-md text-sm transition-all
                    ${isLoading ? 'opacity-70 cursor-wait' : 'active:scale-95'}
                    ${(selectedCardId === 'wallet' && isWalletInsufficient) ? 'opacity-50 cursor-not-allowed hover:bg-[#FF8C00]' : ''}
                `} 
                onClick={handleProceedToPayment}
            >
                {isLoading ? 'Processing...' : `Pay ${formatIDR(grandTotal)} \u2192`}
            </button>
          </div>
        </div>
      </main>

      {showErrorPopup && (
         <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-sm w-full relative">
               <button onClick={() => setShowErrorPopup(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
               <div className="flex flex-col items-center text-center">
                  <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4"><AlertCircle className="w-6 h-6 text-red-600" /></div>
                  <h3 className="text-lg font-bold text-gray-800 mb-2">Incomplete Details</h3>
                  <p className="text-sm text-gray-600 mb-6 px-2">{errorMessage}</p>
                  <button onClick={() => setShowErrorPopup(false)} className="bg-gray-900 hover:bg-gray-800 text-white font-bold py-2.5 px-6 rounded-lg w-full transition-colors">Okay, I'll fix it</button>
               </div>
            </div>
         </div>
      )}
      <Footer />
    </div>
  );
}