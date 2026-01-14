import { useEffect, useState } from 'react';
import { db } from '../lib/firebase';
import { collection, getDocs } from 'firebase/firestore';
import { useCart } from '../context/CartContext';
import { toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { FiPlus, FiX, FiCheck } from 'react-icons/fi';

export default function MakeYourDeal() {
  const [products, setProducts] = useState([]);
  const [tray, setTray] = useState([]); // Temporary "Deal Box"
  const { addToCart } = useCart();
  const [activeCategory, setActiveCategory] = useState('All');

  useEffect(() => {
    const fetch = async () => {
      const snap = await getDocs(collection(db, "products"));
      // Filter only items with Special Tags (Fire/Star/Delicious) OR all items if you prefer
      setProducts(snap.docs.map(d => ({ id: d.id, ...d.data() })).filter(p => p.tag && p.tag !== 'None')); 
    };
    fetch();
  }, []);

  // Calculate Tray Totals
  const trayTotal = tray.reduce((acc, item) => acc + (parseFloat(item.basePrice) || 0), 0);
  const discountTotal = trayTotal * 0.90; // 10% OFF

  // Add item to local tray
  const addToTray = (product) => {
    setTray([...tray, { ...product, uniqueId: Date.now() }]); // Add unique ID for removal
    toast.success(`Added ${product.name} to Box`);
  };

  // Remove from local tray
  const removeFromTray = (uniqueId) => {
    setTray(tray.filter(i => i.uniqueId !== uniqueId));
  };

  // Finalize Deal -> Send to Global Cart
  const finalizeDeal = () => {
    if (tray.length === 0) return;
    
    const dealItem = {
      id: `deal-${Date.now()}`,
      name: "MY CUSTOM MEGA DEAL",
      price: discountTotal,
      image: tray[0].image, // Use first image as thumbnail
      description: tray.map(i => i.name).join(' + '),
      qty: 1,
      category: 'Deals'
    };

    addToCart(dealItem);
    setTray([]); // Clear tray
    toast.success("MEGA DEAL ADDED TO CART! 🛒");
  };

  // Suggestions Logic
  const hasDrink = tray.some(i => i.category === 'Drinks');
  const hasBurger = tray.some(i => i.category === 'Burger');

  return (
    <div className="min-h-screen pt-24 px-4 pb-40">
      <div className="container mx-auto max-w-6xl">
        
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-4xl md:text-6xl font-serif font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary to-orange-500 mb-2">
            BUILD YOUR BOX
          </h1>
          <p className="text-gray-400">Select your favorites marked with 🔥⭐😋</p>
        </div>

        {/* --- 1. THE ITEMS GRID --- */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          {products.map(p => (
            <div key={p.id} onClick={() => addToTray(p)} className="relative group bg-white/5 border border-white/10 p-4 rounded-xl cursor-pointer hover:border-primary transition-all">
              {/* Flashy Tag */}
              <div className="absolute -top-3 -right-3 bg-red-600 text-white text-xs font-bold px-2 py-1 rounded-full animate-bounce shadow-lg shadow-red-500/50">
                {p.tag}
              </div>
              
              <img src={p.image} className="w-full h-32 object-cover rounded mb-3 bg-black" />
              <h3 className="font-bold text-white text-sm">{p.name}</h3>
              <p className="text-primary font-bold text-xs">Rs. {p.basePrice}</p>
              
              <div className="absolute inset-0 bg-primary/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-xl">
                <FiPlus className="text-white text-3xl font-bold" />
              </div>
            </div>
          ))}
        </div>

        {/* --- 2. THE DEAL BOX (Separate Tray) --- */}
        {tray.length > 0 && (
          <motion.div initial={{ y: 100 }} animate={{ y: 0 }} className="fixed bottom-0 left-0 w-full bg-[#111] border-t-2 border-primary z-50 p-4 shadow-[0_-10px_40px_rgba(0,0,0,0.8)]">
            <div className="container mx-auto max-w-4xl flex flex-col md:flex-row gap-6 items-center">
              
              {/* TRAY ITEMS */}
              <div className="flex-1 w-full overflow-x-auto flex gap-3 p-2">
                {tray.map((item) => (
                  <div key={item.uniqueId} className="relative min-w-[80px] h-[80px] bg-white/10 rounded-lg flex items-center justify-center border border-white/20">
                    <img src={item.image} className="w-10 h-10 object-cover rounded-full" />
                    <button onClick={() => removeFromTray(item.uniqueId)} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 text-xs"><FiX/></button>
                  </div>
                ))}
                
                {/* SUGGESTIONS */}
                {!hasDrink && (
                  <div className="min-w-[120px] h-[80px] border-2 border-dashed border-gray-600 rounded-lg flex flex-col items-center justify-center text-gray-500 text-xs text-center p-2">
                    <span>Add a Drink? 🥤</span>
                  </div>
                )}
                {!hasBurger && (
                  <div className="min-w-[120px] h-[80px] border-2 border-dashed border-gray-600 rounded-lg flex flex-col items-center justify-center text-gray-500 text-xs text-center p-2">
                    <span>Add a Burger? 🍔</span>
                  </div>
                )}
              </div>

              {/* TOTAL & ACTION */}
              <div className="flex flex-col items-end min-w-[200px]">
                <div className="text-right mb-2">
                   <p className="text-xs text-gray-400 line-through">Rs. {trayTotal}</p>
                   <p className="text-2xl font-bold text-primary">Rs. {discountTotal.toFixed(0)}</p>
                </div>
                <button onClick={finalizeDeal} className="bg-primary text-black font-bold px-8 py-3 rounded-full hover:scale-105 transition-transform flex items-center gap-2">
                  FINISH DEAL <FiCheck />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}