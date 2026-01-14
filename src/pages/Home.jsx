import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiArrowRight, FiPlay } from 'react-icons/fi';
import HeroBurger from '../components/common/HeroBurger';

export default function Home() {
  return (
    // MAIN CONTAINER: 100dvh ensures it fits mobile screens perfectly without scrollbars
    <div className="relative w-full h-[100dvh] flex flex-col justify-center overflow-hidden bg-transparent pt-16 md:pt-0">
      
      <div className="container mx-auto px-6 h-full grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-12 items-center relative z-10">
        
        {/* --- LEFT: TEXT CONTENT --- */}
        <motion.div 
          initial={{ opacity: 0, x: -30 }} 
          animate={{ opacity: 1, x: 0 }} 
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-center lg:text-left order-1 flex flex-col items-center lg:items-start justify-center h-auto z-20" 
        >
          {/* Badge */}
          <div className="inline-block px-3 py-1 border border-primary/30 rounded-full mb-4 bg-black/20 backdrop-blur-sm">
            <span className="text-primary text-[10px] md:text-xs font-bold tracking-[3px] uppercase">
              Premium Dining Experience
            </span>
          </div>
          
          {/* Headline */}
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-serif font-bold leading-tight mb-4">
            Taste the <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400">
              Future.
            </span>
          </h1>
          
          {/* Description */}
          <p className="text-gray-400 text-sm md:text-lg mb-8 max-w-md leading-relaxed">
            Where culinary artistry meets digital innovation. Experience the world's first fully immersive gourmet burger atelier.
          </p>
          
          {/* Buttons Area */}
          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
            {/* ORDER NOW BUTTON */}
            <Link to="/menu" className="w-full sm:w-auto">
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="w-full bg-primary text-dark px-8 py-4 rounded font-bold tracking-widest uppercase shadow-[0_0_20px_rgba(255,215,0,0.3)] hover:shadow-[0_0_30px_rgba(255,215,0,0.5)] transition-all flex items-center justify-center gap-2"
              >
                Order Now <FiArrowRight />
              </motion.button>
            </Link>

            {/* LET'S PLAY BUTTON (Replaces Watch Film) */}
            <Link to="/make-deal" className="w-full sm:w-auto">
              <motion.button 
                whileHover={{ scale: 1.05, backgroundColor: "rgba(255,255,255,0.1)" }}
                whileTap={{ scale: 0.95 }}
                className="w-full px-8 py-4 border border-white/20 rounded font-bold tracking-widest uppercase text-white flex items-center justify-center gap-2 group backdrop-blur-sm"
              >
                <FiPlay className="text-primary group-hover:rotate-180 transition-transform duration-500" /> 
                Let's Play
              </motion.button>
            </Link>
          </div>
        </motion.div>

        {/* --- RIGHT: HERO BURGER ANIMATION --- */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }} 
          animate={{ opacity: 1, scale: 1 }} 
          transition={{ duration: 1 }}
          className="relative w-full h-[40vh] md:h-full order-2 flex items-center justify-center z-10"
        >
          <HeroBurger />
          {/* Price card removed as requested */}
        </motion.div>

      </div>
      
      {/* Scroll Indicator (Hidden on small mobiles if space is tight, visible on desktop) */}
      <motion.div 
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} delay={1}
        className="absolute bottom-4 left-1/2 -translate-x-1/2 text-center hidden md:block"
      >
        <span className="text-[10px] tracking-[4px] uppercase text-gray-500">Scroll</span>
        <div className="w-[1px] h-8 bg-gradient-to-b from-primary to-transparent mx-auto mt-2 animate-pulse"></div>
      </motion.div>
    </div>
  );
}