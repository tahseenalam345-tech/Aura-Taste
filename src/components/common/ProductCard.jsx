import { useCart } from '../../context/CartContext';
import { toast } from 'react-hot-toast';
import { FiPlus } from 'react-icons/fi';

export default function ProductCard({ product }) {
  const { addToCart } = useCart();

  const handleAdd = () => {
    addToCart(product);
    toast.success(`Added ${product.name}!`);
  };

  return (
    <div className="group relative bg-white/5 border border-white/10 rounded-2xl overflow-hidden hover:border-primary/50 transition-all duration-300 hover:-translate-y-2 flex flex-col h-full">
      
      {/* Image Area - RECTANGLE NOW */}
      <div className="h-48 overflow-hidden relative w-full">
        <img 
          src={product.image} 
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        />
        {/* Category Badge */}
        <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-md text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider border border-white/10">
          {product.category}
        </div>
      </div>

      {/* Content */}
      <div className="p-5 flex flex-col flex-1">
        <h3 className="text-xl font-serif font-bold text-white mb-2">{product.name}</h3>
        <p className="text-gray-400 text-xs mb-4 line-clamp-2 leading-relaxed flex-1">{product.description || "Premium ingredients, unforgettable taste."}</p>
        
        <div className="flex items-center justify-between mt-auto pt-4 border-t border-white/5">
          <span className="text-xl font-bold text-primary">${product.price}</span>
          
          <button 
            onClick={handleAdd}
            className="bg-white text-black w-8 h-8 rounded-full flex items-center justify-center hover:bg-primary transition-colors shadow-lg shadow-white/10"
          >
            <FiPlus size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}