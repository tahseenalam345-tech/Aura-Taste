import { Link, useLocation } from 'react-router-dom';
import { FiShoppingBag, FiUser, FiMenu, FiX, FiBell } from 'react-icons/fi';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../lib/firebase';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';

// 🔔 Notification Sound
const ALERT_SOUND = "https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3";

export default function Navbar() {
  const { cart } = useCart();
  const { user, logout } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  
  // Audio Refs
  const audioRef = useRef(new Audio(ALERT_SOUND));
  const isFirstRun = useRef(true);

  const ADMIN_EMAIL = "tahseenalam345@gmail.com";
  const isAdmin = user?.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase();

  // Scroll Effect
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // --- NOTIFICATION LOGIC ---
  useEffect(() => {
    if (isAdmin) {
      const q = query(collection(db, "orders"), where("status", "==", "Pending"));
      
      const unsubscribe = onSnapshot(q, (snapshot) => {
        setPendingCount(snapshot.size);

        snapshot.docChanges().forEach((change) => {
          if (change.type === "added" && !isFirstRun.current) {
            audioRef.current.play().catch(e => console.log("Audio blocked"));
            toast("🔥 NEW ORDER RECEIVED!", {
               icon: '🔔',
               style: { background: '#FFD700', color: '#000', fontWeight: 'bold' },
               duration: 6000
            });
          }
        });
        isFirstRun.current = false;
      });
      return () => unsubscribe();
    }
  }, [isAdmin]);

  const enableAudio = () => {
    audioRef.current.play().then(() => {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      toast.success("Notifications Enabled! 🔔");
    }).catch(() => toast.error("Could not enable audio"));
  };

  const isActive = (path) => location.pathname === path;
  
  // Your specific links
  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Menu', path: '/menu' },
    { name: 'Deals', path: '/deals' },
    { name: 'Make Deal', path: '/make-deal' },
  ];

  return (
    <>
      {/* UPDATED STYLE: 
          - bg-[#050505] (Dark background)
          - border-b border-white/10 (Subtle border)
      */}
      <nav className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 border-b border-white/10 ${scrolled ? 'bg-[#050505]/95 backdrop-blur-md py-4' : 'bg-[#050505] py-6'}`}>
        <div className="container mx-auto px-6 flex justify-between items-center relative">
          
          {/* 1. LOGO (Left) */}
          <Link to="/" className="flex items-center gap-2 z-50">
            <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-dark">
              <span className="font-serif font-bold text-lg">A</span>
            </div>
            <span className="text-2xl font-bold tracking-widest text-white font-sans uppercase">AURA</span>
          </Link>

          {/* 2. CENTER LINKS (Absolute Center) */}
          <div className="hidden md:flex absolute left-1/2 -translate-x-1/2 gap-8">
            {navLinks.map((link) => (
              <Link 
                key={link.name} 
                to={link.path} 
                className={`text-xs font-bold tracking-[2px] transition-colors uppercase ${isActive(link.path) ? 'text-primary' : 'text-gray-400 hover:text-white'}`}
              >
                {link.name}
              </Link>
            ))}
          </div>

          {/* 3. ICONS & ADMIN CONTROLS (Right) */}
          <div className="flex items-center gap-6 z-50">
            
            {/* ADMIN BADGE & SOUND */}
            {isAdmin && (
               <div className="flex items-center gap-4">
                 <Link to="/admin" className="relative text-xs font-bold tracking-[2px] text-red-500 hover:text-white uppercase hidden md:block">
                   ADMIN
                   {pendingCount > 0 && (
                     <span className="absolute -top-3 -right-4 w-5 h-5 bg-red-600 text-white text-[10px] flex items-center justify-center rounded-full animate-pulse border border-dark">
                       {pendingCount}
                     </span>
                   )}
                 </Link>
                 <button onClick={enableAudio} title="Enable Sound" className="text-gray-400 hover:text-primary"><FiBell /></button>
               </div>
            )}

            {/* STATUS LINK */}
            {!isAdmin && user && (
              <Link to="/delivery" className={`hidden md:block text-xs font-bold tracking-[2px] transition-colors uppercase ${isActive('/delivery') ? 'text-primary' : 'text-gray-400 hover:text-white'}`}>STATUS</Link>
            )}

            {/* USER ICON */}
            {user ? (
              <div onClick={logout} className="cursor-pointer relative group">
                 {user.photoURL ? (
                   <img src={user.photoURL} className="w-8 h-8 rounded-full border border-gray-600 object-cover" />
                 ) : (
                   <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-primary hover:text-black transition-all">
                      <FiUser size={18} />
                   </div>
                 )}
              </div>
            ) : (
              <Link to="/login" className="text-xs font-bold text-white uppercase hover:text-primary">Login</Link>
            )}

            {/* CART ICON */}
            <Link to="/cart" className="relative text-gray-400 hover:text-white transition-colors">
              <FiShoppingBag size={22} />
              <span className="absolute -top-2 -right-2 w-4 h-4 bg-primary text-dark text-[10px] font-bold flex items-center justify-center rounded-full">
                {cart.reduce((acc, item) => acc + item.qty, 0)}
              </span>
            </Link>

            {/* MOBILE TOGGLE */}
            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)} 
              className="md:hidden text-white text-2xl"
            >
              {mobileMenuOpen ? <FiX /> : <FiMenu />}
            </button>
          </div>
        </div>

        {/* MOBILE MENU DROPDOWN */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div 
              initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
              className="absolute top-0 left-0 w-full h-screen bg-[#050505] flex flex-col justify-center items-center gap-8 z-40"
            >
              {navLinks.map(link => (
                <Link key={link.name} to={link.path} onClick={() => setMobileMenuOpen(false)} className="text-2xl font-bold tracking-widest text-white hover:text-primary uppercase">
                  {link.name}
                </Link>
              ))}
              {isAdmin && <Link to="/admin" onClick={() => setMobileMenuOpen(false)} className="text-2xl font-bold text-red-500 uppercase">ADMIN PANEL ({pendingCount})</Link>}
              {!isAdmin && user && <Link to="/delivery" onClick={() => setMobileMenuOpen(false)} className="text-2xl font-bold text-primary uppercase">ORDER STATUS</Link>}
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
    </>
  );
}