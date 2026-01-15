import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiMapPin, FiClock, FiUser, FiTruck, FiCoffee } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import { db } from '../../lib/firebase';
import { collection, addDoc } from 'firebase/firestore';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-hot-toast';

export default function CheckoutModal({ isOpen, onClose }) {
  const navigate = useNavigate();
  const { cart, clearCart, cartTotal } = useCart();
  const { user } = useAuth();

  // --- STATE MANAGEMENT ---
  const [step, setStep] = useState(1); // 1: Method, 2: Details, 3: Summary
  const [method, setMethod] = useState(null); // 'pickup', 'delivery', 'dinein'
  const [loading, setLoading] = useState(false);

  // Form Data
  const [details, setDetails] = useState({
    branch: '',
    time: '',
    table: '',
    name: user?.displayName || '',
    phone: '',
    email: user?.email || '',
    address: '',
    instructions: '',
    saveDetails: false
  });

  // Saved Addresses (From LocalStorage)
  const [savedAddresses, setSavedAddresses] = useState([]);

  // Constants
  const branches = ['Kharian GT Road', 'Kharian Guliyana Road', 'Kharian Dinga Road'];
  
  // --- LOAD SAVED DATA ---
  useEffect(() => {
    const saved = localStorage.getItem('aura_saved_addresses');
    if (saved) setSavedAddresses(JSON.parse(saved));
  }, []);

  // --- GENERATE TIME SLOTS (Next 5 Hours) ---
  const getTimeSlots = () => {
    const slots = [];
    const now = new Date();
    // Start 30 mins from now
    now.setMinutes(now.getMinutes() + 30);
    
    for (let i = 0; i < 10; i++) { // 10 slots = 5 hours (30min intervals)
      const timeString = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      slots.push(timeString);
      now.setMinutes(now.getMinutes() + 30);
    }
    return slots;
  };

  // --- HANDLERS ---
  const handleSavedAddressSelect = (addr) => {
    setDetails({ ...details, ...addr });
    toast.success("Address Loaded!");
  };

  const handlePlaceOrder = async () => {
    setLoading(true);
    try {
      // 1. Save Address if requested
      if (method === 'delivery' && details.saveDetails) {
        const newSaved = { 
          name: details.name, phone: details.phone, 
          email: details.email, address: details.address 
        };
        const updated = [...savedAddresses, newSaved];
        setSavedAddresses(updated);
        localStorage.setItem('aura_saved_addresses', JSON.stringify(updated));
      }

      // 2. Create Order in Firebase
      const orderData = {
        userEmail: user?.email || 'guest',
        method: method,
        status: 'Pending',
        createdAt: new Date(),
        totalAmount: cartTotal,
        items: cart,
        customer: {
          name: details.name,
          phone: details.phone,
          email: details.email,
          address: method === 'delivery' ? details.address : details.branch, // Branch acts as address for pickup
          instructions: details.instructions
        },
        // Specific Details
        branch: details.branch || null,
        pickupTime: details.time || null,
        tableNumber: details.table || null
      };

      await addDoc(collection(db, "orders"), orderData);
      
      // 3. Cleanup & Redirect
      clearCart();
      toast.success("Order Placed Successfully! 🚀");
      onClose();
      navigate('/delivery'); // Redirect to Status Page

    } catch (error) {
      console.error(error);
      toast.error("Failed to place order. Try again.");
    } finally {
      setLoading(false);
    }
  };

  // Validate Step 2
  const validateStep2 = () => {
    if (method === 'delivery') {
      if (!details.name || !details.phone || !details.address || !details.email) return toast.error("Please fill all compulsory fields");
    } else {
      if (!details.branch || !details.time) return toast.error("Please select Branch & Time");
      if (method === 'dinein' && !details.table) return toast.error("Table Number Required");
    }
    setStep(3);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/90 backdrop-blur-md" onClick={onClose} />
      
      <motion.div 
        initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
        className="bg-[#121212] w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl relative z-20 border border-white/10 shadow-2xl flex flex-col"
      >
        {/* HEADER */}
        <div className="p-6 border-b border-white/10 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-white font-serif">
            {step === 1 && "Choose Method"}
            {step === 2 && "Enter Details"}
            {step === 3 && "Confirm Order"}
          </h2>
          <button onClick={onClose}><FiX className="text-white text-xl hover:text-red-500"/></button>
        </div>

        {/* BODY */}
        <div className="p-6 space-y-6">
          
          {/* === STEP 1: SELECT METHOD === */}
          {step === 1 && (
            <div className="grid grid-cols-1 gap-4">
              <button onClick={() => { setMethod('delivery'); setStep(2); }} className="flex items-center gap-4 p-4 bg-white/5 border border-white/10 rounded-xl hover:bg-primary hover:text-black transition-all group">
                <div className="w-12 h-12 bg-black rounded-full flex items-center justify-center text-white group-hover:text-primary"><FiTruck size={24}/></div>
                <div className="text-left">
                  <h3 className="font-bold text-lg">Delivery</h3>
                  <p className="text-sm text-gray-400 group-hover:text-black/70">We bring Aura to your doorstep.</p>
                </div>
              </button>

              <button onClick={() => { setMethod('pickup'); setStep(2); }} className="flex items-center gap-4 p-4 bg-white/5 border border-white/10 rounded-xl hover:bg-primary hover:text-black transition-all group">
                <div className="w-12 h-12 bg-black rounded-full flex items-center justify-center text-white group-hover:text-primary"><FiMapPin size={24}/></div>
                <div className="text-left">
                  <h3 className="font-bold text-lg">Pickup / Takeaway</h3>
                  <p className="text-sm text-gray-400 group-hover:text-black/70">Collect from your nearest branch.</p>
                </div>
              </button>

              <button onClick={() => { setMethod('dinein'); setStep(2); }} className="flex items-center gap-4 p-4 bg-white/5 border border-white/10 rounded-xl hover:bg-primary hover:text-black transition-all group">
                <div className="w-12 h-12 bg-black rounded-full flex items-center justify-center text-white group-hover:text-primary"><FiCoffee size={24}/></div>
                <div className="text-left">
                  <h3 className="font-bold text-lg">Dine In</h3>
                  <p className="text-sm text-gray-400 group-hover:text-black/70">Book a table & pre-order.</p>
                </div>
              </button>
            </div>
          )}

          {/* === STEP 2: FILL DETAILS === */}
          {step === 2 && (
            <div className="space-y-4 animate-fadeIn">
              
              {/* SAVED ADDRESS SELECTOR (Only for Delivery) */}
              {method === 'delivery' && savedAddresses.length > 0 && (
                <div className="mb-6">
                  <label className="text-xs text-primary font-bold uppercase mb-2 block">Quick Load Saved Info</label>
                  <div className="flex gap-2 overflow-x-auto pb-2">
                    {savedAddresses.map((addr, i) => (
                      <button key={i} onClick={() => handleSavedAddressSelect(addr)} className="bg-white/10 px-4 py-2 rounded-lg text-xs hover:bg-white/20 whitespace-nowrap border border-white/5">
                        {addr.name} - {addr.address.slice(0, 15)}...
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* DYNAMIC FIELDS */}
              {method === 'delivery' ? (
                // DELIVERY FORM
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div><label className="text-xs text-gray-500 block mb-1">Full Name *</label><input className="w-full bg-black border border-white/10 rounded p-3 text-white" value={details.name} onChange={e => setDetails({...details, name: e.target.value})} /></div>
                    <div><label className="text-xs text-gray-500 block mb-1">Phone *</label><input className="w-full bg-black border border-white/10 rounded p-3 text-white" value={details.phone} onChange={e => setDetails({...details, phone: e.target.value})} /></div>
                  </div>
                  <div><label className="text-xs text-gray-500 block mb-1">Email *</label><input className="w-full bg-black border border-white/10 rounded p-3 text-white" value={details.email} onChange={e => setDetails({...details, email: e.target.value})} /></div>
                  <div><label className="text-xs text-gray-500 block mb-1">Full Address *</label><textarea className="w-full bg-black border border-white/10 rounded p-3 text-white h-20" value={details.address} onChange={e => setDetails({...details, address: e.target.value})} /></div>
                  <div><label className="text-xs text-gray-500 block mb-1">Instructions (Optional)</label><input className="w-full bg-black border border-white/10 rounded p-3 text-white" value={details.instructions} onChange={e => setDetails({...details, instructions: e.target.value})} /></div>
                  
                  <label className="flex items-center gap-2 cursor-pointer mt-2">
                    <input type="checkbox" checked={details.saveDetails} onChange={e => setDetails({...details, saveDetails: e.target.checked})} className="accent-primary w-4 h-4"/>
                    <span className="text-sm text-gray-300">Save these details for next time</span>
                  </label>
                </>
              ) : (
                // PICKUP / DINE-IN FORM
                <>
                  <div>
                    <label className="text-xs text-gray-500 block mb-1">Select Branch *</label>
                    <select className="w-full bg-black border border-white/10 rounded p-3 text-white" value={details.branch} onChange={e => setDetails({...details, branch: e.target.value})}>
                      <option value="">-- Choose Branch --</option>
                      {branches.map(b => <option key={b} value={b}>{b}</option>)}
                    </select>
                  </div>

                  <div>
                    <label className="text-xs text-gray-500 block mb-1">Select Time *</label>
                    <select className="w-full bg-black border border-white/10 rounded p-3 text-white" value={details.time} onChange={e => setDetails({...details, time: e.target.value})}>
                      <option value="">-- Choose Time --</option>
                      {getTimeSlots().map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>

                  {method === 'dinein' && (
                    <div><label className="text-xs text-gray-500 block mb-1">Table Number *</label><input type="number" className="w-full bg-black border border-white/10 rounded p-3 text-white" value={details.table} onChange={e => setDetails({...details, table: e.target.value})} /></div>
                  )}
                  
                  {/* Basic Contact for Pickup/DineIn too */}
                  <div className="pt-4 border-t border-white/10 mt-4">
                    <p className="text-xs text-primary mb-2">Contact Info</p>
                    <input placeholder="Name" className="w-full bg-black border border-white/10 rounded p-3 text-white mb-2" value={details.name} onChange={e => setDetails({...details, name: e.target.value})} />
                    <input placeholder="Phone" className="w-full bg-black border border-white/10 rounded p-3 text-white" value={details.phone} onChange={e => setDetails({...details, phone: e.target.value})} />
                  </div>
                </>
              )}

              <div className="flex gap-3 pt-4">
                <button onClick={() => setStep(1)} className="w-1/3 bg-white/10 text-white font-bold py-3 rounded-xl">Back</button>
                <button onClick={validateStep2} className="w-2/3 bg-primary text-black font-bold py-3 rounded-xl hover:bg-yellow-400">Next Step</button>
              </div>
            </div>
          )}

          {/* === STEP 3: SUMMARY === */}
          {step === 3 && (
            <div className="space-y-6 animate-fadeIn">
              <div className="bg-white/5 p-4 rounded-xl space-y-2 text-sm border border-white/10">
                <div className="flex justify-between border-b border-white/10 pb-2">
                  <span className="text-gray-400">Order Type</span>
                  <span className="text-primary font-bold uppercase">{method}</span>
                </div>
                {method !== 'delivery' && (
                  <>
                    <div className="flex justify-between"><span className="text-gray-400">Branch</span><span>{details.branch}</span></div>
                    <div className="flex justify-between"><span className="text-gray-400">Time</span><span>{details.time}</span></div>
                    {method === 'dinein' && <div className="flex justify-between"><span className="text-gray-400">Table</span><span>{details.table}</span></div>}
                  </>
                )}
                {method === 'delivery' && (
                  <div className="flex justify-between"><span className="text-gray-400">Address</span><span className="text-right w-1/2">{details.address}</span></div>
                )}
                <div className="flex justify-between pt-2 border-t border-white/10">
                  <span className="text-gray-400">Total Amount</span>
                  <span className="text-xl font-bold text-white">Rs. {cartTotal}</span>
                </div>
              </div>

              <div className="flex gap-3">
                <button onClick={() => setStep(2)} className="w-1/3 bg-white/10 text-white font-bold py-3 rounded-xl">Back</button>
                <button onClick={handlePlaceOrder} disabled={loading} className="w-2/3 bg-primary text-black font-bold py-3 rounded-xl hover:bg-yellow-400 flex items-center justify-center gap-2">
                  {loading ? "Processing..." : "CONFIRM ORDER"}
                </button>
              </div>
            </div>
          )}

        </div>
      </motion.div>
    </div>
  );
}