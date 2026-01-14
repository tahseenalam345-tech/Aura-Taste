import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiArrowRight, FiPlayCircle } from 'react-icons/fi';
// IMPORT THE NEW COMPONENT
import HeroBurger from '../components/common/HeroBurger';

export default function Home() {
  return (
    <div className="min-h-screen pt-20 md:pt-24 pb-12 flex flex-col justify-center relative overflow-hidden bg-transparent">
      
      <div className="container mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center relative z-10">
        
        {/* LEFT: TEXT CONTENT */}
        <motion.div 
          initial={{ opacity: 0, x: -50 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8 }}
          className="text-center lg:text-left order-1" 
        >
          <div className="inline-block px-3 py-1 border border-primary/30 rounded-full mb-4 md:mb-6">
            <span className="text-primary text-[10px] md:text-xs font-bold tracking-[3px] uppercase">Premium Dining Experience</span>
          </div>
          
          <h1 className="text-4xl md:text-7xl font-serif font-bold leading-tight mb-4 md:mb-6">
            Taste the <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-500">Future.</span>
          </h1>
          
          <p className="text-gray-400 text-sm md:text-lg mb-6 md:mb-8 max-w-lg mx-auto lg:mx-0 leading-relaxed">
            Where culinary artistry meets digital innovation. Experience the world's first fully immersive gourmet burger atelier.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start w-full sm:w-auto">
            <Link to="/menu" className="w-full sm:w-auto bg-primary text-dark px-8 py-4 rounded font-bold tracking-widest uppercase hover:bg-white transition-colors flex items-center justify-center gap-2 group">
              Order Now <FiArrowRight className="group-hover:translate-x-1 transition-transform" />
            </Link>
            <button className="w-full sm:w-auto px-8 py-4 border border-white/20 rounded font-bold tracking-widest uppercase hover:bg-white/5 transition-colors flex items-center justify-center gap-2 text-white">
              <FiPlayCircle className="text-xl" /> Watch Film
            </button>
          </div>
        </motion.div>

        {/* RIGHT: ANIMATED BURGER (Replaces Canvas) */}
        <motion.div 
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1 }}
          className="w-full relative z-20 order-2 flex items-center justify-center"
        >
          {/* THE NEW COMPONENT GOES HERE */}
          <HeroBurger />
          
          {/* Floating Price Tag */}
          <div className="absolute bottom-4 right-4 md:bottom-10 md:right-10 bg-black/80 backdrop-blur-md p-4 rounded-xl border border-white/10 z-30 shadow-2xl animate-bounce-slow">
             <h4 className="text-primary font-serif font-bold italic text-lg md:text-xl">The Aura Gold</h4>
             <p className="text-[10px] text-gray-300 mb-2 max-w-[150px]">Aged Angus, Truffle Aioli, 24k Edible Gold Leaf.</p>
             <div className="text-xl md:text-2xl font-bold text-white">$18.00</div>
          </div>
        </motion.div>

      </div>
      
      {/* Scroll Indicator */}
      <motion.div 
        animate={{ y: [0, 10, 0] }} transition={{ repeat: Infinity, duration: 2 }}
        className="absolute bottom-4 left-1/2 -translate-x-1/2 text-center hidden md:block"
      >
        <span className="text-[10px] tracking-[4px] uppercase text-gray-500">Scroll</span>
        <div className="w-[1px] h-8 bg-gradient-to-b from-primary to-transparent mx-auto mt-2"></div>
      </motion.div>
    </div>
  );
}