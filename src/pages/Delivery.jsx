import { useEffect, useState } from 'react';
import { db } from '../lib/firebase';
import { collection, query, where, onSnapshot } from 'firebase/firestore'; // <--- IMPORT onSnapshot
import { useAuth } from '../context/AuthContext';
import { FiCheckCircle, FiBox } from 'react-icons/fi';

const steps = ['Pending', 'Approved', 'Making', 'Finishing', 'Delivering', 'Completed'];

export default function Delivery() {
  const { user } = useAuth();
  const [order, setOrder] = useState(null);
  const [timeLeft, setTimeLeft] = useState(0);

  // --- REAL-TIME LISTENER (Replaces the old fetchLastOrder) ---
  useEffect(() => {
    if (!user) return;

    // 1. Listen for updates instantly
    const q = query(collection(db, "orders"), where("userEmail", "==", user.email));
    
    // This function runs every time the database changes
    const unsubscribe = onSnapshot(q, (snapshot) => {
      if (!snapshot.empty) {
        // 2. Sort to find the newest order manually (Safest way)
        const allOrders = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));
        
        allOrders.sort((a, b) => {
          const dateA = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(0);
          const dateB = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(0);
          return dateB - dateA; // Newest first
        });

        const latestOrder = allOrders[0];
        setOrder(latestOrder);

        // 3. Update Timer Logic
        if (latestOrder.createdAt && latestOrder.status !== 'Completed') {
          const createdTime = latestOrder.createdAt.toDate ? latestOrder.createdAt.toDate().getTime() : Date.now();
          const elapsedSeconds = Math.floor((Date.now() - createdTime) / 1000);
          const remaining = (45 * 60) - elapsedSeconds;
          setTimeLeft(remaining > 0 ? remaining : 0);
        } else {
          setTimeLeft(0);
        }
      }
    });

    // Cleanup listener when leaving page
    return () => unsubscribe();
  }, [user]);

  // Timer Countdown
  useEffect(() => {
    if (timeLeft <= 0) return;
    const timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
    return () => clearInterval(timer);
  }, [timeLeft]);

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  if (!user) return <div className="min-h-screen pt-32 text-center text-white">Please Login to track orders.</div>;
  
  if (!order) return (
    <div className="min-h-screen bg-transparent text-white pt-32 text-center relative z-10">
      <h2 className="text-2xl font-bold mb-2">No Active Orders</h2>
      <p className="text-gray-400">Head to the Menu to place your first order!</p>
    </div>
  );

  const currentStepIndex = steps.indexOf(order.status || 'Pending');

  return (
    <div className="min-h-screen bg-transparent text-white pt-24 px-4 pb-12 relative z-10">
      <div className="container mx-auto max-w-4xl">
        
        {/* Header & Timer */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-12 bg-white/5 p-8 rounded-2xl border border-white/10 backdrop-blur-md">
          <div>
            <h1 className="text-3xl font-serif font-bold mb-2">Order Status</h1>
            <p className="text-gray-400 font-mono text-sm">ORDER ID: #{order.id?.slice(0,8).toUpperCase()}</p>
          </div>
          <div className="text-center mt-6 md:mt-0">
            <div className="text-xs uppercase tracking-[3px] text-gray-400 mb-2">Estimated Arrival</div>
            <div className={`text-6xl font-mono font-bold tracking-tighter ${timeLeft < 300 ? 'text-red-500' : 'text-primary'}`}>
              {order.status === 'Completed' ? "ARRIVED" : formatTime(timeLeft)}
            </div>
            <div className="text-xs text-gray-500 mt-2 uppercase tracking-widest">Minutes Remaining</div>
          </div>
        </div>

        {/* Status Tracker Bar */}
        <div className="mb-12 relative px-4">
          <div className="absolute top-5 left-4 right-4 h-1 bg-white/10 rounded-full z-0"></div>
          <div className="absolute top-5 left-4 h-1 bg-primary rounded-full z-0 transition-all duration-1000 ease-out" style={{ width: `${(currentStepIndex / (steps.length - 1)) * 100}%` }}></div>
          
          <div className="relative z-10 flex justify-between w-full">
            {steps.map((step, index) => (
              <div key={step} className="flex flex-col items-center gap-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-500 ${index <= currentStepIndex ? 'bg-primary border-primary text-black scale-110 shadow-[0_0_20px_rgba(255,215,0,0.5)]' : 'bg-dark border-white/20 text-gray-500'}`}>
                  {index < currentStepIndex ? <FiCheckCircle size={20} /> : <FiBox size={18} />}
                </div>
                <span className={`text-[10px] font-bold uppercase tracking-widest transition-colors duration-300 ${index <= currentStepIndex ? 'text-white' : 'text-gray-600'}`}>{step}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Order Receipt */}
        <div className="bg-white/5 rounded-xl border border-white/10 p-8 max-w-2xl mx-auto">
          <h3 className="text-xl font-serif font-bold mb-6 border-b border-white/10 pb-4 text-center">Receipt</h3>
          <div className="space-y-4">
            {order.items?.map((item, idx) => (
              <div key={idx} className="flex justify-between items-center text-gray-300 text-sm">
                <div className="flex items-center gap-3">
                  <span className="bg-white/10 w-6 h-6 flex items-center justify-center rounded text-xs font-bold text-primary">{item.qty}</span>
                  <span>{item.name}</span>
                </div>
                <span className="font-mono">${(item.price * item.qty).toFixed(2)}</span>
              </div>
            ))}
          </div>
          <div className="flex justify-between items-center pt-6 mt-6 border-t border-white/10">
            <span className="text-gray-400 uppercase tracking-widest text-xs">Total Amount</span>
            <span className="text-3xl font-serif font-bold text-primary">${order.totalAmount?.toFixed(2)}</span>
          </div>
        </div>

      </div>
    </div>
  );
}