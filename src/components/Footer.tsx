import { Link } from 'react-router-dom';
import { 
  Facebook, 
  Instagram, 
  Twitter, 
  Youtube, 
  Linkedin, 
  ArrowUp 
} from 'lucide-react';

export default function Footer() {
  
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  

  return (
    // UBAH PADDING: pt-6 pb-4 (Lebih pendek)
    <footer className="w-full bg-[#CED9F5] pt-6 pb-4 px-6 font-sans text-gray-600 relative mt-auto">
      <div className="max-w-5xl mx-auto relative">
    <button
    onClick={scrollToTop}
    className="
        hidden md:flex
        absolute
        -right-28
        top-6
        z-10
        bg-blue-600
        hover:bg-blue-700
        text-white
        w-12
        h-12
        flex-col
        items-center
        justify-center
        gap-0.5
        shadow-lg
        transition-colors
    "
    >
    <span className="text-[8px] font-bold leading-none">Top</span>
    <ArrowUp className="w-3 h-3" />
    </button>

      <div className="flex flex-col md:flex-row items-start justify-between mb-3">

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 w-full md:w-4/5">

            <div className="flex flex-col gap-1">
              <h3 className="font-bold text-gray-800 text-xs mb-1">Passengers</h3>
              <Link to="/" className="hover:text-blue-700 hover:underline transition-colors text-[11px]">Buy Ticket</Link>
              <Link to="/Mybooking" className="hover:text-blue-700 hover:underline transition-colors text-[11px]">My Booking</Link>
              <Link to="/wallet" className="hover:text-blue-700 hover:underline transition-colors text-[11px]">wallet</Link>
              <Link to="/FlightStatus" className="hover:text-blue-700 hover:underline transition-colors text-[11px]">Flight status</Link>
              <Link to="/FlightStatus" state={{ activeSidebar: 'map' }} className="hover:text-blue-700 hover:underline transition-colors text-[11px]">Map</Link>
              <Link to="/FlightStatus" state={{ activeSidebar: 'shop' }} className="hover:text-blue-700 hover:underline transition-colors text-[11px]">Shop & Dine</Link>
            </div>

            <div className="flex flex-col gap-1">
              <h3 className="font-bold text-gray-800 text-xs mb-1">Business</h3>
              <Link to="/about" className="hover:text-blue-700 hover:underline transition-colors text-[11px]">About us</Link>
              <Link to="/career" className="hover:text-blue-700 hover:underline transition-colors text-[11px]">Career</Link>
            </div>

            <div className="flex flex-col gap-1">
              <h3 className="font-bold text-gray-800 text-xs mb-1">General</h3>
              <Link to="/report" className="hover:text-blue-700 hover:underline transition-colors text-[11px]">Report Property</Link>
              <Link to="/signup" className="hover:text-blue-700 hover:underline transition-colors text-[11px]">Sign Up</Link>
              <Link to="/help" className="hover:text-blue-700 hover:underline transition-colors text-[11px]">Contact us</Link>
              <Link to="/newsroom" className="hover:text-blue-700 hover:underline transition-colors text-[11px]">Newsroom</Link>
            </div>
          </div>

      
        </div>
       
        <div className="flex flex-col md:flex-row justify-between items-center border-t border-gray-400/20 pt-3 gap-3">
          
          <div className="flex flex-col items-center md:items-start gap-1">
            <span className="text-[9px] font-bold text-gray-500 uppercase tracking-wide">Follow us</span>
            <div className="flex gap-2">
              <a href="https://www.instagram.com/naghnap/?utm_source=ig_web_button_share_sheet" target="_blank" className="text-gray-800 hover:text-blue-600 transition-colors"><Facebook className="w-3.5 h-3.5 fill-current" /></a>
              <a href="https://www.instagram.com/naghnap/?utm_source=ig_web_button_share_sheet" target="_blank" className="text-gray-800 hover:text-pink-600 transition-colors"><Instagram className="w-3.5 h-3.5" /></a>
              <a href="#" className="text-gray-800 hover:text-blue-400 transition-colors"><Twitter className="w-3.5 h-3.5 fill-current" /></a>
              <a href="#" className="text-gray-800 hover:text-red-600 transition-colors"><Youtube className="w-3.5 h-3.5" /></a>
              <a href="#" className="text-gray-800 hover:text-blue-800 transition-colors"><Linkedin className="w-3.5 h-3.5 fill-current" /></a>
            </div>
          </div>

          <div className="flex flex-col items-center md:items-end gap-1">
            <span className="text-[9px] font-bold text-gray-500 uppercase tracking-wide">Download app</span>
            <div className="flex gap-2">
              <a href="https://play.google.com/store/games?hl=id" target="_blank" className="hover:opacity-80 transition-opacity">
                <img src="https://upload.wikimedia.org/wikipedia/commons/3/3c/Download_on_the_App_Store_Badge.svg" alt="App Store" className="h-6"/>
              </a>
              <a href="https://www.apple.com/app-store/" target="_blank" className="hover:opacity-80 transition-opacity">
                <img src="https://upload.wikimedia.org/wikipedia/commons/7/78/Google_Play_Store_badge_EN.svg" alt="Google Play" className="h-6"/>
              </a>
            </div>
          </div>

        </div>
      </div>
    </footer>
  );
}