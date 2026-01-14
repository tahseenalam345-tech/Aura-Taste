import { useState } from 'react';
import { motion } from 'framer-motion';
import { FiX } from 'react-icons/fi';

export default function CheckoutModal({ isOpen, onClose, onConfirm }) {
  const [details, setDetails] = useState({ name: '', phone: '', address: '', email: '' });

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if(!details.name || !details.phone || !details.address) return alert("Please fill all details");
    onConfirm(details);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/90 backdrop-blur-md" onClick={onClose} />
      <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="bg-[#111] p-6 rounded-xl w-full max-w-md relative z-10 border border-white/10">
        <h2 className="text-2xl font-bold text-white mb-4">Delivery Details</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input placeholder="Full Name" className="w-full bg-[#222] p-3 rounded text-white border border-white/10" value={details.name} onChange={e => setDetails({...details, name: e.target.value})} required/>
          <input placeholder="Phone Number" className="w-full bg-[#222] p-3 rounded text-white border border-white/10" value={details.phone} onChange={e => setDetails({...details, phone: e.target.value})} required/>
          <input placeholder="Email (Optional)" className="w-full bg-[#222] p-3 rounded text-white border border-white/10" value={details.email} onChange={e => setDetails({...details, email: e.target.value})} />
          <textarea placeholder="Delivery Address" className="w-full bg-[#222] p-3 rounded text-white border border-white/10 h-24" value={details.address} onChange={e => setDetails({...details, address: e.target.value})} required/>
          <button type="submit" className="w-full bg-primary text-black font-bold py-3 rounded-xl hover:bg-yellow-400">PLACE ORDER</button>
        </form>
        <button onClick={onClose} className="absolute top-4 right-4 text-white"><FiX/></button>
      </motion.div>
    </div>
  );
}