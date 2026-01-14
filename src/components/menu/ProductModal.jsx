import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiX, FiMinus, FiPlus, FiShoppingCart, FiCheck } from 'react-icons/fi';
import { useCart } from '../../context/CartContext';
import { toast } from 'react-hot-toast';

export default function ProductModal({ product, isOpen, onClose }) {
  const { addToCart } = useCart();
  const [qty, setQty] = useState(1);
  const [selectedSize, setSelectedSize] = useState(null);
  const [selectedExtras, setSelectedExtras] = useState([]);

  useEffect(() => {
    if (product) {
      setQty(1);
      setSelectedExtras([]);
      // Auto-select first size if available (e.g., Regular Pizza or Pepsi)
      if (product.sizes && product.sizes.length > 0) {
        setSelectedSize(product.sizes[0]);
      } else {
        setSelectedSize(null);
      }
    }
  }, [product]);

  if (!isOpen || !product) return null;

  // Calculation
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
      id: product.id + (selectedSize?.name || '') + Date.now(),
      name: product.name,
      price: finalPrice / qty,
      qty: qty,
      image: product.image,
      selectedSize: selectedSize?.name || null,
      selectedExtras: selectedExtras.map(e => e.name)
    });
    toast.success(`${product.name} Added!`);
    onClose();
  };

  // Dynamic Labels
  const isPizza = product.category === 'Pizza';
  const isDrink = product.category === 'Beverages';
  const sizeLabel = isDrink ? "Select Option" : "Select Size";

  return (
    <div className="fixed inset-0 z-[100] flex items-end md:items-center justify-center p-0 md:p-4">
      <div className="absolute inset-0 bg-black/90 backdrop-blur-md" onClick={onClose} />

      <motion.div 
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        className="bg-[#121212] w-full max-w-4xl h-[90vh] md:h-auto md:max-h-[90vh] overflow-y-auto rounded-t-3xl md:rounded-2xl relative z-10 flex flex-col md:flex-row shadow-2xl border border-white/10"
      >
        <button onClick={onClose} className="absolute top-4 right-4 z-50 bg-black/50 p-2 rounded-full text-white hover:bg-white hover:text-black transition-colors"><FiX size={24}/></button>

        {/* IMAGE SIDE */}
        <div className="w-full md:w-5/12 h-64 md:h-auto bg-black/50 flex items-center justify-center p-6 relative overflow-hidden">
          <div className="absolute inset-0 bg-radial-gradient from-primary/20 to-transparent opacity-50" />
          <img src={product.image} className="max-w-[80%] max-h-[80%] object-contain drop-shadow-2xl z-10" />
        </div>

        {/* DETAILS SIDE */}
        <div className="w-full md:w-7/12 p-6 md:p-8 flex flex-col">
          <h2 className="text-3xl font-serif font-bold text-white leading-none mb-2">{product.name}</h2>
          <p className="text-gray-400 text-sm mb-6 leading-relaxed">{product.description || "Premium ingredients, freshly prepared."}</p>

          {/* DYNAMIC SIZES / OPTIONS */}
          {product.sizes && product.sizes.length > 0 && (
            <div className="mb-6">
              <h4 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">{sizeLabel}</h4>
              <div className="flex flex-wrap gap-2">
                {product.sizes.map((size) => (
                  <button
                    key={size.name}
                    onClick={() => setSelectedSize(size)}
                    className={`px-4 py-3 rounded-xl border text-sm font-bold flex flex-col items-center min-w-[80px] transition-all ${
                      selectedSize?.name === size.name 
                      ? 'bg-primary text-black border-primary' 
                      : 'bg-white/5 border-white/10 text-gray-300 hover:border-white/30'
                    }`}
                  >
                    <span>{size.name}</span>
                    <span className="text-[10px] opacity-70">Rs.{size.price}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* DYNAMIC EXTRAS */}
          {product.extras && product.extras.length > 0 && (
            <div className="mb-6">
              <h4 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">Add Extras</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {product.extras.map((extra) => (
                  <div 
                    key={extra.name}
                    onClick={() => handleExtraToggle(extra)}
                    className={`flex justify-between items-center p-3 rounded-lg cursor-pointer border transition-all ${
                      selectedExtras.find(e => e.name === extra.name)
                      ? 'bg-primary/10 border-primary text-white' 
                      : 'bg-white/5 border-white/5 hover:bg-white/10'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                       {selectedExtras.find(e => e.name === extra.name) && <FiCheck className="text-primary"/>}
                       <span className="text-sm">{extra.name}</span>
                    </div>
                    <span className="text-xs text-primary">+ Rs.{extra.price}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* FOOTER */}
          <div className="mt-auto pt-4 border-t border-white/10">
            <div className="flex items-center justify-between gap-4">
              {/* Qty */}
              <div className="flex items-center bg-white/5 rounded-full border border-white/10">
                <button className="w-10 h-10 flex items-center justify-center hover:text-primary" onClick={() => setQty(Math.max(1, qty-1))}><FiMinus/></button>
                <span className="font-bold w-6 text-center">{qty}</span>
                <button className="w-10 h-10 flex items-center justify-center hover:text-primary" onClick={() => setQty(qty+1)}><FiPlus/></button>
              </div>
              
              {/* Add Button */}
              <button 
                onClick={handleAddToCart} 
                className="flex-1 bg-primary text-black font-bold h-12 rounded-full hover:scale-[1.02] transition-transform flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(255,215,0,0.3)]"
              >
                <span>Add for Rs. {finalPrice}</span>
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}