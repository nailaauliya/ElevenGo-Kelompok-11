# ElevenGo - Flight Booking Application

A modern, full-featured flight booking web application built with React, TypeScript, and Supabase.

## Features

- **User Authentication**: Secure email/password authentication with Supabase
- **Flight Search**: Search flights by origin, destination, date, and passenger count
- **Real-time Availability**: Live seat availability updates
- **Booking Management**: View and manage all your flight bookings
- **Responsive Design**: Beautiful UI that works on all devices
- **TypeScript**: Fully typed codebase for better development experience

## Tech Stack

### Frontend
- React 18 with TypeScript
- Vite for fast development and building
- Tailwind CSS for styling
- Lucide React for icons

### Backend
- Supabase (PostgreSQL database)
- Supabase Authentication
- Supabase Edge Functions for serverless API

### Database Schema
- **profiles**: User profile information
- **flights**: Available flights with pricing and availability
- **bookings**: User flight bookings with passenger details

## Getting Started

### Prerequisites
- Node.js (v18 or higher)
- A Supabase account

### Setup

1. **Clone and Install**
   ```bash
   npm install
   ```

2. **Configure Environment Variables**

   Create a `.env` file in the root directory:
   ```
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

3. **Database Setup**

   The database schema has already been created with:
   - Tables for profiles, flights, and bookings
   - Row Level Security policies
   - Sample flight data

4. **Edge Functions**

   Two edge functions are deployed:
   - `search-flights`: Search and filter available flights
   - `create-booking`: Create new flight bookings

5. **Run Development Server**
   ```bash
   npm run dev
   ```

## Application Structure

```
src/
├── components/          # Reusable UI components
│   ├── Header.tsx      # Navigation header
│   ├── Hero.tsx        # Hero section with search form
│   ├── FlightCard.tsx  # Flight display card
│   ├── BookingModal.tsx # Booking form modal
│   └── Router.tsx      # Custom routing solution
├── pages/              # Application pages
│   ├── Home.tsx        # Main landing page
│   ├── Login.tsx       # User login page
│   ├── Signup.tsx      # User registration page
│   └── Bookings.tsx    # User bookings page
├── contexts/           # React contexts
│   └── AuthContext.tsx # Authentication state management
├── lib/                # Utility libraries
│   ├── supabase.ts     # Supabase client configuration
│   └── database.types.ts # TypeScript types for database
└── App.tsx             # Main application component
```

## Key Features

### Authentication
- Secure email/password authentication
- Protected routes for authenticated users
- Persistent sessions

### Flight Search
- Search by origin and destination
- Filter by departure date
- Specify passenger count
- Real-time availability checking

### Booking System
- Multi-passenger booking support
- Detailed passenger information collection
- Instant booking confirmation
- Booking history and management

### Security
- Row Level Security (RLS) enabled on all tables
- Users can only access their own data
- Secure API endpoints with JWT authentication

## API Endpoints

### Edge Functions

**Search Flights**
```
GET /functions/v1/search-flights
Query Parameters:
  - origin: string
  - destination: string
  - departureDate: string (ISO date)
  - passengers: number
```

**Create Booking**
```
POST /functions/v1/create-booking
Body:
  - flightId: string
  - passengerCount: number
  - passengerDetails: Array<{firstName, lastName, email, phone}>
```

## Building for Production

```bash
npm run build
```

The built files will be in the `dist/` directory.

## Development

- **Linting**: `npm run lint`
- **Type Checking**: `npm run typecheck`

## Design Philosophy

The application follows modern design principles:
- Clean, professional aesthetic with neutral colors
- Excellent contrast ratios for readability
- Smooth transitions and hover effects
- Responsive layout for all screen sizes
- Intuitive user experience

## License

This project is private and proprietary.
