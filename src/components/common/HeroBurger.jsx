import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// IMPORT YOUR IMAGES HERE
// (Make sure these exist in src/assets/)
import imgExpand from '../../assets/burger-1-expand.png';
import imgHalf from '../../assets/burger-2-half.png';
import imgReady from '../../assets/burger-3-ready.png';

const images = [imgExpand, imgHalf, imgReady];

export default function HeroBurger() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    // Change image every 2.5 seconds (2500ms)
    const timer = setInterval(() => {
      setIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, 2500);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="relative w-full h-[350px] md:h-[500px] flex items-center justify-center pointer-events-none select-none">
      
      {/* 1. Global Float Animation (Moves the whole container gently) */}
      <motion.div
        animate={{ y: [0, -15, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        className="relative w-full h-full flex items-center justify-center"
      >
        
        {/* 2. The Cross-Fade Sequencer */}
        <AnimatePresence mode='wait'>
          <motion.img
            key={index} // Key change triggers the animation
            src={images[index]}
            alt="Premium Burger"
            
            // INITIAL STATE (Entering)
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            
            // ACTIVE STATE (Visible)
            animate={{ opacity: 1, scale: 1, y: 0 }}
            
            // EXIT STATE (Leaving)
            exit={{ opacity: 0, scale: 1.1, filter: 'blur(10px)' }}
            
            // TIMING CONFIGURATION
            transition={{ 
              duration: 0.8, 
              ease: [0.43, 0.13, 0.23, 0.96] // Cinematic easing
            }}
            
            className="absolute max-w-[90%] max-h-[90%] object-contain drop-shadow-2xl filter"
          />
        </AnimatePresence>

        {/* 3. Glow Effect behind the burger (Optional but looks premium) */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60%] h-[60%] bg-primary/20 blur-[100px] -z-10 rounded-full" />
        
      </motion.div>
    </div>
  );
}