import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiX, FiMinus, FiPlus, FiCheck } from 'react-icons/fi';
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
      if (product.sizes && product.sizes.length > 0) {
        setSelectedSize(product.sizes[0]); // Default to first size
      } else {
        setSelectedSize(null);
      }
    }
  }, [product]);

  if (!isOpen || !product) return null;

  // Pricing Logic
  const basePrice = selectedSize ? selectedSize.price : product.basePrice;
  const extrasTotal = selectedExtras.reduce((acc, e) => acc + e.price, 0);
  const finalPrice = (basePrice + extrasTotal) * qty;

  // Helper for Drinks vs Pizza labels
  const isDrink = product.category === "Beverages";
  const sizeLabel = isDrink ? "Select Flavor" : "Select Size";

  const handleAddToCart = () => {
    addToCart({
      id: product.id + (selectedSize?.name || '') + Date.now(),
      name: product.name,
      price: finalPrice / qty,
      qty,
      image: product.image,
      selectedSize: selectedSize?.name,
      selectedExtras: selectedExtras.map(e => e.name)
    });
    toast.success("Added to Order!");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-end md:items-center justify-center">
      <div className="absolute inset-0 bg-black/90 backdrop-blur-md" onClick={onClose} />
      
      <motion.div 
        initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
        className="bg-[#121212] w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-t-3xl md:rounded-2xl relative z-20 flex flex-col md:flex-row shadow-2xl border border-white/10"
      >
        <button onClick={onClose} className="absolute top-4 right-4 z-50 bg-black/50 p-2 rounded-full text-white"><FiX /></button>

        {/* IMAGE */}
        <div className="w-full md:w-1/2 h-64 md:h-auto bg-black p-6 flex items-center justify-center">
          <img src={product.image} className="w-full h-full object-contain" />
        </div>

        {/* CONTENT */}
        <div className="w-full md:w-1/2 p-6 flex flex-col">
          <h2 className="text-2xl font-bold text-white">{product.name}</h2>
          <p className="text-gray-400 text-xs mb-4">{product.ingredients || product.description}</p>

          {/* SIZES / OPTIONS */}
          {product.sizes && product.sizes.length > 0 && (
            <div className="mb-4">
              <p className="text-xs font-bold text-gray-500 uppercase mb-2">{sizeLabel}</p>
              <div className="flex flex-wrap gap-2">
                {product.sizes.map(size => (
                  <button 
                    key={size.name}
                    onClick={() => setSelectedSize(size)}
                    className={`px-3 py-2 rounded border text-xs font-bold ${selectedSize?.name === size.name ? 'bg-primary text-black border-primary' : 'bg-transparent text-gray-300 border-white/20'}`}
                  >
                    {size.name} <br/> Rs.{size.price}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* EXTRAS */}
          {product.extras && product.extras.length > 0 && (
            <div className="mb-4">
               <p className="text-xs font-bold text-gray-500 uppercase mb-2">Extras</p>
               <div className="flex flex-col gap-2">
                 {product.extras.map(extra => (
                   <div 
                     key={extra.name}
                     onClick={() => {
                       if (selectedExtras.includes(extra)) setSelectedExtras(selectedExtras.filter(e => e !== extra));
                       else setSelectedExtras([...selectedExtras, extra]);
                     }}
                     className={`flex justify-between p-2 rounded border cursor-pointer ${selectedExtras.includes(extra) ? 'border-primary bg-primary/10' : 'border-white/10'}`}
                   >
                     <span className="text-xs text-white">{extra.name}</span>
                     <span className="text-xs text-primary">+Rs.{extra.price}</span>
                   </div>
                 ))}
               </div>
            </div>
          )}

          {/* FOOTER */}
          <div className="mt-auto pt-4 flex gap-4 items-center border-t border-white/10">
             <div className="flex items-center bg-white/10 rounded-full px-2">
               <button onClick={() => setQty(Math.max(1, qty-1))} className="p-2 text-white"><FiMinus/></button>
               <span className="text-white font-bold w-4 text-center">{qty}</span>
               <button onClick={() => setQty(qty+1)} className="p-2 text-white"><FiPlus/></button>
             </div>
             <button onClick={handleAddToCart} className="flex-1 bg-primary text-black font-bold py-3 rounded-full text-sm">
               Add - Rs.{finalPrice}
             </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}