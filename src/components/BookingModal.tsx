import { useState } from 'react';
import { X, User, Mail, Phone } from 'lucide-react';
import type { Flight, PassengerDetail } from '../lib/database.types';
import { useAuth } from '../contexts/AuthContext';

interface BookingModalProps {
  flight: Flight | null;
  passengerCount: number;
  onClose: () => void;
  onSuccess: () => void;
}

export const BookingModal = ({
  flight,
  passengerCount,
  onClose,
  onSuccess,
}: BookingModalProps) => {
  const { session } = useAuth();
  const [passengers, setPassengers] = useState<PassengerDetail[]>(
    Array.from({ length: passengerCount }, () => ({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
    }))
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!flight) return null;

  const handlePassengerChange = (
    index: number,
    field: keyof PassengerDetail,
    value: string
  ) => {
    const updated = [...passengers];
    updated[index] = { ...updated[index], [field]: value };
    setPassengers(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session) {
      setError('You must be logged in to book a flight');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-booking`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${session.access_token}`,
            apikey: import.meta.env.VITE_SUPABASE_ANON_KEY,
          },
          body: JSON.stringify({
            flightId: flight.id,
            passengerCount,
            passengerDetails: passengers,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create booking');
      }

      onSuccess();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">Complete Your Booking</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6">
          <div className="bg-slate-100 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-lg mb-2">Flight Details</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Flight:</span>{' '}
                <span className="font-semibold">{flight.flight_number}</span>
              </div>
              <div>
                <span className="text-gray-600">Route:</span>{' '}
                <span className="font-semibold">
                  {flight.origin} → {flight.destination}
                </span>
              </div>
              <div>
                <span className="text-gray-600">Passengers:</span>{' '}
                <span className="font-semibold">{passengerCount}</span>
              </div>
              <div>
                <span className="text-gray-600">Total:</span>{' '}
                <span className="font-semibold text-yellow-600">
                  {formatPrice(flight.price * passengerCount)}
                </span>
              </div>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <h3 className="font-semibold text-lg mb-4">Passenger Information</h3>

            {passengers.map((passenger, index) => (
              <div key={index} className="mb-6 p-4 border border-gray-200 rounded-lg">
                <h4 className="font-medium mb-4">Passenger {index + 1}</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      First Name
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="text"
                        value={passenger.firstName}
                        onChange={(e) =>
                          handlePassengerChange(index, 'firstName', e.target.value)
                        }
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Last Name
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="text"
                        value={passenger.lastName}
                        onChange={(e) =>
                          handlePassengerChange(index, 'lastName', e.target.value)
                        }
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="email"
                        value={passenger.email}
                        onChange={(e) =>
                          handlePassengerChange(index, 'email', e.target.value)
                        }
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="tel"
                        value={passenger.phone}
                        onChange={(e) =>
                          handlePassengerChange(index, 'phone', e.target.value)
                        }
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                        required
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}

            <div className="flex gap-4 mt-6">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-6 py-3 bg-yellow-500 hover:bg-yellow-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors"
              >
                {loading ? 'Processing...' : `Confirm Booking - ${formatPrice(flight.price * passengerCount)}`}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
