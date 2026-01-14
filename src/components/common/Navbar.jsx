import { Link, useLocation } from 'react-router-dom';
import { FiShoppingBag, FiUser, FiMenu, FiX } from 'react-icons/fi';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../lib/firebase';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';

// 🔔 LOUD NOTIFICATION SOUND
const ALERT_SOUND = "https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3";

export default function Navbar() {
  const { cart } = useCart();
  const { user, logout } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const audioRef = useRef(new Audio(ALERT_SOUND));
  const isFirstLoad = useRef(true); // Prevent sound on page refresh
  const location = useLocation();

  const ADMIN_EMAIL = "tahseenalam345@gmail.com";
  const isAdmin = user?.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase();

  // Scroll Effect
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // --- 🔔 REAL-TIME NOTIFICATION SYSTEM ---
  useEffect(() => {
    if (isAdmin) {
      // 1. Ask Browser for Permission to show System Popups
      if (Notification.permission !== "granted") {
        Notification.requestPermission();
      }

      // 2. Listen for Pending Orders
      const q = query(collection(db, "orders"), where("status", "==", "Pending"));
      
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const count = snapshot.size;
        setPendingCount(count);

        // Check if a NEW order came in (by looking at changes)
        snapshot.docChanges().forEach((change) => {
          if (change.type === "added" && !isFirstLoad.current) {
            
            // A. Play Sound
            audioRef.current.play().catch(e => console.log("Click page to enable audio"));
            
            // B. Show Screen Popup
            toast("🔥 NEW ORDER RECEIVED!", {
               icon: '🔔',
               style: { background: '#FFD700', color: '#000', fontWeight: 'bold' },
               duration: 6000
            });

            // C. Show System/Phone Notification (Works if tab is hidden)
            if (Notification.permission === "granted") {
              new Notification("New Order @ Aura Taste", {
                body: "A customer just placed an order! Check Admin Panel.",
                icon: "/pwa-192x192.png"
              });
            }
          }
        });

        // After first run, disable the "First Load" flag so future orders make sound
        isFirstLoad.current = false;
      });

      return () => unsubscribe();
    }
  }, [isAdmin]);

  const isActive = (path) => location.pathname === path;
  const navLinks = [
    { name: 'HOME', path: '/' },
    { name: 'MENU', path: '/menu' },
    { name: 'DEALS', path: '/deals' },
    { name: 'MAKE DEAL', path: '/make-deal' },
  ];

  return (
    <nav className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${scrolled ? 'bg-dark/95 backdrop-blur-md py-4' : 'bg-transparent py-6'}`}>
      <div className="container mx-auto px-6 flex justify-between items-center">
        
        {/* LOGO */}
        <Link to="/" className="flex items-center gap-2 z-50">
          <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-dark">
            <span className="font-serif font-bold text-lg">A</span>
          </div>
          <span className="text-2xl font-bold tracking-widest text-white font-sans uppercase">AURA</span>
        </Link>

        {/* DESKTOP LINKS */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map(link => (
            <Link key={link.name} to={link.path} className={`text-xs font-bold tracking-[2px] transition-colors uppercase ${isActive(link.path) ? 'text-primary' : 'text-gray-400 hover:text-white'}`}>
              {link.name}
            </Link>
          ))}
          
          {isAdmin && (
             <Link to="/admin" className={`relative text-xs font-bold tracking-[2px] transition-colors uppercase ${isActive('/admin') ? 'text-primary' : 'text-red-500 hover:text-white'}`}>
               ADMIN
               {pendingCount > 0 && (
                 <span className="absolute -top-3 -right-4 w-5 h-5 bg-red-600 text-white text-[10px] flex items-center justify-center rounded-full animate-pulse border border-dark shadow-[0_0_10px_#ff0000]">
                   {pendingCount}
                 </span>
               )}
             </Link>
          )}
          
          {!isAdmin && user && (
            <Link to="/delivery" className={`text-xs font-bold tracking-[2px] transition-colors uppercase ${isActive('/delivery') ? 'text-primary' : 'text-gray-400 hover:text-white'}`}>STATUS</Link>
          )}
        </div>

        {/* ICONS */}
        <div className="flex items-center gap-4 z-50">
          {user ? (
            <div onClick={logout} className="cursor-pointer relative group">
               {user.photoURL ? (
                 <img src={user.photoURL} className="w-8 h-8 rounded-full border border-gray-600 group-hover:border-primary object-cover" />
               ) : (
                 <div className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center border border-gray-600 group-hover:border-primary">
                    <FiUser className="text-white text-xl" />
                 </div>
               )}
               {isAdmin && <span className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-black"></span>}
            </div>
          ) : (
            <Link to="/login" className="text-xs font-bold text-white uppercase hover:text-primary">Login</Link>
          )}

          <Link to="/cart" className="relative">
            <FiShoppingBag className="text-xl text-white hover:text-primary transition-colors" />
            <span className="absolute -top-2 -right-2 w-4 h-4 bg-primary text-dark text-[10px] font-bold flex items-center justify-center rounded-full">
              {cart.reduce((acc, item) => acc + item.qty, 0)}
            </span>
          </Link>

          <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden text-white text-2xl">
            {mobileMenuOpen ? <FiX /> : <FiMenu />}
          </button>
        </div>
      </div>

      {/* MOBILE MENU */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
            className="absolute top-full left-0 w-full bg-black/95 backdrop-blur-xl border-t border-white/10 md:hidden flex flex-col p-6 gap-4 shadow-2xl h-screen"
          >
            {navLinks.map(link => (
              <Link key={link.name} to={link.path} onClick={() => setMobileMenuOpen(false)} className="text-lg font-bold tracking-widest text-white hover:text-primary uppercase border-b border-white/10 pb-4">
                {link.name}
              </Link>
            ))}
            {isAdmin && <Link to="/admin" onClick={() => setMobileMenuOpen(false)} className="text-lg font-bold text-red-500 uppercase">ADMIN PANEL ({pendingCount})</Link>}
            {!isAdmin && user && <Link to="/delivery" onClick={() => setMobileMenuOpen(false)} className="text-lg font-bold text-primary uppercase">ORDER STATUS</Link>}
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}