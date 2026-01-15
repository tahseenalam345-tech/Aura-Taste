import { useState } from 'react';
import { useCart } from '../context/CartContext';
import { FiTrash2, FiMinus, FiPlus, FiArrowRight } from 'react-icons/fi';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import CheckoutModal from '../components/cart/CheckoutModal'; // Import the new modal

export default function Cart() {
  const { cart, removeFromCart, updateQty, cartTotal } = useCart();
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false); // State for modal

  if (cart.length === 0) {
    return (
      <div className="min-h-screen pt-32 px-4 flex flex-col items-center justify-center text-center">
        <h2 className="text-3xl font-bold text-white mb-4">Your Bucket is Empty</h2>
        <p className="text-gray-400 mb-8">It feels lonely here. Add some burgers?</p>
        <Link to="/menu" className="bg-primary text-black px-8 py-3 rounded-full font-bold hover:bg-white transition-colors">
          BROWSE MENU
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 px-4 pb-20 max-w-6xl mx-auto">
      <h1 className="text-4xl font-serif font-bold text-white mb-8">Your <span className="text-primary">Bucket</span></h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* CART ITEMS */}
        <div className="lg:col-span-2 space-y-4">
          {cart.map((item) => (
            <motion.div 
              layout
              key={item.id} 
              className="bg-white/5 border border-white/10 p-4 rounded-xl flex gap-4 items-center"
            >
              <img src={item.image} className="w-20 h-20 object-cover rounded bg-black" />
              
              <div className="flex-1">
                <h3 className="font-bold text-white text-lg">{item.name}</h3>
                <p className="text-sm text-gray-400">
                  {item.selectedSize && <span className="mr-2">Size: {item.selectedSize}</span>}
                  {item.selectedExtras?.length > 0 && <span>+ {item.selectedExtras.join(', ')}</span>}
                </p>
                <div className="text-primary font-bold mt-1">Rs. {item.price * item.qty}</div>
              </div>

              <div className="flex flex-col items-end gap-3">
                <button onClick={() => removeFromCart(item.id)} className="text-red-500 hover:bg-white/10 p-2 rounded"><FiTrash2/></button>
                <div className="flex items-center bg-black rounded-lg border border-white/20">
                  <button onClick={() => updateQty(item.id, item.qty - 1)} className="px-3 py-1 hover:text-primary"><FiMinus size={12}/></button>
                  <span className="text-sm font-bold w-4 text-center">{item.qty}</span>
                  <button onClick={() => updateQty(item.id, item.qty + 1)} className="px-3 py-1 hover:text-primary"><FiPlus size={12}/></button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* SUMMARY */}
        <div className="lg:col-span-1">
          <div className="bg-[#111] p-6 rounded-2xl border border-white/10 sticky top-24">
            <h3 className="text-xl font-bold text-white mb-6 border-b border-white/10 pb-4">Order Summary</h3>
            
            <div className="space-y-3 text-sm mb-6">
              <div className="flex justify-between text-gray-400">
                <span>Subtotal</span>
                <span>Rs. {cartTotal}</span>
              </div>
              <div className="flex justify-between text-gray-400">
                <span>Tax (0%)</span>
                <span>Rs. 0</span>
              </div>
              <div className="flex justify-between text-xl font-bold text-white pt-4 border-t border-white/10">
                <span>Total</span>
                <span className="text-primary">Rs. {cartTotal}</span>
              </div>
            </div>

            {/* THE BUTTON THAT OPENS THE MODAL */}
            <button 
              onClick={() => setIsCheckoutOpen(true)}
              className="w-full bg-primary text-black font-bold py-4 rounded-xl hover:bg-yellow-400 transition-all flex items-center justify-center gap-2 shadow-lg"
            >
              PROCEED TO CHECKOUT <FiArrowRight />
            </button>
          </div>
        </div>

      </div>

      {/* CHECKOUT MODAL COMPONENT */}
      <CheckoutModal 
        isOpen={isCheckoutOpen} 
        onClose={() => setIsCheckoutOpen(false)} 
      />

    </div>
  );
}