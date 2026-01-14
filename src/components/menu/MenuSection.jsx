import { useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiPlus } from 'react-icons/fi';

export default function MenuSection({ title, products, onProductClick }) {
  const scrollRef = useRef(null);

  // --- AUTO SCROLL LOGIC ---
  useEffect(() => {
    const scrollContainer = scrollRef.current;
    if (!scrollContainer) return;

    const scrollInterval = setInterval(() => {
      // If user is hovering/touching, maybe we pause? (Optional, kept simple here)
      if (scrollContainer.scrollLeft + scrollContainer.clientWidth >= scrollContainer.scrollWidth) {
        // Reset to start smoothly
        scrollContainer.scrollTo({ left: 0, behavior: 'smooth' });
      } else {
        // Scroll forward one item width
        scrollContainer.scrollBy({ left: 300, behavior: 'smooth' });
      }
    }, 4000); // Scrolls every 4 seconds

    return () => clearInterval(scrollInterval);
  }, []);

  if (!products || products.length === 0) return null;

  return (
    <div className="mb-16">
      {/* Category Title */}
      <motion.h2 
        initial={{ opacity: 0, x: -20 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true }}
        className="text-2xl md:text-4xl font-serif font-bold text-white mb-6 pl-4 border-l-4 border-primary uppercase tracking-widest shadow-primary drop-shadow-[0_0_10px_rgba(255,215,0,0.5)]"
      >
        {title}
      </motion.h2>

      {/* Horizontal Scroll Container */}
      <div 
        ref={scrollRef}
        className="flex overflow-x-auto gap-4 pb-8 snap-x snap-mandatory scrollbar-hide py-4"
        style={{ scrollBehavior: 'smooth', WebkitOverflowScrolling: 'touch' }}
      >
        {products.map((product) => (
          <div 
            key={product.id}
            onClick={() => onProductClick(product)}
            // MOBILE: w-[45vw] (approx 2 items). DESKTOP: w-[22vw] (approx 4 items)
            className="snap-center shrink-0 w-[45vw] md:w-[22vw] min-w-[160px] md:min-w-[250px] group cursor-pointer"
          >
            {/* Card UI with Yellow Border Hover Effect */}
            <div className="bg-[#111] rounded-2xl p-4 border border-white/5 group-hover:border-primary transition-all duration-300 relative overflow-hidden h-full flex flex-col shadow-lg">
              
              {/* Image Box (Fixed Height) */}
              <div className="aspect-square mb-4 overflow-hidden rounded-xl bg-black/50 flex items-center justify-center relative">
                <img 
                  src={product.image} 
                  alt={product.name}
                  className="w-[85%] object-contain transition-transform duration-500 group-hover:scale-110 group-hover:rotate-2" 
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                   <span className="bg-primary text-black text-xs font-bold px-4 py-2 rounded-full uppercase tracking-wider transform translate-y-4 group-hover:translate-y-0 transition-transform">
                     Customize
                   </span>
                </div>
              </div>

              {/* Text */}
              <div className="mt-auto">
                <h3 className="font-bold text-white text-sm md:text-xl leading-tight mb-2 truncate">{product.name}</h3>
                <div className="flex justify-between items-center mt-2">
                  <div className="flex flex-col">
                    <span className="text-[10px] text-gray-500 uppercase">Starting at</span>
                    <span className="text-primary font-bold text-lg">Rs. {product.basePrice}</span>
                  </div>
                  <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white group-hover:bg-primary group-hover:text-black transition-colors shadow-lg">
                    <FiPlus size={20} />
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