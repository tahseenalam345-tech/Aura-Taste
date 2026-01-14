import { motion } from 'framer-motion';
import { FiPlus } from 'react-icons/fi';

export default function MenuSection({ title, products, onProductClick }) {
  if (!products || products.length === 0) return null;

  // We duplicate products to create a seamless infinite loop
  const displayProducts = [...products, ...products, ...products];

  return (
    <div className="mb-8 relative z-10 overflow-hidden">
      {/* Category Title */}
      <div className="container mx-auto px-4 mb-4">
        <h2 className="text-xl md:text-3xl font-serif font-bold text-white pl-4 border-l-4 border-primary uppercase tracking-widest">
          {title}
        </h2>
      </div>

      {/* INFINITE SCROLL TRACK */}
      <div className="relative w-full overflow-hidden">
        <div className="animate-scroll flex gap-4 px-4">
          {displayProducts.map((product, index) => (
            <div 
              key={`${product.id}-${index}`}
              onClick={() => onProductClick(product)}
              className="w-[180px] md:w-[280px] shrink-0 cursor-pointer group"
            >
              <div className="bg-[#1a1a1a] rounded-xl p-3 border border-white/10 group-hover:border-primary transition-colors h-full flex flex-col relative overflow-hidden">
                
                {/* FIXED IMAGE BOX */}
                <div className="w-full aspect-square bg-black rounded-lg mb-3 overflow-hidden relative">
                   <img 
                     src={product.image} 
                     className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                   />
                </div>

                {/* INFO */}
                <div>
                   <h3 className="text-white font-bold text-sm md:text-lg truncate">{product.name}</h3>
                   <div className="flex justify-between items-center mt-2">
                      <span className="text-primary font-bold">Rs.{product.basePrice}</span>
                      <div className="bg-white/10 p-1 rounded-full"><FiPlus color="white"/></div>
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