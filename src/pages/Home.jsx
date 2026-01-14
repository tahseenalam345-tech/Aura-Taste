import { useState, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { Environment, Float } from '@react-three/drei';
import HeroBurger from '../components/3d/HeroBurger';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { FiArrowRight, FiPlay, FiX, FiChevronDown } from 'react-icons/fi';

export default function Home() {
  const [isVideoOpen, setIsVideoOpen] = useState(false);
  const navigate = useNavigate();

  // --- AUTO-SCROLL LOGIC ---
  useEffect(() => {
    const handleScroll = (e) => {
      // If user scrolls DOWN (deltaY > 0) and video is closed
      if (e.deltaY > 50 && !isVideoOpen) {
        navigate('/menu');
      }
    };

    // Add listener
    window.addEventListener('wheel', handleScroll);
    return () => window.removeEventListener('wheel', handleScroll);
  }, [navigate, isVideoOpen]);

  return (
    <div className="w-full min-h-screen relative overflow-hidden bg-transparent text-white">
      
      {/* --- VIDEO MODAL --- */}
      <AnimatePresence>
        {isVideoOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-md p-4"
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative w-full max-w-5xl aspect-video bg-black rounded-2xl overflow-hidden shadow-2xl border border-white/10"
            >
              <iframe 
                width="100%" height="100%" 
                src="https://www.youtube.com/embed/L6yX6Oxy_J8?autoplay=1&mute=0&controls=0&modestbranding=1&rel=0" 
                title="Cinematic Burger" frameBorder="0" allowFullScreen
              ></iframe>
            </motion.div>
            <button 
              onClick={() => setIsVideoOpen(false)}
              className="absolute top-6 right-6 z-[110] text-white/50 hover:text-white hover:scale-110 transition-all cursor-pointer bg-black/50 p-2 rounded-full backdrop-blur-sm"
            >
              <FiX size={32} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* --- MAIN CONTENT --- */}
      <div className="container mx-auto h-full px-6 flex flex-col md:flex-row items-center relative z-10 pt-20">
        
        {/* Left: Typography */}
        <div className="w-full md:w-1/2 flex flex-col items-start justify-center h-full space-y-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="border border-gold-muted/30 px-4 py-2 rounded-full">
            <span className="text-[10px] tracking-[3px] text-gold-muted uppercase font-bold">Premium Dining Experience</span>
          </motion.div>

          <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="text-6xl md:text-8xl font-serif font-medium leading-[1.1]">
            Taste the <br /> <span className="text-white">Future.</span>
          </motion.h1>

          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} className="text-gray-400 max-w-md leading-relaxed font-sans">
            Where culinary artistry meets digital innovation. Experience the world's first fully immersive gourmet burger atelier.
          </motion.p>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }} className="flex items-center gap-6">
            <Link to="/menu" className="bg-primary text-dark px-8 py-4 rounded-sm font-bold tracking-widest text-xs uppercase flex items-center gap-2 hover:bg-white transition-colors">
              Order Now <FiArrowRight size={16} />
            </Link>
            <button onClick={() => setIsVideoOpen(true)} className="flex items-center gap-3 text-xs font-bold tracking-widest uppercase hover:text-primary transition-colors group">
              <div className="w-10 h-10 border border-white/20 rounded-full flex items-center justify-center group-hover:border-primary transition-colors"><FiPlay className="ml-1" /></div>
              Watch Film
            </button>
          </motion.div>
        </div>

        {/* Right: 3D Burger */}
        <div className="w-full md:w-1/2 h-[60vh] md:h-full relative">
          <Canvas camera={{ position: [0, 0, 6], fov: 35 }}>
            <ambientLight intensity={0.3} />
            <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={2} color="#FFD700" />
            <spotLight position={[-10, 0, -5]} intensity={1.5} color="#4a4a4a" />
            <Float speed={2} rotationIntensity={0.5} floatIntensity={1}>
              <group rotation={[0.1, -0.2, 0]}><HeroBurger /></group>
            </Float>
            <Environment preset="city" />
          </Canvas>
          
          <motion.div initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 1 }} className="absolute top-1/2 right-10 -translate-y-1/2 bg-white/5 backdrop-blur-md border border-white/10 p-6 rounded-xl hidden md:block">
            <h3 className="text-primary font-serif italic text-xl mb-1">The Aura Gold</h3>
            <p className="text-gray-400 text-xs mb-4 max-w-[150px]">Aged Angus, Truffle Aioli, 24k Edible Gold Leaf.</p>
            <div className="text-2xl font-bold font-sans">$18.00</div>
            <div className="text-[10px] text-gray-500 uppercase tracking-widest mt-1">Drag to rotate</div>
          </motion.div>
        </div>

      </div>

      {/* --- BOUNCING SCROLL INDICATOR --- */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1, y: [0, 10, 0] }} // Bouncing Animation
        transition={{ delay: 2, duration: 2, repeat: Infinity }}
        className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 cursor-pointer z-20"
        onClick={() => navigate('/menu')} // Click works too!
      >
        <span className="text-[10px] tracking-[4px] uppercase font-bold text-gray-500">Scroll</span>
        <FiChevronDown className="text-primary text-xl" />
      </motion.div>

    </div>
  );
}