import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiX, FiMapPin, FiClock, FiTruck, FiCoffee } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import { db } from '../../lib/firebase';
import { collection, addDoc } from 'firebase/firestore';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
// FIX: Default Import for Toast (Prevents import errors)
import toast from 'react-hot-toast';

export default function CheckoutModal({ isOpen, onClose }) {
  const navigate = useNavigate();
  const { cart, clearCart, cartTotal } = useCart(); // clearCart comes from here
  const { user } = useAuth();

  const [step, setStep] = useState(1); 
  const [method, setMethod] = useState(null); 
  const [loading, setLoading] = useState(false);

  const [details, setDetails] = useState({
    branch: '', time: '', table: '', name: '', phone: '', email: '', address: '', instructions: '', saveDetails: false
  });
  const [savedAddresses, setSavedAddresses] = useState([]);
  const branches = ['Kharian GT Road', 'Kharian Guliyana Road', 'Kharian Dinga Road'];

  useEffect(() => {
    if (user) {
      setDetails(prev => ({
        ...prev,
        name: user.displayName || '',
        email: user.email || ''
      }));
    }
    const saved = localStorage.getItem('aura_saved_addresses');
    if (saved) setSavedAddresses(JSON.parse(saved));
  }, [user]);

  const getTimeSlots = () => {
    const slots = [];
    const now = new Date();
    now.setMinutes(now.getMinutes() + 30);
    for (let i = 0; i < 10; i++) { 
      const timeString = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      slots.push(timeString);
      now.setMinutes(now.getMinutes() + 30);
    }
    return slots;
  };

  const handleSavedAddressSelect = (addr) => {
    setDetails({ ...details, ...addr });
    toast.success("Address Loaded!");
  };

  const handlePlaceOrder = async () => {
    setLoading(true);
    try {
      if (method === 'delivery' && details.saveDetails) {
        const newSaved = { name: details.name, phone: details.phone, email: details.email, address: details.address };
        const updated = [...savedAddresses, newSaved];
        setSavedAddresses(updated);
        localStorage.setItem('aura_saved_addresses', JSON.stringify(updated));
      }

      // 1. Prepare Data
      const orderData = {
        userEmail: user?.email || 'Guest',
        userId: user?.uid || 'guest',
        method: method || 'Unknown',
        status: 'Pending',
        createdAt: new Date(),
        totalAmount: Number(cartTotal) || 0,
        items: cart.map(item => ({
          id: item.id || 'unknown',
          name: item.name || 'Unknown Item',
          price: Number(item.price) || 0,
          qty: Number(item.qty) || 1,
          selectedSize: item.selectedSize || null,
          selectedExtras: item.selectedExtras || []
        })),
        customer: {
          name: details.name || 'Anonymous',
          phone: details.phone || 'N/A',
          email: details.email || 'N/A',
          address: method === 'delivery' ? (details.address || 'N/A') : (details.branch || 'Pickup'),
          instructions: details.instructions || ''
        },
        branch: details.branch || null,
        pickupTime: details.time || null,
        tableNumber: details.table || null
      };

      // 2. Send to Firebase
      await addDoc(collection(db, "orders"), orderData);
      
      // 3. Success Actions
      // Safety check: if clearCart is missing, don't crash
      if (typeof clearCart === 'function') {
        clearCart();
      } else {
        console.warn("clearCart is not a function in context");
      }

      toast.success("Order Placed Successfully! 🚀");
      onClose();
      navigate('/delivery'); 

    } catch (error) {
      console.error("ORDER ERROR:", error);
      toast.error("Failed to place order. Check details.");
    } finally {
      setLoading(false);
    }
  };

  const validateStep2 = () => {
    if (method === 'delivery') {
      if (!details.name || !details.phone || !details.address || !details.email) return toast.error("Fill compulsory fields (*)");
    } else {
      if (!details.branch || !details.time) return toast.error("Select Branch & Time");
      if (method === 'dinein' && !details.table) return toast.error("Table Number Required");
    }
    setStep(3);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/90 backdrop-blur-md" onClick={onClose} />
      
      <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-[#121212] w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl relative z-20 border border-white/10 shadow-2xl flex flex-col">
        <div className="p-6 border-b border-white/10 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-white font-serif">{step === 1 ? "Choose Method" : step === 2 ? "Enter Details" : "Confirm Order"}</h2>
          <button onClick={onClose}><FiX className="text-white text-xl hover:text-red-500"/></button>
        </div>

        <div className="p-6 space-y-6">
          {step === 1 && (
            <div className="grid grid-cols-1 gap-4">
              <button onClick={() => { setMethod('delivery'); setStep(2); }} className="flex items-center gap-4 p-4 bg-white/5 border border-white/10 rounded-xl hover:bg-primary hover:text-black transition-all group">
                <div className="w-12 h-12 bg-black rounded-full flex items-center justify-center text-white group-hover:text-primary"><FiTruck size={24}/></div>
                <div><h3 className="font-bold text-lg text-left">Delivery</h3><p className="text-sm text-gray-400 text-left">Doorstep delivery.</p></div>
              </button>
              <button onClick={() => { setMethod('pickup'); setStep(2); }} className="flex items-center gap-4 p-4 bg-white/5 border border-white/10 rounded-xl hover:bg-primary hover:text-black transition-all group">
                <div className="w-12 h-12 bg-black rounded-full flex items-center justify-center text-white group-hover:text-primary"><FiMapPin size={24}/></div>
                <div><h3 className="font-bold text-lg text-left">Pickup</h3><p className="text-sm text-gray-400 text-left">Collect from branch.</p></div>
              </button>
              <button onClick={() => { setMethod('dinein'); setStep(2); }} className="flex items-center gap-4 p-4 bg-white/5 border border-white/10 rounded-xl hover:bg-primary hover:text-black transition-all group">
                <div className="w-12 h-12 bg-black rounded-full flex items-center justify-center text-white group-hover:text-primary"><FiCoffee size={24}/></div>
                <div><h3 className="font-bold text-lg text-left">Dine In</h3><p className="text-sm text-gray-400 text-left">Book a table.</p></div>
              </button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4 animate-fadeIn">
              {method === 'delivery' && savedAddresses.length > 0 && (
                <div className="mb-4 flex gap-2 overflow-x-auto pb-2">
                  {savedAddresses.map((addr, i) => (
                    <button key={i} onClick={() => handleSavedAddressSelect(addr)} className="bg-white/10 px-4 py-2 rounded-lg text-xs hover:bg-white/20 whitespace-nowrap border border-white/5">
                      {addr.name}
                    </button>
                  ))}
                </div>
              )}

              {method === 'delivery' ? (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <input className="bg-black border border-white/10 rounded p-3 text-white" placeholder="Name *" value={details.name} onChange={e => setDetails({...details, name: e.target.value})} />
                    <input className="bg-black border border-white/10 rounded p-3 text-white" placeholder="Phone *" value={details.phone} onChange={e => setDetails({...details, phone: e.target.value})} />
                  </div>
                  <input className="w-full bg-black border border-white/10 rounded p-3 text-white" placeholder="Email *" value={details.email} onChange={e => setDetails({...details, email: e.target.value})} />
                  <textarea className="w-full bg-black border border-white/10 rounded p-3 text-white h-20" placeholder="Full Address *" value={details.address} onChange={e => setDetails({...details, address: e.target.value})} />
                  <input className="w-full bg-black border border-white/10 rounded p-3 text-white" placeholder="Instructions" value={details.instructions} onChange={e => setDetails({...details, instructions: e.target.value})} />
                  <label className="flex items-center gap-2 cursor-pointer mt-2">
                    <input type="checkbox" checked={details.saveDetails} onChange={e => setDetails({...details, saveDetails: e.target.checked})} className="accent-primary w-4 h-4"/>
                    <span className="text-sm text-gray-300">Save details</span>
                  </label>
                </>
              ) : (
                <>
                  <select className="w-full bg-black border border-white/10 rounded p-3 text-white" value={details.branch} onChange={e => setDetails({...details, branch: e.target.value})}>
                    <option value="">-- Choose Branch --</option>
                    {branches.map(b => <option key={b} value={b}>{b}</option>)}
                  </select>
                  <select className="w-full bg-black border border-white/10 rounded p-3 text-white" value={details.time} onChange={e => setDetails({...details, time: e.target.value})}>
                    <option value="">-- Choose Time --</option>
                    {getTimeSlots().map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                  {method === 'dinein' && <input type="number" placeholder="Table Number" className="w-full bg-black border border-white/10 rounded p-3 text-white" value={details.table} onChange={e => setDetails({...details, table: e.target.value})} />}
                  
                  <div className="pt-4 border-t border-white/10 mt-4">
                     <p className="text-xs text-primary mb-2">Contact Info</p>
                     <input placeholder="Name" className="w-full bg-black border border-white/10 rounded p-3 text-white mb-2" value={details.name} onChange={e => setDetails({...details, name: e.target.value})} />
                     <input placeholder="Phone" className="w-full bg-black border border-white/10 rounded p-3 text-white" value={details.phone} onChange={e => setDetails({...details, phone: e.target.value})} />
                  </div>
                </>
              )}
              <div className="flex gap-3 pt-4">
                <button onClick={() => setStep(1)} className="w-1/3 bg-white/10 text-white font-bold py-3 rounded-xl">Back</button>
                <button onClick={validateStep2} className="w-2/3 bg-primary text-black font-bold py-3 rounded-xl hover:bg-yellow-400">Next</button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6 animate-fadeIn">
              <div className="bg-white/5 p-4 rounded-xl space-y-2 text-sm border border-white/10">
                <div className="flex justify-between border-b border-white/10 pb-2"><span className="text-gray-400">Type</span><span className="text-primary font-bold uppercase">{method}</span></div>
                {method === 'delivery' ? <div className="flex justify-between"><span className="text-gray-400">Addr</span><span className="text-right w-1/2">{details.address}</span></div> : <div className="flex justify-between"><span className="text-gray-400">Branch</span><span>{details.branch}</span></div>}
                <div className="flex justify-between pt-2 border-t border-white/10"><span className="text-gray-400">Total</span><span className="text-xl font-bold text-white">Rs. {cartTotal}</span></div>
              </div>
              <div className="flex gap-3">
                <button onClick={() => setStep(2)} className="w-1/3 bg-white/10 text-white font-bold py-3 rounded-xl">Back</button>
                <button onClick={handlePlaceOrder} disabled={loading} className="w-2/3 bg-primary text-black font-bold py-3 rounded-xl hover:bg-yellow-400">{loading ? "..." : "CONFIRM ORDER"}</button>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}