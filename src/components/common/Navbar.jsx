import { Link, useLocation } from 'react-router-dom';
import { FiShoppingBag, FiUser } from 'react-icons/fi';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../lib/firebase';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { useState, useEffect } from 'react';

export default function Navbar() {
  const { cart } = useCart();
  const { user, logout } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);
  const location = useLocation();

  const ADMIN_EMAIL = "tahseenalam345@gmail.com";

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // --- REALTIME LISTENER (ROBUST VERSION) ---
  const isAdmin = user?.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase();

  useEffect(() => {
    if (isAdmin) {
      // Listen for Pending Orders
      const q = query(collection(db, "orders"), where("status", "==", "Pending"));
      const unsubscribe = onSnapshot(q, (snapshot) => {
        setPendingCount(snapshot.size);
      });
      return () => unsubscribe();
    }
  }, [user, isAdmin]);

  const isActive = (path) => location.pathname === path;

  return (
    <nav className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${scrolled ? 'bg-dark/80 backdrop-blur-md py-4' : 'bg-transparent py-6'}`}>
      <div className="container mx-auto px-6 flex justify-between items-center">
        
        <Link to="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-dark">
            <span className="font-serif font-bold text-lg">A</span>
          </div>
          <span className="text-2xl font-bold tracking-widest text-white font-sans uppercase">AURA</span>
        </Link>

        <div className="hidden md:flex items-center gap-8">
          <Link to="/" className={`text-xs font-bold tracking-[2px] transition-colors uppercase ${isActive('/') ? 'text-primary' : 'text-gray-400 hover:text-white'}`}>HOME</Link>
          <Link to="/menu" className={`text-xs font-bold tracking-[2px] transition-colors uppercase ${isActive('/menu') ? 'text-primary' : 'text-gray-400 hover:text-white'}`}>MENU</Link>
          <Link to="/deals" className={`text-xs font-bold tracking-[2px] transition-colors uppercase ${isActive('/deals') ? 'text-primary' : 'text-gray-400 hover:text-white'}`}>DEALS</Link>
          
          {/* Show Delivery Status only if NOT admin */}
          {!isAdmin && user && (
            <Link to="/delivery" className={`text-xs font-bold tracking-[2px] transition-colors uppercase ${isActive('/delivery') ? 'text-primary' : 'text-gray-400 hover:text-white'}`}>DELIVERY STATUS</Link>
          )}

          <div className="relative group h-full flex items-center">
            <button className="text-xs font-bold tracking-[2px] text-gray-400 group-hover:text-primary transition-colors uppercase flex items-center gap-1">MORE</button>
            <div className="absolute top-full left-1/2 -translate-x-1/2 pt-6 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300">
              <div className="bg-black/90 backdrop-blur-md border border-white/10 rounded-xl p-4 w-48 shadow-2xl flex flex-col gap-3">
                {['About Aura', 'Locations', 'FAQs', 'Get in Touch'].map(item => (
                  <Link key={item} to="/story" className="text-xs font-bold text-gray-400 hover:text-primary transition-colors uppercase whitespace-nowrap">{item}</Link>
                ))}
              </div>
            </div>
          </div>

          {/* ADMIN TAB */}
          {isAdmin && (
             <Link to="/admin" className={`relative text-xs font-bold tracking-[2px] transition-colors uppercase ${isActive('/admin') ? 'text-primary' : 'text-red-500 hover:text-white'}`}>
               ADMIN
               {pendingCount > 0 && (
                 <span className="absolute -top-3 -right-4 w-4 h-4 bg-red-600 text-white text-[9px] flex items-center justify-center rounded-full animate-pulse shadow-red-500/50 shadow-lg">
                   {pendingCount}
                 </span>
               )}
             </Link>
          )}
        </div>

        <div className="flex items-center gap-6">
          {user ? (
            <div className="flex items-center gap-3 cursor-pointer group" onClick={logout}>
              {/* Green Dot Indicator: Shows if Admin Mode is Active */}
              <div className="relative">
                {user.photoURL ? (
                  <img src={user.photoURL} alt="User" className="w-8 h-8 rounded-full border border-gray-600 group-hover:border-primary" />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center border border-gray-600 group-hover:border-primary">
                    <FiUser className="text-white" />
                  </div>
                )}
                {isAdmin && <span className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 border-2 border-black rounded-full"></span>}
              </div>
            </div>
          ) : (
            <Link to="/login" className="text-xs font-bold tracking-widest text-white hover:text-primary uppercase">Login</Link>
          )}

          <Link to="/cart" className="relative group">
            <FiShoppingBag className="text-xl text-white group-hover:text-primary transition-colors" />
            <span className="absolute -top-2 -right-2 w-4 h-4 bg-primary text-dark text-[10px] font-bold flex items-center justify-center rounded-full">
              {cart.reduce((acc, item) => acc + item.qty, 0)}
            </span>
          </Link>
        </div>
      </div>
    </nav>
  );
}