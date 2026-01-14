import { useRef } from 'react';
import { motion } from 'framer-motion';
import { FiPlus } from 'react-icons/fi';

export default function MenuSection({ title, products, onProductClick }) {
  const scrollRef = useRef(null);

  if (!products || products.length === 0) return null;

  return (
    <div className="mb-12">
      {/* Category Title */}
      <h2 className="text-2xl md:text-3xl font-serif font-bold text-white mb-6 border-l-4 border-primary pl-4 uppercase tracking-widest">
        {title}
      </h2>

      {/* Horizontal Scroll Container */}
      <div 
        ref={scrollRef}
        className="flex overflow-x-auto gap-4 pb-8 snap-x snap-mandatory scrollbar-hide"
        style={{ scrollBehavior: 'smooth' }}
      >
        {products.map((product) => (
          <div 
            key={product.id}
            onClick={() => onProductClick(product)}
            className="snap-start shrink-0 w-[45vw] md:w-[22vw] min-w-[160px] md:min-w-[250px] group cursor-pointer"
          >
            {/* Card UI */}
            <div className="bg-[#111] rounded-2xl p-4 border border-white/5 hover:border-primary transition-all duration-300 relative overflow-hidden h-full flex flex-col">
              
              {/* Image with Zoom Effect */}
              <div className="aspect-square mb-4 overflow-hidden rounded-xl bg-black/50 flex items-center justify-center relative">
                <img 
                  src={product.image} 
                  alt={product.name}
                  className="w-[80%] object-contain transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3" 
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                   <span className="bg-primary text-black text-xs font-bold px-3 py-1 rounded-full">CUSTOMIZE</span>
                </div>
              </div>

              {/* Text */}
              <div className="mt-auto">
                <h3 className="font-bold text-white text-sm md:text-lg leading-tight mb-1 truncate">{product.name}</h3>
                <p className="text-gray-500 text-xs mb-3 line-clamp-2">{product.description}</p>
                
                <div className="flex justify-between items-center">
                  <span className="text-primary font-bold">Rs. {product.basePrice}</span>
                  <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white group-hover:bg-primary group-hover:text-black transition-colors">
                    <FiPlus />
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}