import type { Flight } from '../lib/database.types';

interface FlightCardProps {
  flight: Flight;
  isSelected: boolean;              
  onSelect: (flight: Flight) => void; 
}

export const FlightCard = ({ flight, isSelected, onSelect }: FlightCardProps) => {
  const departureDate = new Date(flight.departure_time);
  const arrivalDate = new Date(flight.arrival_time);

  // 1. Format Jam (Contoh: 18:10)
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-GB', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  // 3. Hitung Durasi (Contoh: 2h 5m)
  const calculateDuration = () => {
    const diff = arrivalDate.getTime() - departureDate.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  };


  const formattedPrice = new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(flight.price);

  return (
    <div 
      onClick={() => onSelect(flight)}
      className={`relative flex flex-col md:flex-row w-full border rounded-lg overflow-hidden cursor-pointer transition-all mb-4 shadow-sm group
        ${isSelected ? 'border-orange-500 bg-[#FFF8E7]' : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-md'}
      `}
    >
      {/* --- BAGIAN KIRI: Checkbox Selection --- */}
      <div className={`flex md:w-20 flex-row md:flex-col items-center justify-center p-3 gap-2 transition-colors
          ${isSelected ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-400 group-hover:bg-gray-200'}
      `}>
        {/* Kotak Checkbox */}
        <div className={`w-5 h-5 rounded border-2 flex items-center justify-center
          ${isSelected ? 'border-white bg-white' : 'border-gray-400 bg-transparent'}
        `}>
          {isSelected && <span className="text-orange-500 text-xs font-bold">✓</span>}
        </div>
        {/* Teks Select/Selected */}
        <span className="text-[10px] font-medium leading-tight text-center uppercase tracking-wide">
          {isSelected ? 'Selected' : 'Select'}
        </span>
      </div>

      {/* --- BAGIAN KANAN: Detail Penerbangan --- */}
      <div className="flex-1 p-5 flex flex-col md:flex-row items-center justify-between gap-6">
        
        {/* Info Rute & Jam */}
        <div className="flex items-center justify-between w-full md:w-auto gap-4 md:gap-12 flex-1">
          
          {/* Keberangkatan */}
          <div className="text-center md:text-left min-w-[100px]">
            <p className="text-gray-500 text-xs mb-1">{formatDate(departureDate)}</p>
            <p className="text-xs font-semibold text-gray-700 mb-1">
              {flight.origin} 
              {/* Jika ingin menampilkan kode bandara saja, bisa diolah string-nya */}
            </p>
            <p className="text-3xl font-bold text-gray-900">{formatTime(departureDate)}</p>
          </div>

          
          <div className="flex flex-col items-center flex-1 px-2">
            <span className="text-xs text-gray-400 mb-1">{calculateDuration()}</span>
            <div className="relative w-full h-[2px] bg-gray-300 max-w-[120px]">
            
              <div className="absolute -right-1 -top-[3px] w-2 h-2 border-t-2 border-r-2 border-gray-300 rotate-45"></div>
         
              <div className="absolute -left-1 -top-[2px] w-1.5 h-1.5 rounded-full bg-gray-300"></div>
            </div>
            <span className="text-[10px] text-gray-400 mt-1 truncate max-w-[120px]">
              {flight.airline || 'ElevenGo Air'}
            </span>
          </div>

        
          <div className="text-center md:text-left min-w-[100px]">
            <p className="text-gray-500 text-xs mb-1">{formatDate(arrivalDate)}</p>
            <p className="text-xs font-semibold text-gray-700 mb-1">{flight.destination}</p>
            <p className="text-3xl font-bold text-gray-900">{formatTime(arrivalDate)}</p>
          </div>
        </div>

        <div className="text-center md:text-right border-t md:border-t-0 border-gray-100 w-full md:w-auto pt-4 md:pt-0 mt-2 md:mt-0 min-w-[180px]">
          <p className="text-orange-500 font-bold text-lg mb-1">
            {formattedPrice}
          </p>
          <p className="text-[10px] text-gray-500">/pax • Economy</p>
        </div>

      </div>
    </div>
  );
};