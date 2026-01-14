import { motion } from 'framer-motion';
import { FiPlus } from 'react-icons/fi';

export default function MenuSection({ title, products, onProductClick }) {
  if (!products || products.length === 0) return null;

  // Duplicate items 4 times to create a long seamless loop
  const loopProducts = [...products, ...products, ...products, ...products];

  return (
    <div className="mb-12 relative z-10 overflow-hidden">
      {/* Category Title */}
      <div className="container mx-auto px-4 mb-6">
        <h2 className="text-2xl md:text-3xl font-serif font-bold text-white pl-4 border-l-4 border-primary uppercase tracking-widest">
          {title}
        </h2>
      </div>

      {/* INFINITE SCROLL TRACKER */}
      <div className="w-full overflow-hidden">
        {/* The 'animate-scroll' class from index.css makes this move smoothly */}
        <div className="animate-scroll flex gap-5 px-4">
          {loopProducts.map((product, index) => (
            <div 
              key={`${product.id}-${index}`}
              onClick={() => onProductClick(product)}
              className="w-[180px] md:w-[280px] shrink-0 cursor-pointer group"
            >
              {/* Card */}
              <div className="bg-[#1a1a1a] rounded-xl p-3 border border-white/10 group-hover:border-primary transition-colors h-full flex flex-col relative">
                
                {/* Image Box */}
                <div className="aspect-square bg-black rounded-lg mb-3 overflow-hidden relative">
                   <img 
                     src={product.image} 
                     className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
                     alt={product.name}
                   />
                   
                   {/* Emoji Tags (Fire/Star/Delicious) */}
                   {product.tag && product.tag !== 'None' && (
                     <div className="absolute top-2 right-2 bg-black/80 backdrop-blur-md text-[10px] px-2 py-1 rounded border border-white/20">
                       {product.tag}
                     </div>
                   )}
                </div>

                {/* Info */}
                <div>
                   <h3 className="text-white font-bold text-sm md:text-lg truncate">{product.name}</h3>
                   <div className="flex justify-between items-center mt-2">
                      <span className="text-primary font-bold">Rs.{product.basePrice}</span>
                      <div className="bg-white/10 p-1.5 rounded-full group-hover:bg-primary group-hover:text-black transition-colors">
                        <FiPlus />
                      </div>
                   </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}