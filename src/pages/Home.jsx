import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Float, ContactShadows } from '@react-three/drei';
import { Suspense } from 'react';
import { FiArrowRight, FiPlayCircle } from 'react-icons/fi';

// --- OPTIMIZED 3D BURGER ---
function BurgerModel() {
  return (
    <Float speed={2} rotationIntensity={0.5} floatIntensity={1}>
      {/* 1. TOP BUN (Orange/Brown) - Reduced Scale */}
      <mesh position={[0, 0.8, 0]} scale={[1.6, 0.8, 1.6]}>
        <sphereGeometry args={[1, 32, 32]} />
        <meshStandardMaterial color="#d35400" roughness={0.3} />
      </mesh>
      
      {/* 2. LETTUCE (Green) */}
      <mesh position={[0, 0.1, 0]} scale={[1.7, 0.1, 1.7]}>
         <cylinderGeometry args={[1, 1, 1, 32]} />
         <meshStandardMaterial color="#2ecc71" roughness={0.8} />
      </mesh>
      
      {/* 3. MEAT (Dark Brown) */}
      <mesh position={[0, -0.3, 0]} scale={[1.5, 0.4, 1.5]}>
         <cylinderGeometry args={[1, 1, 1, 32]} />
         <meshStandardMaterial color="#3e2723" roughness={0.9} />
      </mesh>
      
      {/* 4. CHEESE (Yellow) */}
      <mesh position={[0, -0.05, 0]} scale={[1.6, 0.05, 1.6]}>
         <boxGeometry args={[1.2, 1, 1.2]} />
         <meshStandardMaterial color="#f1c40f" />
      </mesh>

      {/* 5. BOTTOM BUN */}
      <mesh position={[0, -0.8, 0]} scale={[1.6, 0.6, 1.6]}>
        <cylinderGeometry args={[1, 1, 1, 32]} />
        <meshStandardMaterial color="#d35400" roughness={0.3} />
      </mesh>
    </Float>
  );
}

export default function Home() {
  return (
    <div className="min-h-screen pt-20 md:pt-24 pb-12 flex flex-col justify-center relative overflow-hidden bg-transparent">
      
      <div className="container mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center relative z-10">
        
        {/* --- LEFT: TEXT CONTENT (Mobile First Order) --- */}
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

        {/* --- RIGHT: 3D BURGER (Fixed Camera & Scale) --- */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 1 }}
          className="h-[350px] md:h-[600px] w-full relative z-20 order-2 flex items-center justify-center"
        >
          {/* CAMERA POSITION MOVED BACK (z: 8) */}
          <Canvas camera={{ position: [0, 0, 8], fov: 45 }} className="w-full h-full cursor-grab active:cursor-grabbing">
            <ambientLight intensity={0.7} />
            <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={1.5} />
            <pointLight position={[-10, -10, -10]} intensity={0.5} />
            
            <Suspense fallback={null}>
              <BurgerModel />
              {/* SHADOWS & CONTROLS */}
              <ContactShadows position={[0, -2, 0]} opacity={0.4} scale={10} blur={2.5} far={4} />
              <OrbitControls enableZoom={false} autoRotate autoRotateSpeed={2} />
            </Suspense>
          </Canvas>
          
          {/* Floating Price Tag */}
          <div className="absolute bottom-4 right-4 md:bottom-10 md:right-10 bg-black/60 backdrop-blur-md p-4 rounded-xl border border-white/10 z-30 shadow-2xl">
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