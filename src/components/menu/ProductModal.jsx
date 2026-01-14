import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiX, FiCheck } from 'react-icons/fi';
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
      if (product.sizes && product.sizes.length > 0) setSelectedSize(product.sizes[0]);
      else setSelectedSize(null);
    }
  }, [product]);

  if (!isOpen || !product) return null;

  const basePrice = selectedSize ? selectedSize.price : product.basePrice;
  const extrasTotal = selectedExtras.reduce((acc, e) => acc + e.price, 0);
  const finalPrice = (basePrice + extrasTotal) * qty;

  const handleAddToCart = () => {
    addToCart({
      id: product.id + (selectedSize?.name || '') + Date.now(),
      name: product.name, price: finalPrice / qty, qty, image: product.image,
      selectedSize: selectedSize?.name, selectedExtras: selectedExtras.map(e => e.name)
    });
    toast.success("Added to Bucket!");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/90 backdrop-blur-md" onClick={onClose} />
      
      <motion.div 
        initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
        className="bg-[#121212] w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-xl relative z-20 border border-white/10 shadow-2xl flex flex-col md:flex-row"
      >
        <button onClick={onClose} className="absolute top-4 right-4 z-50 bg-black/50 p-2 rounded-full text-white hover:bg-white hover:text-black"><FiX /></button>

        {/* IMAGE */}
        <div className="w-full md:w-1/2 bg-black flex items-center justify-center p-8 border-r border-white/5">
           <img src={product.image} className="w-full object-contain drop-shadow-2xl" />
        </div>

        {/* DETAILS */}
        <div className="w-full md:w-1/2 p-6 md:p-8 flex flex-col">
          <h2 className="text-3xl font-bold text-white mb-2 font-serif">{product.name}</h2>
          <p className="text-gray-400 text-sm mb-6">{product.description || "Premium ingredients."}</p>

          {/* SIZES (Radio Style) */}
          {product.sizes && product.sizes.length > 0 && (
            <div className="mb-6">
              <h4 className="text-sm font-bold text-white mb-3 uppercase tracking-wider">Choose Size</h4>
              <div className="space-y-3">
                {product.sizes.map(size => (
                  <div 
                    key={size.name}
                    onClick={() => setSelectedSize(size)}
                    className="flex justify-between items-center cursor-pointer group py-1"
                  >
                    <div className="flex items-center gap-3">
                      {/* Radio Circle */}
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${selectedSize?.name === size.name ? 'border-primary' : 'border-gray-600'}`}>
                         {selectedSize?.name === size.name && <div className="w-2.5 h-2.5 rounded-full bg-primary" />}
                      </div>
                      <span className={`text-sm ${selectedSize?.name === size.name ? 'text-white font-bold' : 'text-gray-400'}`}>{size.name}</span>
                    </div>
                    <span className="text-sm font-bold text-white">Rs. {size.price}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* EXTRAS (Checkbox Style) */}
          {product.extras && product.extras.length > 0 && (
            <div className="mb-6">
               <h4 className="text-sm font-bold text-white mb-3 uppercase tracking-wider">Add Ons</h4>
               <div className="space-y-3">
                 {product.extras.map(extra => {
                   const isSelected = selectedExtras.includes(extra);
                   return (
                     <div 
                       key={extra.name}
                       onClick={() => {
                         if (isSelected) setSelectedExtras(selectedExtras.filter(e => e !== extra));
                         else setSelectedExtras([...selectedExtras, extra]);
                       }}
                       className="flex justify-between items-center cursor-pointer group py-1"
                     >
                       <div className="flex items-center gap-3">
                         {/* Checkbox Square */}
                         <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${isSelected ? 'border-primary bg-primary' : 'border-gray-600'}`}>
                            {isSelected && <FiCheck className="text-black text-xs" />}
                         </div>
                         <span className={`text-sm ${isSelected ? 'text-white font-bold' : 'text-gray-400'}`}>{extra.name}</span>
                       </div>
                       <div className="flex items-center gap-4">
                         <span className="text-sm text-gray-400">Rs. {extra.price}</span>
                         {isSelected && <span className="text-primary text-[10px] font-bold border border-primary px-2 rounded-full">ADDED</span>}
                       </div>
                     </div>
                   )
                 })}
               </div>
            </div>
          )}

          {/* FOOTER */}
          <div className="mt-auto pt-6 flex flex-col gap-4 border-t border-white/10">
             <div className="flex justify-between items-center text-xl font-bold text-white">
               <span>Total</span>
               <span className="text-primary">Rs. {finalPrice}</span>
             </div>
             <button onClick={handleAddToCart} className="w-full bg-primary text-black font-bold py-4 rounded-xl hover:scale-[1.02] transition-transform shadow-[0_0_20px_rgba(255,215,0,0.4)]">
               ADD TO BUCKET
             </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}