import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Images (Ensure these exist in src/assets/)
import imgExpand from '../../assets/burger-1-expand.png';
import imgHalf from '../../assets/burger-2-half.png';
import imgReady from '../../assets/burger-3-ready.png';

const images = [imgExpand, imgHalf, imgReady];

export default function HeroBurger() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    // Slower loop for a more premium feel (3 seconds per state)
    const timer = setInterval(() => {
      setIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, 3000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="relative w-full h-full flex items-center justify-center pointer-events-none select-none">
      
      {/* 1. Floating Animation (Idle) */}
      <motion.div
        animate={{ y: [0, -20, 0], rotate: [0, 1, 0, -1, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        className="relative w-full h-full flex items-center justify-center"
      >
        
        {/* 2. Cross-Fade Logic */}
        <AnimatePresence mode='wait'>
          <motion.img
            key={index}
            src={images[index]}
            alt="Premium Burger"
            
            // Smoother entrance/exit
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 1.05, filter: 'blur(8px)' }}
            
            transition={{ 
              duration: 1.2, // Slower fade
              ease: [0.22, 1, 0.36, 1] // "Cinematic" easing curve
            }}
            
            // Responsive sizing: Fits nicely on mobile, larger on desktop
            className="absolute max-w-[85%] md:max-w-[90%] max-h-[80%] object-contain drop-shadow-2xl"
          />
        </AnimatePresence>

        {/* 3. Subtle Glow Behind */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[50%] h-[50%] bg-primary/10 blur-[80px] -z-10 rounded-full" />
        
      </motion.div>
    </div>
  );
}