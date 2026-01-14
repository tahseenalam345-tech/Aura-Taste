import { useEffect, useState } from 'react';
import { db } from '../lib/firebase';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { FiPackage, FiClock, FiMapPin, FiCheckCircle, FiX } from 'react-icons/fi';
import OrderTimer from '../components/common/OrderTimer';

export default function Delivery() {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);

  useEffect(() => {
    if (!user) return;
    
    // Fetch orders for this email
    const q = query(collection(db, "orders"), where("userEmail", "==", user.email));
    const unsub = onSnapshot(q, (snapshot) => {
      // Sort in memory to avoid index requirements
      const sorted = snapshot.docs
        .map(d => ({ id: d.id, ...d.data() }))
        .sort((a, b) => b.createdAt - a.createdAt);
      setOrders(sorted);
    });
    return () => unsub();
  }, [user]);

  const statusSteps = ["Pending", "Approved", "In Kitchen", "Finishing", "Delivering", "Completed"];
  
  const getStepStatus = (currentStatus, stepName) => {
    const currentIndex = statusSteps.indexOf(currentStatus);
    const stepIndex = statusSteps.indexOf(stepName);
    if (currentIndex > stepIndex) return 'completed';
    if (currentIndex === stepIndex) return 'active';
    return 'pending';
  };

  return (
    <div className="min-h-screen pt-24 px-4 pb-20 max-w-4xl mx-auto">
      <h1 className="text-4xl font-serif font-bold text-white mb-8 text-center">My <span className="text-primary">Orders</span></h1>

      <div className="grid gap-4">
        {orders.length === 0 && <div className="text-center text-gray-500">No orders placed yet.</div>}

        {orders.map(order => (
          <div 
            key={order.id} 
            onClick={() => setSelectedOrder(order)}
            className="bg-white/5 border border-white/10 p-6 rounded-xl cursor-pointer hover:border-primary transition-colors flex justify-between items-center"
          >
            <div>
              <h3 className="text-lg font-bold text-white">Order #{order.id.slice(-5).toUpperCase()}</h3>
              <p className="text-sm text-gray-400">{order.items?.length} Items • Rs. {order.totalAmount}</p>
            </div>
            <div className={`px-4 py-2 rounded font-bold text-sm ${order.status === 'Completed' ? 'bg-green-500/20 text-green-500' : 'bg-primary/20 text-primary'}`}>
              {order.status}
            </div>
          </div>
        ))}
      </div>

      {/* --- ORDER DETAILS POPUP --- */}
      <AnimatePresence>
        {selectedOrder && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/90 backdrop-blur-sm" onClick={() => setSelectedOrder(null)} />
            
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              className="bg-[#121212] w-full max-w-lg rounded-2xl border border-white/10 relative z-20 overflow-hidden shadow-2xl"
            >
              <div className="p-6">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-white">Order Status</h2>
                    <p className="text-gray-400 text-xs">ID: {selectedOrder.id}</p>
                  </div>
                  <button onClick={() => setSelectedOrder(null)}><FiX className="text-white text-xl"/></button>
                </div>

                {/* 1. TIMER SECTION */}
                <div className="bg-white/5 p-4 rounded-xl mb-6 border border-white/5">
                  <OrderTimer createdAt={selectedOrder.createdAt} />
                </div>

                {/* 2. LIVE STATUS TRACKER */}
                <div className="mb-6 space-y-4">
                  {statusSteps.map((step, i) => {
                    const st = getStepStatus(selectedOrder.status, step);
                    return (
                       <div key={step} className={`flex items-center gap-4 ${st === 'pending' ? 'opacity-30' : 'opacity-100'}`}>
                         <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${st === 'active' ? 'border-primary text-primary animate-pulse' : st === 'completed' ? 'border-green-500 bg-green-500 text-black' : 'border-gray-500'}`}>
                           {st === 'completed' ? <FiCheckCircle /> : i + 1}
                         </div>
                         <span className={`font-bold ${st === 'active' ? 'text-primary' : 'text-white'}`}>{step}</span>
                       </div>
                    )
                  })}
                </div>

                {/* 3. DIGITAL RECEIPT */}
                <div className="border-t border-white/10 pt-4">
                  <h4 className="font-bold text-white mb-2">Receipt</h4>
                  <div className="bg-black p-4 rounded text-sm text-gray-400 font-mono space-y-1">
                    {selectedOrder.items.map((item, idx) => (
                      <div key={idx} className="flex justify-between">
                        <span>{item.qty}x {item.name}</span>
                        <span>{item.price * item.qty}</span>
                      </div>
                    ))}
                    <div className="border-t border-gray-800 mt-2 pt-2 flex justify-between text-white font-bold">
                      <span>TOTAL</span>
                      <span>Rs. {selectedOrder.totalAmount}</span>
                    </div>
                  </div>
                </div>

              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}