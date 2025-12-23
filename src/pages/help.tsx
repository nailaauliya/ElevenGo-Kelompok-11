import { useState } from 'react';
import { Search, X, Send, Facebook, Instagram, Linkedin, Phone, Mail } from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext'; // Import Auth

const commonQuestions = [
  { id: 1, question: 'How can I cancel my flight ticket?' },
  { id: 2, question: 'How can I submit a claim?' },
  { id: 3, question: 'I had almost finished the booking when I received the message "Session Expired". What does it mean?' },
  { id: 4, question: 'When is my booking confirmed?' },
  { id: 5, question: 'I have entered wrong details of my travel documents during online check-in. What shall I do?' },
  { id: 6, question: 'How can I check if the transaction has been completed?' },
  { id: 7, question: 'Is it safe to book a ticket online?' },
  { id: 8, question: 'I had almost finished the booking when I received the message "Session Expired". What does it mean?' },
  { id: 9, question: 'How can I travel with my child?' },
  { id: 10, question: 'Does my small child need to be checked in?' },
];

const allTopics = [
  'Group bookings', 'Live flight status', 'Covid Information Hub', 'Check out process',
  'Travel information', 'Prices and discounts', 'About Us', 'Contact us', 'Visa',
  'Mobile app', 'Check out process', 'Airlines', 'Visa', 'Live flight status', 'About Us',
  'Check out process', 'Group bookings', 'Live flight status', 'About Us', 'Mobile app',
];

export default function Help() {
  const { user } = useAuth(); // Cek status login
  const [searchQuery, setSearchQuery] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form submitted:', { email, message });
    alert('Question submitted successfully!');
    setEmail('');
    setMessage('');
  };

  return (
    <div className="min-h-screen bg-[#F9FAFB] font-sans">

     <Header/>

      {/* HERO SECTION */}
      <div className={`bg-[#00173F] text-white py-20 px-4 md:px-0 ${!user ? 'pt-32' : ''}`}> 
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-3xl font-bold mb-8">Welcome! How can we help?</h1>
          <div className="relative max-w-xl mx-auto">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full py-3 pl-12 pr-10 rounded-md bg-[#00285F] border border-[#003A8C] text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
              >
                <X size={20} />
              </button>
            )}
          </div>
          <div className="text-sm mt-4 text-gray-300">
            Popular searches: <span className="text-orange-500 cursor-pointer hover:underline">Check out, Map, Card Information</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-5xl mx-auto px-4 md:px-0 py-16">
        
        {/* Common Questions */}
        <div className="mb-16">
          <h2 className="text-xl font-bold text-gray-900 mb-8">Common questions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <ul className="space-y-4">
              {commonQuestions.slice(0, 5).map((q) => (
                <li key={q.id}>
                  <a href="#" className="text-gray-600 hover:text-blue-600 hover:underline">{q.question}</a>
                </li>
              ))}
            </ul>
            <ul className="space-y-4">
              {commonQuestions.slice(5).map((q) => (
                <li key={q.id}>
                  <a href="#" className="text-gray-600 hover:text-blue-600 hover:underline">{q.question}</a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* All Topics */}
        <div className="mb-16">
          <h2 className="text-xl font-bold text-gray-900 mb-8">All topics</h2>
          <div className="flex flex-wrap gap-3">
            {allTopics.map((topic, index) => (
              <button
                key={index}
                className="px-4 py-2 bg-white border border-gray-200 rounded-full text-sm text-blue-600 hover:bg-blue-50 hover:border-blue-300 transition-colors"
              >
                {topic}
              </button>
            ))}
          </div>
        </div>

        {/* Contact Form and Information */}
        <div className="flex flex-col md:flex-row bg-white shadow-sm rounded-lg overflow-hidden border border-gray-100">
          {/* Contact Form */}
          <div className="p-8 md:w-3/5">
            <h2 className="text-xl font-bold text-gray-900 mb-2">Didn't find what you are looking for ?</h2>
            <h3 className="text-lg font-bold text-gray-900 mb-6">Write us a question</h3>
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email<span className="text-red-500">*</span></label>
                <input
                  type="email"
                  id="email"
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="example@gmail.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="mb-6">
                <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">Message<span className="text-red-500">*</span></label>
                <textarea
                  id="message"
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Your message"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  required
                ></textarea>
              </div>
              <button
                type="submit"
                className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-bold rounded-md hover:bg-blue-700 transition-colors"
              >
                Submit
                <Send size={18} className="transform rotate-45" />
              </button>
            </form>
          </div>

          {/* Contact Information */}
          <div className="bg-[#00173F] text-white p-8 md:w-2/5 flex flex-col justify-between">
            <div>
              <h2 className="text-xl font-bold mb-8">Contact information</h2>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Phone size={20} />
                  <span>(800) 900 200 300</span>
                </div>
                <div className="flex items-center gap-3">
                  <Mail size={20} />
                  <span>contact@ElevenGo.com</span>
                </div>
              </div>
            </div>
            <div className="flex gap-4 mt-8">
              <a href="#" className="hover:text-blue-400"><Facebook size={24} /></a>
              <a href="#" className="hover:text-pink-400"><Instagram size={24} /></a>
              <a href="#" className="hover:text-blue-500"><Linkedin size={24} /></a>
            </div>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
}