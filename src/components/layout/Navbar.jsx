import { Link, useLocation } from 'react-router-dom';
import { FiShoppingBag, FiUser } from 'react-icons/fi';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../lib/firebase';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { useState, useEffect, useRef } from 'react';
import { toast } from 'react-hot-toast';

// Notification Sound
const ALERT_SOUND = "https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3";

export default function Navbar() {
  const { cart } = useCart();
  const { user, logout } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);
  const location = useLocation();
  
  const audioRef = useRef(new Audio(ALERT_SOUND));
  const isFirstRun = useRef(true);

  const ADMIN_EMAIL = "tahseenalam345@gmail.com";
  const isAdmin = user?.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // --- ADMIN NOTIFICATION ---
  useEffect(() => {
    if (isAdmin) {
      const q = query(collection(db, "orders"), where("status", "==", "Pending"));
      const unsubscribe = onSnapshot(q, (snapshot) => {
        setPendingCount(snapshot.size);
        snapshot.docChanges().forEach((change) => {
          if (change.type === "added" && !isFirstRun.current) {
            audioRef.current.play().catch(() => {});
            toast("🔥 NEW ORDER!", { icon: '🔔', style: { background: '#FFD700', color: '#000' } });
          }
        });
        isFirstRun.current = false;
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
    <nav 
      className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 border-b border-white/10 ${
        scrolled ? 'bg-[#050505]/95 backdrop-blur-md shadow-lg' : 'bg-[#050505]'
      }`}
    >
      <div className="container mx-auto px-4 md:px-6">
        
        {/* TOP ROW: Logo & Icons */}
        <div className="flex justify-between items-center py-4">
          {/* LOGO */}
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-dark">
              <span className="font-serif font-bold text-lg">A</span>
            </div>
            <span className="text-xl font-bold tracking-widest text-white font-sans uppercase">AURA</span>
          </Link>

          {/* ICONS (Right Side) */}
          <div className="flex items-center gap-4 md:gap-5">
            
            {/* FIXED: Removed 'hidden md:block' so Admin shows on Mobile */}
            {isAdmin && (
               <Link to="/admin" className="relative text-red-500 font-bold text-xs uppercase flex items-center gap-1 border border-red-500/50 px-2 py-1 rounded hover:bg-red-500 hover:text-white transition-colors">
                 ADMIN 
                 {pendingCount > 0 && (
                   <span className="bg-white text-red-600 px-1.5 rounded-full text-[10px] font-extrabold animate-pulse">
                     {pendingCount}
                   </span>
                 )}
               </Link>
            )}

            {!isAdmin && user && (
              <Link to="/delivery" className="text-primary font-bold text-xs uppercase">STATUS</Link>
            )}

            {user ? (
              <div onClick={logout} className="cursor-pointer">
                 {user.photoURL ? <img src={user.photoURL} className="w-7 h-7 rounded-full border border-gray-600" /> : <FiUser className="text-white text-xl" />}
              </div>
            ) : (
              <Link to="/login" className="text-xs font-bold text-white uppercase">Login</Link>
            )}

            <Link to="/cart" className="relative">
              <FiShoppingBag className="text-xl text-white" />
              <span className="absolute -top-2 -right-2 w-4 h-4 bg-primary text-dark text-[10px] font-bold flex items-center justify-center rounded-full">
                {cart.reduce((acc, item) => acc + item.qty, 0)}
              </span>
            </Link>
          </div>
        </div>

        {/* BOTTOM ROW: NAVIGATION (Horizontal Scroll on Mobile) */}
        <div className="w-full overflow-x-auto pb-2 scrollbar-hide">
          <div className="flex gap-6 md:gap-10 md:justify-center min-w-max px-1">
            {navLinks.map((link) => (
              <Link 
                key={link.name} 
                to={link.path} 
                className={`text-xs md:text-sm font-bold tracking-[2px] transition-colors uppercase whitespace-nowrap pb-1 border-b-2 ${
                  isActive(link.path) ? 'text-primary border-primary' : 'text-gray-400 border-transparent hover:text-white'
                }`}
              >
                {link.name}
              </Link>
            ))}
          </div>
        </div>

      </div>
    </nav>
  );
}
