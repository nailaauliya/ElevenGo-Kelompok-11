import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../lib/axios'; 
import Footer from '../components/Footer';
import { signInWithPopup } from 'firebase/auth'; 
import { auth, googleProvider, appleProvider } from '../firebase'; 
import Header from '../components/Header';


export default function SignUp() {
  const navigate = useNavigate();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [dob, setDob] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [rememberMe, setRememberMe] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!agreeTerms) {
      setError('You must agree to the Terms and Privacy policy');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    try {
      const fullName = `${firstName} ${lastName}`.trim();
      await api.post('/register', {
        full_name: fullName,
        email: email,
        password: password,
        birth_date: dob 
      });

  
      navigate('/login');

    } catch (err: any) {
      const msg = err.response?.data?.message || 'Failed to create an account';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignUp = async () => {
    setError('');
  

    setLoading(true);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      console.log("Google User:", user);

      const response = await fetch('https://elevengo.rf.gd/api/google-login', {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify({
              email: user.email,
              name: user.displayName,
              google_uid: user.uid,
              photo_url: user.photoURL
          })
      });

      const data = await response.json();
      
      if (response.ok && data.success) {
         // c. Simpan Token
         localStorage.setItem('token', data.token); 
         localStorage.setItem('user_info', JSON.stringify(data.user));


         window.location.href = '/'; 
      } else {
         setError(data.message || 'Failed to sign up with Google.');
      }

    } catch (err: any) {
      console.error(err);
      setError('Google Sign Up failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };


  const handleAppleSignUp = async () => {

    setError('Apple Sign Up not configured yet.'); 
  };

  return (

    <div className="min-h-screen 
    bg-[linear-gradient(to_bottom,#03153E_0%,#03153E_35%,#F9FAFB_35%,#F9FAFB_100%)]
    flex flex-col font-sans text-white py-24">

    
     
     <Header/>


      <div className="flex-1 flex items-center justify-center p-4">
        <div className="flex w-full max-w-5xl bg-white text-gray-800 rounded-xl overflow-hidden shadow-2xl ">
          
          <div className="hidden md:block w-1/2 relative">
            <img 
              src="/images/LOGIN pesawat.jpg" 
              alt="Travel Adventure" 
              className="absolute inset-0 w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/20"></div>
          </div>

         
          <div className="w-full md:w-1/2 bg-[#FFF8E7] p-5 md:p-6 flex flex-col justify-center">
            <div className="max-w-sm mx-auto w-full">
              
              <p className="text-gray-500 text-sm font-medium mb-1">Start your journey</p>
              <h1 className="text-3xl font-bold text-[#1a1a1a] mb-6">Create an account</h1>

              {error && (
                <div className="mb-4 p-3 bg-red-100 text-red-600 text-sm rounded border border-red-200">
                  {error}
                </div>
              )}
                
           
             <form onSubmit={handleSubmit} className="flex flex-col gap-3">
                
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">First name</label>
                    <input
                      type="text"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      placeholder="First name"
                      className="w-full px-3 py-2 text-sm rounded border bg-transparent border-gray-300 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#FFC086] transition-all"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Last name</label>
                    <input
                      type="text"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      placeholder="Last name"
                      className="w-full px-3 py-2 text-sm rounded border bg-transparent border-gray-300 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#FFC086] transition-all"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">E-Mail</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="your.email@mail.com"
                      className="w-full px-3 py-2 text-sm rounded border bg-transparent border-gray-300 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#FFC086] transition-all"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Date of birth (MM/DD/YY)</label>
                    <input
                      type="date"
                      value={dob}
                      onChange={(e) => setDob(e.target.value)}
                      className="w-full px-3 py-2 text-sm rounded border bg-transparent border-gray-300 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#FFC086] transition-all"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Password</label>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="password"
                        className="w-full px-3 py-2 text-sm rounded border bg-transparent border-gray-300 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#FFC086] transition-all"
                        required
                      />
                      <button 
                        type="button" 
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-2 top-2 text-gray-400 hover:text-gray-600"
                      >
                          {showPassword ? "Hide" : "Show"}
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Confirm password</label>
                    <div className="relative">
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="********"
                        className="w-full px-3 py-2 text-sm rounded border bg-transparent border-gray-300 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#FFC086] transition-all"
                        required
                      />
                      <button 
                        type="button" 
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-2 top-2 text-gray-400 hover:text-gray-600"
                      >
                          {showConfirmPassword ? "Hide" : "Show"}
                      </button>
                    </div>
                  </div>
                </div>

            
                <div className="space-y-1.5 mt-1">
                  <div className="flex items-center gap-2">
                    <input 
                      type="checkbox" 
                      id="remember"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="w-4 h-4 rounded border-gray-400 bg-transparent checked:bg-[#FFC086] checked:border-[#FFC086] focus:ring-[#FFC086]"
                    />
                    
                    <label htmlFor="remember" className="text-xs text-gray-600">Remember me</label>
                  </div>
                  <div className="flex items-center gap-2">
                    <input 
                      type="checkbox" 
                      id="terms"
                      checked={agreeTerms}
                      onChange={(e) => setAgreeTerms(e.target.checked)}
                      className="w-4 h-4 rounded border-gray-400 bg-transparent checked:bg-[#FFC086] checked:border-[#FFC086] focus:ring-[#FFC086]"
                    />
                    
                    <label htmlFor="terms" className="text-xs text-gray-600">
                      I agree to all the <span className="text-blue-600 cursor-pointer">Terms</span> and <span className="text-blue-600 cursor-pointer">Privacy policy</span>
                    </label>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2.5 px-4 bg-[#FFC086] hover:bg-[#ffb066] text-white text-sm font-bold rounded-lg shadow hover:shadow-md transition-all mt-2 active:scale-95"
                >
                  {loading ? 'Creating...' : 'Create account'}
                </button>

                <div className="space-y-2">
             
                   <button 
                    type="button" 
                    onClick={handleGoogleSignUp} 
                    className="w-full flex items-center justify-center gap-2 bg-[#E6E6E6] hover:bg-[#d4d4d4] py-2 rounded-lg text-xs font-semibold text-gray-700 transition-colors"
                   >
                    <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="G" className="w-4 h-4"/>
                    Continue with Google
                   </button>

                  {/* Apple */}
                   <button 
                    type="button" 
                    onClick={handleAppleSignUp}
                    className="w-full flex items-center justify-center gap-2 bg-[#E6E6E6] hover:bg-[#d4d4d4] py-2 rounded-lg text-xs font-semibold text-gray-700 transition-colors"
                   >
                    <img src="data:image/jpeg;base64,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" alt="Apple" className="w-4 h-4"></img>
                    Continue with Apple
                   </button>
                </div>

                <p className="text-center text-sm text-gray-500 mt-4">
                  Already have an account? <Link to="/login" className="text-gray-900 font-bold hover:underline">Log In</Link>
                </p>

              </form>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}