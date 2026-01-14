import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiMinus, FiPlus, FiShoppingCart } from 'react-icons/fi';
import { useCart } from '../../context/CartContext';
import { toast } from 'react-hot-toast';

export default function ProductModal({ product, isOpen, onClose }) {
  const { addToCart } = useCart();
  const [qty, setQty] = useState(1);
  const [selectedSize, setSelectedSize] = useState(null);
  const [selectedExtras, setSelectedExtras] = useState([]);

  // Reset state when product opens
  useEffect(() => {
    if (product) {
      setQty(1);
      setSelectedExtras([]);
      // Select first size by default if available
      if (product.sizes && product.sizes.length > 0) {
        setSelectedSize(product.sizes[0]);
      } else {
        setSelectedSize(null);
      }
    }
  }, [product]);

  if (!isOpen || !product) return null;

  // --- PRICE CALCULATION LOGIC ---
  const basePrice = selectedSize ? selectedSize.price : product.basePrice;
  const extrasTotal = selectedExtras.reduce((acc, extra) => acc + extra.price, 0);
  const finalPrice = (basePrice + extrasTotal) * qty;

  const handleExtraToggle = (extra) => {
    if (selectedExtras.find(e => e.name === extra.name)) {
      setSelectedExtras(selectedExtras.filter(e => e.name !== extra.name));
    } else {
      setSelectedExtras([...selectedExtras, extra]);
    }
  };

  const handleAddToCart = () => {
    addToCart({
      id: product.id + (selectedSize?.name || '') + Date.now(), // Unique ID for cart
      originalId: product.id,
      name: product.name,
      price: finalPrice / qty, // Unit price for cart logic
      qty: qty,
      image: product.image,
      selectedSize: selectedSize?.name || null,
      selectedExtras: selectedExtras.map(e => e.name)
    });
    toast.success("Added to Cart!");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />

      {/* Modal Content */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-[#1a1a1a] w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-2xl relative z-10 flex flex-col md:flex-row shadow-2xl border border-white/10"
      >
        <button onClick={onClose} className="absolute top-4 right-4 text-white z-20 bg-black/50 p-2 rounded-full hover:bg-white hover:text-black transition-colors"><FiX size={24}/></button>

        {/* Left: Image */}
        <div className="w-full md:w-1/2 h-64 md:h-auto bg-black flex items-center justify-center p-6">
          <img src={product.image} className="max-w-full max-h-full object-contain drop-shadow-2xl" />
        </div>

        {/* Right: Details */}
        <div className="w-full md:w-1/2 p-6 md:p-10 flex flex-col">
          <h2 className="text-3xl font-serif font-bold text-white mb-2">{product.name}</h2>
          <p className="text-gray-400 text-sm mb-6">{product.description || "Freshly prepared with premium ingredients."}</p>

          {/* SIZE SELECTOR */}
          {product.sizes && product.sizes.length > 0 && (
            <div className="mb-6">
              <h4 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">Select Size</h4>
              <div className="flex flex-wrap gap-3">
                {product.sizes.map((size) => (
                  <button
                    key={size.name}
                    onClick={() => setSelectedSize(size)}
                    className={`px-4 py-2 rounded-lg border text-sm font-bold transition-all ${
                      selectedSize?.name === size.name 
                      ? 'bg-primary text-black border-primary' 
                      : 'bg-transparent border-white/20 text-gray-300 hover:border-white'
                    }`}
                  >
                    {size.name} <span className="opacity-60 text-xs ml-1">Rs.{size.price}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* EXTRAS SELECTOR */}
          {product.extras && product.extras.length > 0 && (
            <div className="mb-6">
              <h4 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">Optional Extras</h4>
              <div className="flex flex-col gap-2">
                {product.extras.map((extra) => (
                  <div 
                    key={extra.name}
                    onClick={() => handleExtraToggle(extra)}
                    className={`flex justify-between items-center p-3 rounded cursor-pointer border transition-all ${
                      selectedExtras.find(e => e.name === extra.name)
                      ? 'bg-white/10 border-primary' 
                      : 'bg-transparent border-white/10 hover:bg-white/5'
                    }`}
                  >
                    <span className="text-sm">{extra.name}</span>
                    <span className="text-xs text-primary">+ Rs.{extra.price}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* FOOTER ACTIONS */}
          <div className="mt-auto pt-6 border-t border-white/10">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-4 bg-white/5 rounded-full px-4 py-2">
                <button onClick={() => setQty(Math.max(1, qty-1))}><FiMinus/></button>
                <span className="font-bold w-4 text-center">{qty}</span>
                <button onClick={() => setQty(qty+1)}><FiPlus/></button>
              </div>
              <div className="text-2xl font-bold text-white">
                Rs. {finalPrice}
              </div>
            </div>
            
            <button onClick={handleAddToCart} className="w-full bg-primary text-black font-bold py-4 rounded-xl hover:scale-[1.02] transition-transform flex items-center justify-center gap-2">
              <FiShoppingCart /> ADD TO BUCKET
            </button>
          </div>

        </div>
      </motion.div>
    </div>
  );
}