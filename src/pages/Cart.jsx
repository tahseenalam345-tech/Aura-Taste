import { useState } from 'react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { db } from '../lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore'; 
import { motion } from 'framer-motion';
import { FiTrash2, FiMinus, FiPlus, FiArrowRight, FiLoader } from 'react-icons/fi';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';

export default function Cart() {
  const { cart, addToCart, decreaseQuantity, removeFromCart, total, setCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(false);

  // checkout logic
  const handleCheckout = async () => {
    // 1. Check if user is logged in
    if (!user) {
      toast.error("Please login to place an order");
      navigate('/login');
      return;
    }

    setIsProcessing(true);

    try {
      // 2. Create the order object
      const orderData = {
        userId: user.uid,
        userEmail: user.email,
        items: cart,
        totalAmount: total + 2.99, // Including delivery
        status: 'pending', // pending -> cooking -> delivered
        createdAt: serverTimestamp(), // Firebase server time
      };

      // 3. Save to Firestore "orders" collection
      await addDoc(collection(db, "orders"), orderData);

      // 4. Success!
      toast.success("Order Placed Successfully! 🍔");
      setCart([]); // Clear the cart
      navigate('/'); // Go back home (or to an Order History page later)
      
    } catch (error) {
      console.error("Checkout Error:", error);
      toast.error("Something went wrong. Try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-dark text-white pt-24 flex flex-col items-center justify-center">
        <h2 className="text-3xl font-bold mb-4">Your Cart is Empty 🍔</h2>
        <p className="text-gray-400 mb-8">Looks like you haven't added any tasty items yet.</p>
        <Link to="/menu" className="bg-primary text-black px-6 py-3 rounded-full font-bold hover:scale-105 transition-transform">
          Browse Menu
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark text-white pt-24 px-4 pb-12">
      <div className="container mx-auto max-w-5xl">
        <h1 className="text-4xl font-bold mb-8">Your <span className="text-primary">Order</span></h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Cart Items List */}
          <div className="lg:col-span-2 space-y-4">
            {cart.map((item) => (
              <motion.div 
                layout
                key={item.id} 
                className="bg-gray-900 p-4 rounded-xl flex items-center gap-4 border border-gray-800"
              >
                <img src={item.image} alt={item.name} className="w-20 h-20 object-cover rounded-lg" />
                
                <div className="flex-1">
                  <h3 className="font-bold text-lg">{item.name}</h3>
                  <p className="text-primary font-bold">${item.price}</p>
                </div>

                <div className="flex items-center gap-3 bg-dark p-2 rounded-lg">
                  <button onClick={() => decreaseQuantity(item.id)} className="p-1 hover:text-secondary"><FiMinus /></button>
                  <span className="font-bold w-4 text-center">{item.qty}</span>
                  <button onClick={() => addToCart(item)} className="p-1 hover:text-green-500"><FiPlus /></button>
                </div>

                <button 
                  onClick={() => removeFromCart(item.id)} 
                  className="p-3 text-gray-500 hover:text-red-500 hover:bg-red-500/10 rounded-full transition-colors"
                >
                  <FiTrash2 />
                </button>
              </motion.div>
            ))}
          </div>

          {/* Order Summary */}
          <div className="bg-gray-900 p-6 rounded-xl h-fit border border-gray-800 sticky top-24">
            <h3 className="text-xl font-bold mb-6 border-b border-gray-700 pb-4">Order Summary</h3>
            
            <div className="space-y-3 mb-6">
              <div className="flex justify-between text-gray-400">
                <span>Subtotal</span>
                <span>${total.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-gray-400">
                <span>Delivery Fee</span>
                <span>$2.99</span>
              </div>
              <div className="flex justify-between text-xl font-bold text-white pt-4 border-t border-gray-700">
                <span>Total</span>
                <span className="text-primary">${(total + 2.99).toFixed(2)}</span>
              </div>
            </div>

            <button 
              onClick={handleCheckout}
              disabled={isProcessing}
              className="w-full bg-primary text-black font-bold py-4 rounded-xl hover:bg-yellow-500 transition-all flex items-center justify-center gap-2 group disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isProcessing ? (
                <>Processing <FiLoader className="animate-spin" /></>
              ) : (
                <>Proceed to Checkout <FiArrowRight className="group-hover:translate-x-1 transition-transform" /></>
              )}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}