import { useState, useEffect } from 'react';
import { 
  User, CreditCard, HelpCircle, Wallet, History, LogOut, Camera, 
  ChevronRight, ChevronDown, Plus, CheckCircle, ShieldCheck, X
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Header from '../components/Header';
import Footer from '../components/Footer';
import api from '../lib/axios'; // Pastikan import api ada

// --- SUB-COMPONENT: MODERN DROPDOWN ---
const ModernSelect = ({ value, onChange, name, options, placeholder = "", className = "" }: any) => (
  <div className={`relative ${className}`}>
    <select
      name={name}
      value={value}
      onChange={onChange}
      className="w-full appearance-none bg-white border border-gray-300 text-gray-700 text-sm rounded-lg p-3 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all cursor-pointer font-medium"
    >
      {placeholder && <option value="" disabled>{placeholder}</option>}
      {options.map((opt: any) => (
        <option key={opt} value={opt}>{opt}</option>
      ))}
    </select>
    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-gray-400">
      <ChevronDown size={16} />
    </div>
  </div>
);

// --- SUB-COMPONENT: SUCCESS POPUP (TOAST) ---
const SuccessPopup = ({ show, onClose }: { show: boolean, onClose: () => void }) => {
  return (
    <div 
      className={`fixed top-24 left-1/2 transform -translate-x-1/2 z-[1000] transition-all duration-500 ease-out 
      ${show ? 'translate-y-0 opacity-100' : '-translate-y-10 opacity-0 pointer-events-none'}`}
    >
      <div className="bg-white border-l-4 border-green-500 rounded-lg shadow-2xl p-4 flex items-center gap-4 min-w-[320px] max-w-md">
        <div className="bg-green-100 p-2 rounded-full">
           <CheckCircle className="w-6 h-6 text-green-600" />
        </div>
        <div className="flex-1">
           <h4 className="text-sm font-bold text-gray-800">Success!</h4>
           <p className="text-xs text-gray-500">Your profile changes have been saved.</p>
        </div>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
           <X size={18} />
        </button>
      </div>
    </div>
  );
};

export default function Profile() {
  const navigate = useNavigate();
  // Kita tidak pakai updateProfile dari context lagi, tapi panggil API langsung di sini agar bisa handle FormData
  const { user, signOut, updateProfile } = useAuth(); 

  // --- STATE ---
  const [profileData, setProfileData] = useState({
    firstName: '',
    middleName: '',
    lastName: '',
    pronouns: 'He/him',
    gender: 'Male',
    citizenship: 'Indonesia',
    birthDay: '23',
    birthMonth: '04',
    birthYear: '2000',
    phoneCode: '+62',
    phoneNumber: '812-3456-7890',
    accountNumber: '12345678891012',
    email: '', 
    // Default Photo Placeholder
    photoUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=200&auto=format&fit=crop'
  });

  // State khusus untuk file foto yang dipilih user
  const [photoFile, setPhotoFile] = useState<File | null>(null);

  // --- USE EFFECT: ISI DATA DARI LARAVEL SAAT LOAD ---
  useEffect(() => {
    if (user) {
      const fullName = user.full_name || ''; 

      // Pecah Nama Lengkap
      let first = '';
      let middle = '';
      let last = '';

      if (fullName) {
        const parts = fullName.trim().split(/\s+/);
        if (parts.length === 1) {
            first = parts[0];
        } else if (parts.length === 2) {
            first = parts[0];
            last = parts[1];
        } else if (parts.length > 2) {
            first = parts[0];
            last = parts[parts.length - 1];
            middle = parts.slice(1, parts.length - 1).join(' ');
        }
      }

      // Pecah Tanggal Lahir
      let bDay = '01', bMonth = '01', bYear = '2000';
      if (user.birth_date) {
          const dateParts = user.birth_date.split('-');
          if (dateParts.length === 3) {
              bYear = dateParts[0];
              bMonth = dateParts[1];
              bDay = dateParts[2];
          }
      }

      let finalPhotoUrl = user.photo_url || profileData.photoUrl;
      if (user.photo_url && !user.photo_url.startsWith('http')) {
          finalPhotoUrl = `https://elevengo.rf.gd/storage/${user.photo_url}`;
      }

      setProfileData(prev => ({
        ...prev,
        email: user.email || '',
        firstName: first || prev.firstName,
        lastName: last || prev.lastName,
        middleName: middle || prev.middleName,
        phoneNumber: user.phone || prev.phoneNumber,
        gender: user.gender || prev.gender,
        citizenship: user.citizenship || prev.citizenship,
        birthDay: parseInt(bDay).toString(),
        birthMonth: bMonth,
        birthYear: bYear,
        photoUrl: finalPhotoUrl
      }));
    }
  }, [user]);

  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false); 
  const [selectedPayment, setSelectedPayment] = useState('wallet'); 

  // --- HANDLERS ---
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setProfileData({ ...profileData, [e.target.name]: e.target.value });
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setPhotoFile(file); // Simpan file asli untuk diupload
      
      // Preview gambar di UI
      const imageUrl = URL.createObjectURL(file);
      setProfileData({ ...profileData, photoUrl: imageUrl });
    }
  };

  // --- UPDATE DATA KE LARAVEL (DENGAN FOTO) ---
  const handleSave = async () => {
    setIsSaving(true);
    
    try {
        const fullName = `${profileData.firstName} ${profileData.middleName} ${profileData.lastName}`.replace(/\s+/g, ' ').trim();
        const birthDate = `${profileData.birthYear}-${profileData.birthMonth.padStart(2, '0')}-${profileData.birthDay.padStart(2, '0')}`;

        // GUNAKAN FORMDATA (Wajib untuk upload file)
        const formData = new FormData();
        formData.append('full_name', fullName);
        formData.append('phone', profileData.phoneNumber);
        formData.append('gender', profileData.gender);
        formData.append('citizenship', profileData.citizenship);
        formData.append('birth_date', birthDate);
        
        // PENTING: Pastikan key 'photo' sesuai dengan validasi di Controller Laravel
        if (photoFile) {
            formData.append('photo', photoFile); 
        }

       
        const response = await api.post('/user/update', formData, {
            headers: {
                'Content-Type': 'multipart/form-data', // <--- INI KUNCINYA
            },
        });

      
        if (updateProfile) {
            window.location.reload(); 
        }

        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 3000);

    } catch (error: any) {
        console.error("Gagal update profile:", error);
        
        // Menampilkan pesan error asli dari Laravel agar kita tahu salahnya dimana
        let msg = "Gagal menyimpan perubahan.";
        if (error.response && error.response.data && error.response.data.errors) {
             // Ambil error pertama dari Laravel
             const firstKey = Object.keys(error.response.data.errors)[0];
             msg = error.response.data.errors[firstKey][0];
        } else if (error.response && error.response.data.message) {
             msg = error.response.data.message;
        }
        
        alert(msg);
    } finally {
        setIsSaving(false);
    }
  };

  const handleLogout = async () => {
    try { await signOut(); navigate('/'); } catch (error) { console.error(error); }
  };

  const formatIDR = (amount: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);
  };

  const displayFullName = `${profileData.firstName} ${profileData.middleName ? profileData.middleName + ' ' : ''}${profileData.lastName}`.trim() || user?.full_name || "User";

  return (
    <div className="min-h-screen bg-gray-50 font-sans flex flex-col relative">
      <div className="bg-white sticky top-0 z-50 shadow-sm"><Header /></div>

      {/* --- POPUP NOTIFICATION --- */}
      <SuccessPopup show={showSuccess} onClose={() => setShowSuccess(false)} />

      <div className="flex-1 w-full max-w-7xl mx-auto px-4 md:px-8 py-8 flex flex-col lg:flex-row gap-8">
        
        {/* --- SIDEBAR KIRI --- */}
        <div className="w-full lg:w-1/4">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col items-center sticky top-24">
            <div className="relative mb-4 group cursor-pointer">
              <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-gray-100">
                <img src={profileData.photoUrl} alt="Profile" className="w-full h-full object-cover" />
              </div>
              <label htmlFor="photo-upload" className="absolute bottom-0 right-0 bg-white border border-gray-200 p-1.5 rounded-full shadow-md cursor-pointer hover:bg-gray-50 transition-colors">
                <Camera size={14} className="text-gray-600" />
                <input type="file" id="photo-upload" className="hidden" accept="image/*" onChange={handlePhotoUpload} />
              </label>
            </div>
            
            <h2 className="font-bold text-gray-800 text-lg mb-6 text-center">{displayFullName}</h2>

            <div className="w-full space-y-1">
              <button onClick={() => navigate('/profile')} className="w-full flex items-center justify-between px-4 py-3 rounded-lg text-sm font-medium bg-blue-50 text-blue-700 border-l-4 border-blue-600 transition-all"><div className="flex items-center gap-3"><User size={18}/> Personal Details</div><ChevronRight size={16} /></button>
              <button onClick={() => navigate('/help')} className="w-full flex items-center justify-between px-4 py-3 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"><div className="flex items-center gap-3"><HelpCircle size={18}/> Support</div></button>
              <button onClick={() => navigate('/wallet')} className="w-full flex items-center justify-between px-4 py-3 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"><div className="flex items-center gap-3"><Wallet size={18}/> Wallet</div></button>
              <button onClick={() => navigate('/Paymenthistory')} className="w-full flex items-center justify-between px-4 py-3 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"><div className="flex items-center gap-3"><History size={18}/> Payment History</div></button>
              <button onClick={handleLogout} className="w-full flex items-center justify-between px-4 py-3 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-colors mt-4"><div className="flex items-center gap-3"><LogOut size={18}/> Log out</div></button>
            </div>
          </div>
        </div>

        {/* --- KONTEN KANAN --- */}
        <div className="w-full lg:w-3/4 space-y-8">
          
          {/* 1. PERSONAL DETAILS CARD */}
          <div className="bg-[#D9E2F3] rounded-t-xl overflow-hidden border border-blue-100 shadow-sm">
             <div className="bg-[#BCCCE8] px-6 py-3 font-bold text-[#03153E]">Personal Details</div>
             <div className="p-8 bg-[#F0F4FA]">
               
               {/* Name Row */}
               <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                  <div>
                     <label className="block text-xs font-bold text-gray-500 mb-1.5">Name</label>
                     <input name="firstName" value={profileData.firstName} onChange={handleChange} className="w-full border border-gray-300 rounded-lg p-3 text-sm bg-white focus:ring-2 focus:ring-blue-200 outline-none font-medium" placeholder="First Name"/>
                  </div>
                  <div>
                     <label className="block text-xs font-bold text-gray-500 mb-1.5">&nbsp;</label>
                     <input name="middleName" value={profileData.middleName} onChange={handleChange} className="w-full border border-gray-300 rounded-lg p-3 text-sm bg-white focus:ring-2 focus:ring-blue-200 outline-none font-medium" placeholder="Middle Name (Optional)"/>
                  </div>
                  <div>
                     <label className="block text-xs font-bold text-gray-500 mb-1.5">&nbsp;</label>
                     <input name="lastName" value={profileData.lastName} onChange={handleChange} className="w-full border border-gray-300 rounded-lg p-3 text-sm bg-white focus:ring-2 focus:ring-blue-200 outline-none font-medium" placeholder="Last Name"/>
                  </div>
               </div>

               {/* Pronouns & Gender */}
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                     <label className="block text-xs font-bold text-gray-500 mb-1.5">Pronouns</label>
                     <ModernSelect name="pronouns" value={profileData.pronouns} onChange={handleChange} options={['He/him', 'She/her', 'They/them']} />
                  </div>
                  <div>
                     <label className="block text-xs font-bold text-gray-500 mb-1.5">Gender</label>
                     <ModernSelect name="gender" value={profileData.gender} onChange={handleChange} options={['Male', 'Female', 'Gender fluid', 'Non-binary']} />
                  </div>
               </div>

               {/* Citizenship */}
               <div className="mb-6">
                  <label className="block text-xs font-bold text-gray-500 mb-1.5">Citizenship</label>
                  <div className="w-full md:w-1/2">
                      <ModernSelect name="citizenship" value={profileData.citizenship} onChange={handleChange} options={['Indonesia', 'Singapore', 'Malaysia', 'Thailand', 'Vietnam']} />
                  </div>
               </div>

               {/* Date of Birth */}
               <div className="mb-6">
                  <label className="block text-xs font-bold text-gray-500 mb-1.5">Date of birth</label>
                  <div className="flex gap-4">
                      <ModernSelect className="w-24" name="birthDay" value={profileData.birthDay} onChange={handleChange} options={Array.from({length:31},(_,i)=>i+1)} />
                      <ModernSelect className="w-24" name="birthMonth" value={profileData.birthMonth} onChange={handleChange} options={Array.from({length:12},(_,i)=>i+1).map(m=>String(m).padStart(2,'0'))} />
                      <ModernSelect className="w-32" name="birthYear" value={profileData.birthYear} onChange={handleChange} options={Array.from({length:60},(_,i)=>2025-i)} />
                  </div>
               </div>

               {/* Phone */}
               <div className="mb-8">
                  <label className="block text-xs font-bold text-gray-500 mb-1.5">Phone number</label>
                  <div className="flex gap-4 items-center">
                      <div className="flex items-center gap-2 bg-white border border-gray-300 px-4 py-3 rounded-lg shadow-sm h-[46px]">
                         <img src="https://flagcdn.com/w20/id.png" alt="ID" className="w-5 rounded-sm shadow-sm"/>
                         <span className="text-sm font-medium text-gray-700">ID (+62)</span>
                      </div>
                      <input name="phoneNumber" value={profileData.phoneNumber} onChange={handleChange} className="flex-1 border border-gray-300 rounded-lg p-3 text-sm bg-white focus:ring-2 focus:ring-blue-200 outline-none font-medium h-[46px]" />
                  </div>
               </div>

               <button onClick={handleSave} className="bg-blue-700 hover:bg-blue-800 text-white px-8 py-3 rounded-lg text-sm font-bold transition-all shadow-md active:scale-95 flex items-center gap-2">
                  {isSaving ? <span className="animate-pulse">Saving...</span> : <><ShieldCheck size={18}/> Save Changes</>}
               </button>
            </div>
         </div>

         {/* 2. ACCOUNT DETAILS CARD */}
         <div className="bg-[#D9E2F3] rounded-t-xl overflow-hidden border border-blue-100 shadow-sm">
            <div className="bg-[#BCCCE8] px-6 py-3 font-bold text-[#03153E]">Account details</div>
            <div className="p-8 bg-[#F0F4FA]">
               <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center mb-6">
                  <div>
                     <label className="block text-xs font-bold text-gray-500 mb-1.5">Email</label>
                     <input 
                       type="email"
                       value={profileData.email} 
                       readOnly
                       disabled
                       className="w-full bg-gray-200/60 border border-gray-300 rounded-lg p-3 text-sm text-gray-600 font-medium cursor-not-allowed select-none focus:outline-none"
                     />
                  </div>
                  <div className="text-right md:text-left pt-6">
                     <button className="text-xs text-blue-600 font-bold underline cursor-pointer hover:text-blue-800 transition-colors">Change Password</button>
                  </div>
               </div>
               <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1.5">Account number</label>
                  <input name="accountNumber" value={profileData.accountNumber} onChange={handleChange} className="w-full md:w-1/2 border border-gray-300 rounded-lg p-3 text-sm bg-white focus:ring-2 focus:ring-blue-200 outline-none font-medium transition-all" />
               </div>
            </div>
         </div>

         {/* 3. PAYMENT METHODS CARD */}
         {/* 3. PAYMENT METHODS CARD */}
         <div className="bg-[#D9E2F3] rounded-t-xl overflow-hidden border border-blue-100 shadow-sm">
            <div className="bg-[#BCCCE8] px-6 py-3 font-bold text-[#03153E] flex justify-between items-center">
               <span>Payment methods</span>
               <button onClick={() => navigate('/Creditcard')} className="bg-white/50 hover:bg-white text-blue-900 text-xs px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all font-bold">
                 <Plus size={14} /> Add Card
               </button>
            </div>
            
            <div className="p-8 bg-[#F0F4FA]">
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  
                  {/* OPTION 1: WALLET (DINAMIS DARI DB) */}
                  <div onClick={() => setSelectedPayment('wallet')} className={`relative bg-white p-5 rounded-xl shadow-sm border-2 cursor-pointer transition-all hover:-translate-y-1 hover:shadow-md flex flex-col justify-between h-32 ${selectedPayment === 'wallet' ? 'border-blue-500 ring-1 ring-blue-500 bg-blue-50/30' : 'border-gray-200 hover:border-blue-300'}`}>
                      {selectedPayment === 'wallet' && <div className="absolute top-3 right-3 text-blue-600"><CheckCircle size={20} fill="currentColor" className="text-white"/></div>}
                      <div className="flex items-center gap-3 mb-2">
                          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600"><Wallet size={20} /></div>
                          <span className="font-bold text-gray-700 text-sm">ElevenPay</span>
                      </div>
                      <div>
                          <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Balance</p>
                          {/* FIX: Ambil saldo langsung dari context user, dengan fallback 0 jika null/undefined */}
                          <p className="text-lg font-bold text-gray-800">
                              {formatIDR(user && user.wallet_balance !== undefined ? user.wallet_balance : 0)}
                          </p>
                      </div>
                  </div>

                  {/* OPTION 2: BCA CARD */}
                  <div onClick={() => setSelectedPayment('bca')} className={`relative bg-white p-5 rounded-xl shadow-sm border-2 cursor-pointer transition-all hover:-translate-y-1 hover:shadow-md flex flex-col justify-between h-32 ${selectedPayment === 'bca' ? 'border-blue-500 ring-1 ring-blue-500 bg-blue-50/30' : 'border-gray-200 hover:border-blue-300'}`}>
                      {selectedPayment === 'bca' && <div className="absolute top-3 right-3 text-blue-600"><CheckCircle size={20} fill="currentColor" className="text-white"/></div>}
                      <div className="flex justify-between items-start mb-2"><div className="bg-blue-700 text-white px-2 py-0.5 rounded text-xs font-bold shadow-sm">BCA</div></div>
                      <div><p className="font-mono text-gray-700 font-bold tracking-widest text-sm mb-1">•••• 8888</p><div className="flex justify-between items-center"><p className="text-[10px] text-gray-400 font-bold uppercase truncate max-w-[80px]">{displayFullName}</p><p className="text-[10px] text-red-400 font-medium">Exp: 12/28</p></div></div>
                  </div>

                  {/* OPTION 3: BRI CARD */}
                  <div onClick={() => setSelectedPayment('bri')} className={`relative bg-white p-5 rounded-xl shadow-sm border-2 cursor-pointer transition-all hover:-translate-y-1 hover:shadow-md flex flex-col justify-between h-32 ${selectedPayment === 'bri' ? 'border-blue-500 ring-1 ring-blue-500 bg-blue-50/30' : 'border-gray-200 hover:border-blue-300'}`}>
                      {selectedPayment === 'bri' && <div className="absolute top-3 right-3 text-blue-600"><CheckCircle size={20} fill="currentColor" className="text-white"/></div>}
                      <div className="flex justify-between items-start mb-2"><div className="bg-blue-500 text-white px-2 py-0.5 rounded text-xs font-bold shadow-sm">BRI</div></div>
                      <div><p className="font-mono text-gray-700 font-bold tracking-widest text-sm mb-1">•••• 5678</p><div className="flex justify-between items-center"><p className="text-[10px] text-gray-400 font-bold uppercase truncate max-w-[80px]">{displayFullName}</p><p className="text-[10px] text-red-400 font-medium">Exp: 09/26</p></div></div>
                  </div>
               </div>
            </div>
         </div>

       </div>
     </div>
     
     <Footer />
   </div>
 );
}