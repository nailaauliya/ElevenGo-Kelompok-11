import { useState, useEffect, useRef } from 'react';
import BookingProcess from '../pages/BookingProcess';
import { SearchResults } from '../components/SearchResults'; 
import type { Flight } from '../lib/database.types';
import api from '../lib/axios'; // AXIOS LARAVEL
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from "react-router-dom";
import { AlertTriangle, Plane, Calendar as CalendarIcon, ChevronDown, Plus, X, ArrowRight, ArrowLeftRight, GitMerge, ChevronLeft, ChevronRight } from 'lucide-react'; 
import Header from '../components/Header';
import Footer from '../components/Footer';
import { MapContainer, TileLayer } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';


const CalendarModal = ({ isOpen, onClose, onSelect, selectedDate }: any) => {

  const parseDate = (d: any) => {
    if (!d) return new Date();
    const date = new Date(d);
    return isNaN(date.getTime()) ? new Date() : date;
  };

  const [currentDate, setCurrentDate] = useState(parseDate(selectedDate));

  useEffect(() => {
    setCurrentDate(parseDate(selectedDate));
  }, [selectedDate]);

  // ⬇️ BARU BOLEH RETURN KONDISIONAL
  if (!isOpen) return null;

  const daysID = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];
  const monthsID = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const days = new Date(year, month + 1, 0).getDate();
    const firstDay = new Date(year, month, 1).getDay();
    return { days, firstDay, year, month };
  };

  const { days, firstDay, year, month } = getDaysInMonth(currentDate);

  const handleDateClick = (day: number) => {
    const d = new Date(year, month, day);
    const offset = d.getTimezoneOffset();
    const date = new Date(d.getTime() - offset * 60000);
    onSelect(date.toISOString().split('T')[0]);
    onClose();
  };

  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));
  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));

  return (
    <div className="absolute top-full left-0 mt-2 z-[9999] w-72 bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden animate-fade-in-down" onClick={(e)=>e.stopPropagation()}>
      <div className="px-4 py-3 border-b border-gray-50 flex justify-between items-center bg-white"><h3 className="text-sm font-semibold text-gray-700">Atur Tanggal</h3><button type="button" onClick={onClose}><X className="w-4 h-4 text-gray-400 hover:text-gray-600" /></button></div>
      <div className="px-4 py-2 flex justify-between items-center"><h4 className="text-sm font-semibold text-gray-800">{monthsID[month]} {year}</h4><div className="flex gap-1"><button type="button" onClick={prevMonth} className="p-1 hover:bg-gray-100 rounded-full"><ChevronLeft className="w-4 h-4 text-gray-500" /></button><button type="button" onClick={nextMonth} className="p-1 hover:bg-gray-100 rounded-full"><ChevronRight className="w-4 h-4 text-gray-500" /></button></div></div>
      <div className="grid grid-cols-7 px-3 mb-1">{daysID.map((day,i)=><div key={day} className={`text-center text-[10px] py-1 ${i===0?'text-red-500':'text-gray-400'}`}>{day}</div>)}</div>
      <div className="grid grid-cols-7 px-3 pb-3 gap-y-1 gap-x-1">
        {Array.from({length:firstDay}).map((_,i)=><div key={`e-${i}`}/>)}{Array.from({length:days}).map((_,i)=><div key={i} className="flex justify-center"><button type="button" onClick={()=>handleDateClick(i+1)} className="w-7 h-7 rounded-full flex items-center justify-center text-xs hover:bg-blue-50 text-gray-700">{i+1}</button></div>)}
      </div>
    </div>
  );
};

// --- COMPONENT: PASSENGER DROPDOWN ---
const PassengerDropdownContent = ({ passengers, onUpdate, onClose }: any) => (
    <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-xl z-[60] p-4 min-w-[250px]" onClick={(e)=>e.stopPropagation()}>
        {[{ label: 'Adults', type: 'adults' }, { label: 'Children', type: 'children' }, { label: 'Infants', type: 'infants' }].map((item) => (
        <div key={item.label} className="flex justify-between items-center py-2 mb-1 border-b border-gray-50 last:border-0">
            <span className="text-sm font-semibold text-gray-700">{item.label}</span>
            <div className="flex items-center gap-3"><button type="button" onClick={() => onUpdate(item.type, 'dec')} className="w-7 h-7 border rounded hover:bg-gray-100 flex items-center justify-center text-gray-500">-</button><span className="text-sm font-semibold w-4 text-center text-gray-700">{passengers ? passengers[item.type] : 0}</span><button type="button" onClick={() => onUpdate(item.type, 'inc')} className="w-7 h-7 border rounded hover:bg-gray-100 flex items-center justify-center text-gray-500">+</button></div>
        </div>
        ))}
        <button type="button" onClick={onClose} className="w-full mt-2 bg-blue-600 text-white text-xs font-semibold py-2.5 rounded-lg hover:bg-blue-700">Done</button>
    </div>
);

const SearchFormGuest = (props: any) => {
    const { activeSearchTab, setActiveSearchTab, tripType, setTripType, searchFlights, handleFlightChange, openCalendar, calendarRef, formatDateDisplay, isCalendarOpen, setIsCalendarOpen, onDateSelect, passengerRef, setIsPassengerOpen, isPassengerOpen, passengerLabel, handleSearch, returnDate, handlePassengerCount, passengers, addFlightRow, removeFlightRow, activeDateIndex } = props;

    return (
    <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-4xl mx-auto border border-gray-100 relative">
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
                        <input type="radio" name="tripType" checked={tripType === type} onChange={() => { setTripType(type as any); }} className="hidden" />
                        <span className={`text-sm font-medium ${tripType === type ? 'text-gray-800' : 'text-gray-500'}`}>{type.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}</span>
                    </label>
                ))}
            </div>
            <div className="space-y-4">
                {tripType !== 'multi-city' ? (
                <>
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1"><label className="block text-xs font-bold text-gray-500 mb-1.5 ml-1">From</label><div className="flex items-center border border-gray-300 rounded-md px-3 py-2.5"><Plane className="w-5 h-5 text-gray-400 mr-3" /><input type="text" placeholder="Origin" value={searchFlights[0]?.origin || ''} onChange={(e) => handleFlightChange(0, 'origin', e.target.value)} className="bg-transparent outline-none text-gray-700 text-sm w-full font-medium placeholder-gray-300" /><ChevronRight className="w-4 h-4 text-gray-300 ml-auto" /></div></div>
                    <div className="flex-1"><label className="block text-xs font-bold text-gray-500 mb-1.5 ml-1">To</label><div className="flex items-center border border-gray-300 rounded-md px-3 py-2.5"><Plane className="w-5 h-5 text-gray-400 mr-3 transform rotate-45" /><input type="text" placeholder="Dest..." value={searchFlights[0]?.destination || ''} onChange={(e) => handleFlightChange(0, 'destination', e.target.value)} className="bg-transparent outline-none text-gray-700 text-sm w-full font-medium placeholder-gray-300" /><ChevronRight className="w-4 h-4 text-gray-300 ml-auto" /></div></div>
                </div>
                <div className="flex flex-col md:flex-row gap-4 items-end">
                    <div className="w-full md:w-1/4 relative" ref={calendarRef}>
                        <label className="block text-xs font-bold text-gray-500 mb-1.5 ml-1">Departure date</label>
                        <div className="flex items-center border border-gray-300 rounded-md px-3 py-2.5 cursor-pointer" onClick={() => openCalendar(0)}>
                            <input type="text" readOnly placeholder="dd/mm/yy" value={formatDateDisplay(searchFlights[0]?.departureDate)} className="bg-transparent outline-none text-gray-700 text-sm w-full font-medium placeholder-gray-300 cursor-pointer" /><CalendarIcon className="w-4 h-4 text-gray-400 ml-auto" />
                        </div>
                        <CalendarModal isOpen={!!(isCalendarOpen && activeDateIndex === 0)} onClose={() => setIsCalendarOpen(false)} onSelect={onDateSelect} selectedDate={searchFlights[0]?.departureDate} />
                    </div>

                    {tripType === 'round-trip' && (
                    <div className="w-full md:w-1/4 relative" ref={calendarRef}>
                        <label className="block text-xs font-bold text-gray-500 mb-1.5 ml-1">Return date</label>
                        <div className="flex items-center border border-gray-300 rounded-md px-3 py-2.5 cursor-pointer" onClick={() => openCalendar(-1)}>
                            <input type="text" readOnly placeholder="dd/mm/yy" value={formatDateDisplay(returnDate)} className="bg-transparent outline-none text-gray-700 text-sm w-full font-medium placeholder-gray-300 cursor-pointer" /><CalendarIcon className="w-4 h-4 text-gray-400 ml-auto" />
                        </div>
                        <CalendarModal isOpen={!!(isCalendarOpen && activeDateIndex === -1)} onClose={() => setIsCalendarOpen(false)} onSelect={onDateSelect} selectedDate={returnDate} />
                    </div>
                    )}

                    <div className="w-full md:w-1/4 relative" ref={passengerRef}>
                        <label className="block text-xs font-bold text-gray-500 mb-1.5 ml-1">Passengers</label>
                        <button onClick={() => setIsPassengerOpen(!isPassengerOpen)} className="w-full bg-white border border-gray-300 rounded-md px-3 py-2.5 flex items-center justify-between outline-none"><span className="text-gray-700 text-sm font-medium">{passengerLabel}</span><ChevronRight className="w-4 h-4 text-gray-300" /></button>
                        {isPassengerOpen && <PassengerDropdownContent passengers={passengers} onUpdate={handlePassengerCount} onClose={() => setIsPassengerOpen(false)} />}
                    </div>
                    <div className="w-full md:flex-1 flex justify-end">
                        <button onClick={handleSearch} className="px-8 py-2.5 bg-[#FFAD60] hover:bg-orange-500 text-white font-bold rounded shadow-sm transition-colors text-base w-full md:w-auto">Book now!</button>
                    </div>
                </div>
                </>
                ) : (
                 
                    <div className="space-y-4">
                        {searchFlights.map((flight: any, index: any) => (
                        <div key={index} className="flex flex-col md:flex-row gap-4 items-end">
                            <div className="flex-1"><label className="block text-xs font-bold text-gray-500 mb-1.5 ml-1">From</label><div className="flex items-center border border-gray-300 rounded-md px-3 py-2.5"><input type="text" placeholder="Origin" value={flight.origin} onChange={(e) => handleFlightChange(index, 'origin', e.target.value)} className="bg-transparent outline-none text-gray-700 text-sm w-full font-medium placeholder-gray-300" /></div></div>
                            <div className="flex-1"><label className="block text-xs font-bold text-gray-500 mb-1.5 ml-1">To</label><div className="flex items-center border border-gray-300 rounded-md px-3 py-2.5"><input type="text" placeholder="Dest..." value={flight.destination} onChange={(e) => handleFlightChange(index, 'destination', e.target.value)} className="bg-transparent outline-none text-gray-700 text-sm w-full font-medium placeholder-gray-300" /></div></div>
                            <div className="w-full md:w-1/4 relative"><label className="block text-xs font-bold text-gray-500 mb-1.5 ml-1">Date</label><div className="flex items-center border border-gray-300 rounded-md px-3 py-2.5 cursor-pointer" onClick={() => openCalendar(index)}><input type="text" readOnly placeholder="dd/mm/yy" value={formatDateDisplay(flight.departureDate)} className="bg-transparent outline-none text-gray-700 text-sm w-full font-medium cursor-pointer" /><CalendarIcon className="w-5 h-5 text-gray-300 ml-auto" /></div><CalendarModal isOpen={!!(isCalendarOpen && activeDateIndex === index)} onClose={() => setIsCalendarOpen(false)} onSelect={onDateSelect} selectedDate={flight.departureDate}/></div>
                            {searchFlights.length > 1 && <button onClick={() => removeFlightRow(index)} className="p-2.5 text-gray-400 hover:bg-gray-100 rounded"><X className="w-5 h-5" /></button>}
                        </div>
                        ))}
                        <div className="flex justify-between items-center pt-2"><button onClick={addFlightRow} className="text-sm font-medium text-orange-400 hover:text-orange-500 flex items-center gap-1">+ Add flight</button><div className="flex gap-4 items-center"><button onClick={handleSearch} className="px-8 py-2.5 bg-[#FFAD60] hover:bg-orange-500 text-white font-bold rounded shadow-sm text-sm">Book now!</button></div></div>
                    </div>
                )}
            </div>
        </>
        )}
    </div>
    );
};

// --- COMPONENT: FORM USER (BIRU, MODERN) ---
const SearchFormUser = (props: any) => {
    const { 
        tripType, setTripType, searchFlights, handleFlightChange, 
        openCalendar, calendarRef, formatDateDisplay, isCalendarOpen, 
        setIsCalendarOpen, onDateSelect, passengerRef, setIsPassengerOpen, 
        isPassengerOpen, passengerLabel, handleSearch, returnDate,
        passengers, handlePassengerCount, activeDateIndex, addFlightRow, removeFlightRow 
    } = props;

    return (
    <div className="bg-white rounded-xl shadow-xl overflow-visible border border-gray-100 relative">
      <div className="flex bg-white border-b border-gray-200 rounded-t-xl">
        <button onClick={() => setTripType('one-way')} className={`flex-1 py-4 text-sm font-semibold flex items-center justify-center gap-2 transition-all rounded-tl-xl ${tripType === 'one-way' ? 'bg-blue-600 text-white' : 'text-gray-500 hover:bg-gray-50'}`}> <ArrowRight className="w-4 h-4" /> One Way </button>
        <button onClick={() => setTripType('round-trip')} className={`flex-1 py-4 text-sm font-semibold flex items-center justify-center gap-2 transition-all rounded-none ${tripType === 'round-trip' ? 'bg-blue-600 text-white' : 'text-gray-500 hover:bg-gray-50'}`}> <ArrowLeftRight className="w-4 h-4" /> Round Trip </button>
        <button onClick={() => setTripType('multi-city')} className={`flex-1 py-4 text-sm font-semibold flex items-center justify-center gap-2 transition-all rounded-tr-xl ${tripType === 'multi-city' ? 'bg-blue-600 text-white' : 'text-gray-500 hover:bg-gray-50'}`}> <GitMerge className="w-4 h-4" /> Multi City </button>
      </div>

        <div className="p-8">
            {tripType !== 'multi-city' ? (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-6 items-end">
                    <div className="relative group bg-white border border-gray-300 rounded-xl px-5 py-3 flex flex-col justify-center h-[64px] focus-within:ring-2 focus-within:ring-blue-500">
                        <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-0.5">From</label>
                        <div className="flex items-center gap-3"><Plane className="w-5 h-5 text-gray-400" /><input type="text" placeholder="Origin" value={searchFlights[0]?.origin || ''} onChange={(e) => handleFlightChange(0, 'origin', e.target.value)} className="bg-transparent outline-none text-gray-900 font-bold text-base w-full placeholder-gray-300" /></div>
                    </div>
                    <div className="relative group bg-white border border-gray-300 rounded-xl px-5 py-3 flex flex-col justify-center h-[64px] focus-within:ring-2 focus-within:ring-blue-500">
                        <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-0.5">To</label>
                        <div className="flex items-center gap-3"><Plane className="w-5 h-5 text-gray-400 transform rotate-90" /><input type="text" placeholder="Dest..." value={searchFlights[0]?.destination || ''} onChange={(e) => handleFlightChange(0, 'destination', e.target.value)} className="bg-transparent outline-none text-gray-900 font-bold text-base w-full placeholder-gray-300" /></div>
                    </div>
                    
                    <div className="md:col-span-1 h-full relative" ref={calendarRef}>
                        {tripType === 'round-trip' ? (
                            <div className="flex gap-1 h-full">
                                <div className="flex-1 relative group bg-white border border-gray-300 rounded-xl px-3 py-3 flex flex-col justify-center cursor-pointer hover:border-gray-400 h-[64px]" onClick={() => openCalendar(0)}>
                                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-0.5">Depart</label>
                                    <span className={`text-sm truncate ${searchFlights[0]?.departureDate ? 'text-gray-900 font-bold' : 'text-gray-300 font-medium'}`}>
                                        {formatDateDisplay(searchFlights[0]?.departureDate) || 'DD/MM/YYYY'}
                                    </span>
                                </div>
                                <div className="flex-1 relative group bg-white border border-gray-300 rounded-xl px-3 py-3 flex flex-col justify-center cursor-pointer hover:border-gray-400 h-[64px]" onClick={() => openCalendar(-1)}>
                                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-0.5">Return</label>
                                    <span className={`text-sm truncate ${returnDate ? 'text-gray-900 font-bold' : 'text-gray-300 font-medium'}`}>
                                        {formatDateDisplay(returnDate) || 'DD/MM/YYYY'}
                                    </span>
                                </div>
                            </div>
                        ) : (
                            <div className="relative group bg-white border border-gray-300 rounded-xl px-5 py-3 flex flex-col justify-center h-[64px] cursor-pointer hover:border-gray-400" onClick={() => openCalendar(0)}>
                                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-0.5">Date</label>
                                <div className="flex items-center justify-between">
                                    <span className={`text-base ${searchFlights[0]?.departureDate ? 'text-gray-900 font-bold' : 'text-gray-300 font-medium'}`}>
                                        {formatDateDisplay(searchFlights[0]?.departureDate) || 'DD/MM/YY'}
                                    </span>
                                    <CalendarIcon className="w-5 h-5 text-gray-400" />
                                </div>
                            </div>
                        )}
                        <CalendarModal isOpen={!!(isCalendarOpen)} onClose={() => setIsCalendarOpen(false)} onSelect={onDateSelect} selectedDate={tripType === 'round-trip' && activeDateIndex === -1 ? returnDate : searchFlights[0]?.departureDate} />
                    </div>

                    <div className="relative group bg-white border border-gray-300 rounded-xl px-5 py-3 flex flex-col justify-center h-[64px] cursor-pointer hover:border-gray-400" onClick={() => setIsPassengerOpen(!isPassengerOpen)} ref={passengerRef}>
                        <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-0.5">Passengers</label>
                        <div className="flex items-center justify-between"><span className="text-gray-900 font-bold text-base">{passengerLabel}</span><ChevronDown className="w-5 h-5 text-gray-400" /></div>
                        {isPassengerOpen && <PassengerDropdownContent passengers={passengers} onUpdate={handlePassengerCount} onClose={() => setIsPassengerOpen(false)} />}
                    </div>
                </div>
            ) : (
                // MULTI CITY USER (Dynamic Rows)
                <div className="space-y-4 mb-6">
                    {searchFlights.map((flight: any, index: any) => (
                    <div key={index} className="flex flex-col md:flex-row gap-4 items-end animate-fade-in-down pb-2 border-b border-gray-100 last:border-0">
                        <div className="flex-1 relative group bg-white border border-gray-300 rounded-xl px-5 py-3 flex flex-col justify-center h-[64px] focus-within:ring-2 focus-within:ring-blue-500">
                            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-0.5">From</label>
                            <div className="flex items-center gap-3"><Plane className="w-5 h-5 text-gray-400" /><input type="text" placeholder="Origin" value={flight.origin} onChange={(e) => handleFlightChange(index, 'origin', e.target.value)} className="bg-transparent outline-none text-gray-900 font-bold text-base w-full placeholder-gray-300" /></div>
                        </div>
                        <div className="flex-1 relative group bg-white border border-gray-300 rounded-xl px-5 py-3 flex flex-col justify-center h-[64px] focus-within:ring-2 focus-within:ring-blue-500">
                            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-0.5">To</label>
                            <div className="flex items-center gap-3"><Plane className="w-5 h-5 text-gray-400 transform rotate-90" /><input type="text" placeholder="Dest..." value={flight.destination} onChange={(e) => handleFlightChange(index, 'destination', e.target.value)} className="bg-transparent outline-none text-gray-900 font-bold text-base w-full placeholder-gray-300" /></div>
                        </div>
                        <div className="w-full md:w-1/4 relative group bg-white border border-gray-300 rounded-xl px-5 py-3 flex flex-col justify-center h-[64px] cursor-pointer hover:border-gray-400" onClick={() => openCalendar(index)}>
                            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-0.5">Date</label>
                            <div className="flex items-center justify-between">
                                <span className={`text-base ${flight.departureDate ? 'text-gray-900 font-bold' : 'text-gray-300 font-medium'}`}>
                                    {formatDateDisplay(flight.departureDate) || 'DD/MM/YY'}
                                </span>
                                <CalendarIcon className="w-5 h-5 text-gray-400" />
                            </div>
                            <CalendarModal isOpen={!!(isCalendarOpen && activeDateIndex === index)} onClose={() => setIsCalendarOpen(false)} onSelect={onDateSelect} selectedDate={flight.departureDate}/>
                        </div>
                        {searchFlights.length > 1 && <button onClick={() => removeFlightRow(index)} className="p-4  text-gray-300 hover:text-gray-500 h-[64px] flex items-center justify-center"><X className="w-4 h-4" /></button>}
                    </div>
                    ))}
                    <div className="flex justify-between items-center pt-2">
                          <button onClick={addFlightRow} className="text-sm font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 px-2 py-1 rounded hover:bg-blue-50"><Plus className="w-4 h-4" /> Add flight</button>
                          <div className="relative w-48 group bg-white border border-gray-300 rounded-xl px-5 py-3 cursor-pointer h-[64px] flex flex-col justify-center" onClick={() => setIsPassengerOpen(!isPassengerOpen)} ref={passengerRef}>
                            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-0.5">Passengers</label>
                            <div className="flex items-center justify-between"><span className="text-gray-900 font-bold text-base">{passengerLabel}</span><ChevronDown className="w-5 h-5 text-gray-400" /></div>
                            {isPassengerOpen && <PassengerDropdownContent passengers={passengers} onUpdate={handlePassengerCount} onClose={() => setIsPassengerOpen(false)} />}
                        </div>
                    </div>
                </div>
            )}
            <div className="flex justify-center mt-8"><button onClick={handleSearch} className="px-16 py-4 bg-[#FCA556] hover:bg-orange-400 text-white font-bold rounded-xl shadow-md transition-colors text-lg">Book now!</button></div>
        </div>
    </div>
    );
};

// --- DATA DUMMY ---
const travelingFrom = [
    { name: 'Jakarta', date: 'Apr 5-8', price: 'IDR 6.870.000', img: '/images/jakarta.jpg' }, 
    { name: 'Surabaya', date: 'Oct 5-8', price: 'IDR 1.870.000', img: '/images/surabaya.jpg' },
    { name: 'Bandung', date: 'Apr 5-8', price: 'IDR 7.870.000', img: '/images/bandungg.jpg' },
    { name: 'Bali', date: 'Apr 5-8', price: 'IDR 5.870.000', img: '/images/balii.jpg' },
];
const discoverItems = [
     { title: 'Latest travel restrictions', desc: 'We provide information on the entry requirements.', img: '/images/latest.png' },
     { title: 'Install our mobile app', desc: 'Our mobile app provides real-time information.', img: '/images/discover2.jpg' },
     { title: 'The most beautiful destinations', desc: 'Have you ever considered visiting Easter Island?', img: '/images/discover3.jpg' }
    ];
const popularDestinations = [{ name: 'Jakarta', image: 'https://images.pexels.com/photos/2845013/pexels-photo-2845013.jpeg' }, { name: 'Bali', image: 'https://images.pexels.com/photos/2166559/pexels-photo-2166559.jpeg' }, { name: 'Surabaya', image: 'https://images.pexels.com/photos/1470405/pexels-photo-1470405.jpeg' }, { name: 'Bandung', image: 'https://images.pexels.com/photos/2372978/pexels-photo-2372978.jpeg' }];

// --- DATA: FLIGHTS SELECTED FOR YOU ---
const selectedFlights = [
  { name: 'London', date: 'Apr 5-8', duration: '3h 15 min', price: 'IDR 9.450.000', img: '/images/london2.jpg' },
  { name: 'Jepang', date: 'Oct 5-8', duration: '3h 15 min', price: 'IDR 9.450.000', img: '/images/japan.jpg' },
  { name: 'Korea Selatan', date: 'Oct 5-8', duration: '3h 15 min', price: 'IDR 9.450.000', img: '/images/korea.jpg' },
  { name: 'Paris', date: 'Oct 5-8', duration: '3h 15 min', price: 'IDR 9.450.000', img: '/images/paris.jpg' }
];

export const Home = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
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
      const response = await api.get('/flights');
      const result = response.data.data || response.data || [];
      
      setFlightsData(result);
      setFilteredFlights(result);
    } catch (e) { 
        console.log("Error loading flights:", e); 
    }
  };

  const handleFlightChange = (index: number, field: string, value: string) => {
    const newFlights = [...searchFlights]; 
    newFlights[index][field] = value; setSearchFlights(newFlights);
  };
  const addFlightRow = () => setSearchFlights([...searchFlights, { origin: '', destination: '', departureDate: '' }]);
  const removeFlightRow = (index: number) => { if (searchFlights.length > 1) setSearchFlights(searchFlights.filter((_, i) => i !== index)); };
  const handlePassengerCount = (type: any, op: any) => setPassengers(prev => ({...prev, [type]: op === 'inc' ? prev[type] + 1 : Math.max(0, prev[type] - 1)}));
  
  const openCalendar = (index: number) => { setIsPassengerOpen(false); setActiveDateIndex(index); setIsCalendarOpen(true); };
  const onDateSelect = (date: string) => { if (tripType === 'round-trip' && activeDateIndex === -1) setReturnDate(date); else handleFlightChange(activeDateIndex, 'departureDate', date); };
  
  // Di dalam Home.tsx

const handleSearch = async () => {
    setSearchPerformed(true);
    
    try {
        const currentSearch = searchFlights[0];
        const params: any = {};

        // LOGIKA FIX: Pastikan parameter dikirim jika ada isinya
        if (currentSearch.origin) {
            params.origin = currentSearch.origin;
        }
        if (currentSearch.destination) {
            params.destination = currentSearch.destination;
        }
        
        // FIX TANGGAL: Kirim tanggal jika user memilihnya
        if (currentSearch.departureDate) {
            params.date = currentSearch.departureDate;
        }

        // DEBUGGING: Cek di Console browser (F12) apa yang dikirim
        console.log("Mengirim params ke Backend:", params); 

        const response = await api.get('/flights', { params });
        
        // Ambil datanya dengan aman
        const result = response.data.data || response.data || [];
        
        console.log("Data diterima dari Backend:", result); // Cek hasil di console
        
        setFlightsData(result);

    } catch (error) {
        console.error("Search error:", error);
    }

    // Scroll ke hasil
    setTimeout(() => { resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }); }, 100);
};

  const handleBookingSuccess = () => loadFlightsData();
  
  // Updated onBookFlight handle single OR array
  const onBookFlight = (flightData: Flight | Flight[]) => {
    if (!user) {
       navigate('/login');
    } 
    else {
      const isMulti = Array.isArray(flightData);
      let flightPayload: any = {};

      if (isMulti) {
          const segments = (flightData as Flight[]).map(f => ({
              departureTime: f.departure_time,
              origin: f.origin,
              destination: f.destination,
              airline: f.airline,
              price: f.price
          }));

          flightPayload = {
              id: 'MULTI-ID', 
              airline: 'Multi Airlines',
              origin: segments[0].origin, 
              destination: segments[segments.length - 1].destination, 
              departureTime: segments[0].departureTime,
              price: 0,
              
              isRoundTrip: false,
              isMultiCity: true,
              multiFlights: segments
          };

      } else {
          const singleFlight = flightData as Flight;
          let returnFlightData = undefined;
          if (tripType === 'round-trip') {
              returnFlightData = {
                  departureTime: returnDate || 'Unknown Date', 
                  origin: singleFlight.destination, 
                  destination: singleFlight.origin,
                  airline: singleFlight.airline,
                  price: singleFlight.price 
              };
          }

          flightPayload = {
              ...singleFlight,
              departureTime: singleFlight.departure_time,
              isRoundTrip: tripType === 'round-trip',
              isMultiCity: false,
              returnFlight: returnFlightData
          };
      }

      navigate('/booking', {
        state: {
          flight: flightPayload,
          passengerCounts: {
        adult: passengers.adults,     
        child: passengers.children,   
        infant: passengers.infants    
    }
        }
      });
    }
  };

  const totalPassengers = passengers.adults + passengers.children + passengers.infants;
  const passengerLabel = `${totalPassengers} Passenger${totalPassengers > 1 ? 's' : ''}`;
  const formatDateDisplay = (dateString: string) => dateString ? new Date(dateString).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: '2-digit' }) : '';
  const userName = user?.user_metadata?.full_name || 'Traveler';

  // --- Props Packet ---
  const formProps = {
      activeSearchTab, setActiveSearchTab, tripType, setTripType, 
      searchFlights, handleFlightChange, openCalendar, calendarRef, 
      formatDateDisplay, isCalendarOpen, setIsCalendarOpen, onDateSelect, activeDateIndex,
      passengerRef, setIsPassengerOpen, isPassengerOpen, passengerLabel, 
      handleSearch, returnDate, handlePassengerCount, passengers, addFlightRow, removeFlightRow
  };

  const infoCards = [
  { title: "Security screening", subtitle: "What can I bring?", illustration: <div 
    className="w-24 h-112px flex items-center justify-center text-indigo-600 font-bold text-xs">
        <img
        src="/images/trashman.png"
        alt="security"
        className="w-50 h-50 object-contain"
        />
    </div> },
  { title: "Travel tips", subtitle: "Travelling with your pets", illustration: <div 
    className="w-24 h-112px flex items-center justify-center text-indigo-600 font-bold text-xs">
        <img
        src="/images/petanimal.png"
        alt="animalsecurity"
        className="w-50 h-50 object-contain"
        />
    </div> },
  { title: "Special procedures", subtitle: "Travelling with disabilities", illustration: <div 
    className="w-24 h-112px flex items-center justify-center text-indigo-600 font-bold text-xs">
        <img
        src="/images/olderman.png"
        alt="oldman"
        className="w-50 h-50 object-contain"
        />
    </div> },
  { title: "Our partners", subtitle: "Airports and Airlines", illustration: <div 
     className="w-24 h-128px flex items-center justify-center text-indigo-600 font-bold text-xs">
        <img
        src="/images/iluso ur.png"
        alt="security"
        className="w-50 h-50 object-contain"
        />
        </div> },
  { title: "Travel tips", subtitle: "Travel checklist", illustration: <div 
        className="w-25 h-112px flex items-center justify-center text-indigo-600 font-bold text-xs">
        <img
        src="/images/cart.png"
        alt="security"
        className="w-50 h-50 object-contain"
        />
        </div> }
];

  return (
<div className="min-h-screen bg-gray-50 font-Heading">
  <Header />
  <div className="relative h-[550px]">
    
    <div className="absolute inset-0 w-full h-full">
      <img
        src={user ? "/images/pesawat3.jpg" : "/images/Pesawat elevenGO.png"}
        alt="Hero Background"
        className={`w-full object-cover ${user ? 'h-full scale-x-[-1]' : 'h-[85%]'}`}
      />

      {/* Overlay */}
      <div className={`absolute inset-0 w-full
        ${user
          ? 'h-full bg-gradient-to-b from-black/60 via-black/40 to-gray-50/100' 
          : 'h-[85%] bg-black/50' 
        }`}
      />
    </div>

    {/* 2. Ubah pt-48 menjadi pt-32 agar teks lebih naik ke atas */}
    <div className="relative z-10 w-full max-w-7xl mx-auto px-6 md:px-12 flex justify-end pt-32">
      <div className="text-right text-white">
        {user ? (
          <h1 className="text-5xl font-heading font-light mb-2 tracking-wide">Welcome aboard, {userName}</h1>
        ) : (
          <>
            <h1 className="text-4xl font-light font-heading mb-4 tracking-wide leading-tight">One Click, One Journey<br/>Book Your Trip Easily, Anytime, Anywhere</h1>
          </>
        )}
      </div>
    </div>
  </div>



      <div className="relative z-50 -mt-44 max-w-6xl mx-auto px-6 mb-16">
          {user ? <SearchFormUser {...formProps} /> : <SearchFormGuest {...formProps} />}
      </div>

      <div ref={resultsRef} className="scroll-mt-24 relative z-0">
        {searchPerformed ? (
            <div className="max-w-7xl mx-auto px-6 pb-20 animate-fade-in-up">
                <SearchResults 
                    flights={flightsData} 
                    origin={searchFlights[0].origin} 
                    destination={searchFlights[0].destination} 
                    departureDate={searchFlights[0].departureDate} 
                    isMultiCity={tripType === 'multi-city'}
                    searchSegments={searchFlights}
                    onBack={() => setSearchPerformed(false)}
                    onBook={onBookFlight} 
                />
            </div>
        ) : (
    
            <>
                {!user && (
                    <div className="max-w-5xl mx-auto px-6 pb-20 space-y-10">
                        <div className="mt-4 max-w-4xl mx-auto bg-[#FFF8E7] border border-[#FDE68A] rounded-md p-4 flex items-start gap-3 shadow-sm mb-3">
                            <AlertTriangle className="w-5 h-5 text-yellow-500 mt-0.5" />
                            <p className="text-xs text-gray-600 leading-relaxed"><span className="font-bold text-gray-700">Travel Update:</span> Some travel routes may be affected by current weather conditions.</p>
                        </div>
                        {/* Guest Sections */}
                        <section>
                            <div className="flex justify-between items-end mb-6"><div><h2 className="text-2xl font-bold text-gray-900">Traveling from your location</h2><p className="text-sm text-gray-500">Round trip • 1 passenger</p></div><button className="text-blue-600 text-sm font-bold hover:underline">Explore more</button></div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-1">{travelingFrom.map((item, idx) => (<div key={idx} className="flex bg-blue-50 rounded-md shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition cursor-pointer h-40"><img src={item.img} alt={item.name} className="w-40 h-full object-cover" /><div className="p-6 flex flex-col justify-between flex-1"><div><h3 className="font-bold text-lg text-gray-800">{item.name}</h3><p className="text-xs text-gray-500">{item.date} • Direct flight • 2h 15m</p></div><p className="text-right font-bold text-gray-900">{item.price}</p></div></div>))}</div>
                        </section>
                        <section>
                            <h2 className="text-2xl font-bold text-gray-900 mb-2 mt">Discover</h2>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">{discoverItems.map((item, idx) => (<div key={idx} className="bg-white rounded-md shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition cursor-pointer"><img src={item.img} alt={item.title} className="w-full h-40 object-cover" /><div className="p-6"><h3 className="font-bold text-gray-800 mb-2">{item.title}</h3><p className="text-xs text-gray-500 mb-4">{item.desc}</p><div className="flex justify-end"><ArrowRight className="w-4 h-4 text-gray-400" /></div></div></div>))}</div>
                        </section>
                        <section>
                            <div className="mb-4 mt-4"><h2 className="text-xl font-bold text-gray-900">Flights selected for you</h2><p className="text-sm text-gray-500">4 routes in your area</p></div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-1">{selectedFlights.map((item, idx) => (<div key={idx} className="flex bg-[#FFF8E7] rounded-md overflow-hidden hover:shadow-md transition cursor-pointer h-40 "><div className="w-48 h-full flex-shrink-0"><img src={item.img} alt={item.name} className="w-full h-full object-cover" /></div><div className="p-4 flex flex-col justify-between flex-1"><div><h3 className="font-bold text-gray-800">{item.name}</h3><p className="text-[10px] text-gray-500 mt-1">{item.date}</p><p className="text-[10px] text-gray-500">Direct flight • {item.duration}</p></div><p className="text-right font-bold text-red-500 text-sm">{item.price}</p></div></div>))}</div>
                        </section>
                    </div>
                )}

                {user && (
                    <div className="max-w-5xl mx-auto px-6 py-10 space-y-10">
                        <div className="max-w-4xl mx-auto bg-[#FFF8E7] border border-[#FDE68A] rounded-md p-4 flex items-start gap-3 shadow-sm -mt-10">
                            <AlertTriangle className="w-5 h-5 text-yellow-500 mt-0.5" />
                            <p className="text-xs text-gray-600 leading-relaxed"><span className="font-bold text-gray-700">Travel Update:</span> Some travel routes may be affected by current weather conditions.</p>
                        </div>

                        <section className="space-y-6">
                            <h2 className="text-2xl font-bold text-gray-900">Prepare for your trip</h2>
                            <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
                                {infoCards.map((card, index) => {
                                    const isDarkerBlue = index % 2 === 0;
                                    return (
                                        <div key={index} className={`relative h-186px rounded-[1.5rem] p-5 flex flex-col justify-between overflow-hidden transition-transform hover:-translate-y-1 duration-300 cursor-pointer ${isDarkerBlue ? 'bg-[#BDCFFC]' : 'bg-[#EFF4FF]'}`}>
                                            <div className="z-10"><h3 className="text-base font-bold text-gray-800 leading-tight">{card.title}</h3><p className="text-[11px] text-gray-600 mt-1 leading-snug">{card.subtitle}</p></div>
                                            <div className="self-center mt-auto transform translate-y-2 opacity-90 scale-110">{card.illustration}</div>
                                        </div>
                                    );
                                })}
                            </div>
                        </section>

                       <section className="space-y-2">
                        <h2 className="text-xl font-bold text-gray-900">Traveling from your location</h2>
                        <p className="text-xs text-gray-500">Round trip · one passenger</p>
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-1">
                            <div className="space-y-1">
                                    {[
                                        { city: "Semarang", date: "Apr 5–8", duration: "35 min", price: "IDR 560.000", img: "/images/semarang.jpg", bg: "bg-[#FFF8E7]" },
                                        { city: "Malang", date: "Oct 5–8", duration: "45 min", price: "IDR 560.000", img: "/images/malang.jpg", bg: "bg-[#FFF8E7]" },
                                        { city: "Klaten", date: "Oct 5–8", duration: "25 min", price: "IDR 560.000", img: "/images/perambahnan.jpg", bg: "bg-[#FFF8E7]" }
                                    ].map((item, i) => (
                                        <div key={i} className={`flex items-center gap-4 border rounded-md overflow-hidden hover:shadow-md transition cursor-pointer h-24 ${item.bg}`}>
                                            <img 
                                                src={item.img} 
                                                alt={item.city} 
                                                className="w-32 h-full object-cover" 
                                            />
                                            <div className="flex flex-1 items-center justify-between pr-4 py-4">
                                                <div className="flex-1">
                                                    <h3 className="font-bold text-gray-800 text-sm">{item.city}</h3>
                                                    <p className="text-[11px] text-gray-500">{item.date} · Direct flight · {item.duration}</p>
                                                </div>
                                                <span className="text-sm font-bold text-gray-900">{item.price}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div className="rounded-xl overflow-hidden shadow-sm border border-gray-100 min-h-[300px]">
                                    <MapContainer center={[-7.25, 110.25]} zoom={7} scrollWheelZoom={true} zoomControl={false} style={{ width: '100%', height: '100%' }}>
                                        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution='&copy; OpenStreetMap' />
                                    </MapContainer>
                                </div>
                            </div>
                        </section>
                    </div>
                )}
            </>
        )}
      </div>

      <Footer />

      {selectedFlight && user && (
        <BookingProcess
          flight={selectedFlight}
          passengerCount={totalPassengers}
          onClose={() => setSelectedFlight(null)}
          onSuccess={handleBookingSuccess}
        />
      )}
    </div>
  );
};