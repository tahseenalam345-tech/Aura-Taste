import { useEffect, useState } from 'react';
import { db } from '../lib/firebase';
import { collection, getDocs } from 'firebase/firestore';
import { useCart } from '../context/CartContext';
import { toast } from 'react-hot-toast';
import { motion } from 'framer-motion';

export default function MakeYourDeal() {
  const [products, setProducts] = useState([]);
  const [selectedItems, setSelectedItems] = useState([]);
  const { addToCart } = useCart();

  useEffect(() => {
    const fetchProducts = async () => {
      const snapshot = await getDocs(collection(db, "products"));
      setProducts(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    };
    fetchProducts();
  }, []);

  const toggleItem = (product) => {
    if (selectedItems.find(i => i.id === product.id)) {
      setSelectedItems(selectedItems.filter(i => i.id !== product.id));
    } else {
      setSelectedItems([...selectedItems, product]);
    }
  };

  const total = selectedItems.reduce((acc, item) => acc + item.price, 0);
  const discountTotal = total * 0.90; // 10% Discount

  const addDealToCart = () => {
    if(selectedItems.length === 0) return;
    const dealItem = {
      id: `custom-deal-${Date.now()}`,
      name: "Custom Mega Deal",
      price: parseFloat(discountTotal.toFixed(2)),
      image: "https://images.unsplash.com/photo-1513104890138-7c749659a591",
      description: `Bundle of ${selectedItems.length} items (10% OFF)`,
      category: 'Deals',
      qty: 1
    };
    addToCart(dealItem);
    toast.success("Mega Deal Added!");
    setSelectedItems([]);
  };

  return (
    <div className="min-h-screen pt-24 px-4 pb-32">
      <div className="container mx-auto max-w-5xl">
        <motion.div 
          animate={{ opacity: [0.5, 1, 0.5] }} 
          transition={{ duration: 2, repeat: Infinity }}
          className="text-center mb-10"
        >
          <h1 className="text-3xl md:text-5xl font-bold font-serif text-transparent bg-clip-text bg-gradient-to-r from-primary to-white mb-2">
            MAKE YOUR OWN DEAL
          </h1>
          <p className="text-primary font-bold tracking-[3px] uppercase">Select items & Get 10% OFF instantly</p>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-20">
          {products.map(p => (
            <div 
              key={p.id} 
              onClick={() => toggleItem(p)}
              className={`p-4 rounded-xl border cursor-pointer transition-all ${selectedItems.find(i => i.id === p.id) ? 'bg-primary border-primary text-black scale-105' : 'bg-white/5 border-white/10 text-white hover:border-white'}`}
            >
              <h3 className="font-bold text-sm truncate">{p.name}</h3>
              <p className="text-xs opacity-70">${p.price}</p>
            </div>
          ))}
        </div>

        {/* Floating Bottom Bar */}
        <div className="fixed bottom-0 left-0 w-full bg-black/90 backdrop-blur-md border-t border-white/10 p-4 z-40">
           <div className="container mx-auto flex justify-between items-center">
             <div>
               <p className="text-gray-400 text-xs uppercase tracking-widest">Your Total</p>
               <div className="flex items-end gap-2">
                 <span className="text-3xl font-bold text-white">${discountTotal.toFixed(2)}</span>
                 <span className="text-sm text-gray-500 line-through mb-1">${total.toFixed(2)}</span>
               </div>
             </div>
             <button onClick={addDealToCart} disabled={selectedItems.length === 0} className="bg-primary text-black font-bold px-8 py-3 rounded-full uppercase tracking-widest hover:scale-105 transition-transform disabled:opacity-50">
               ADD TO CART
             </button>
           </div>
        </div>
      </div>
    </div>
  );
}