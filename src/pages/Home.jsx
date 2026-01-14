import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Float } from '@react-three/drei';
import { Suspense } from 'react';
import { FiArrowRight, FiPlayCircle } from 'react-icons/fi';
import ProductCard from '../components/common/ProductCard';

// 3D BURGER COMPONENT
function BurgerModel() {
  return (
    <Float speed={2} rotationIntensity={0.5} floatIntensity={1}>
      <mesh scale={2.8}>
        <sphereGeometry args={[1, 32, 32]} />
        <meshStandardMaterial color="#ff9f43" roughness={0.3} metalness={0.1} />
      </mesh>
      <mesh position={[0, -0.2, 0]} scale={[3, 0.2, 3]}>
         <cylinderGeometry args={[1, 1, 1, 32]} />
         <meshStandardMaterial color="#44bd32" />
      </mesh>
      <mesh position={[0, -0.5, 0]} scale={[3, 0.3, 3]}>
         <cylinderGeometry args={[1, 1, 1, 32]} />
         <meshStandardMaterial color="#8c2e2e" />
      </mesh>
    </Float>
  );
}

export default function Home() {
  return (
    <div className="min-h-screen pt-24 pb-12 flex flex-col justify-center relative overflow-hidden">
      
      <div className="container mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center relative z-10">
        
        {/* LEFT: TEXT CONTENT */}
        <motion.div 
          initial={{ opacity: 0, x: -50 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8 }}
          className="text-center lg:text-left order-1" // Order 1 ensures text is first on mobile
        >
          <div className="inline-block px-4 py-1 border border-primary/30 rounded-full mb-6">
            <span className="text-primary text-xs font-bold tracking-[3px] uppercase">Premium Dining Experience</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-serif font-bold leading-tight mb-6">
            Taste the <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-500">Future.</span>
          </h1>
          
          <p className="text-gray-400 text-lg mb-8 max-w-lg mx-auto lg:mx-0 leading-relaxed">
            Where culinary artistry meets digital innovation. Experience the world's first fully immersive gourmet burger atelier.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
            <Link to="/menu" className="bg-primary text-dark px-8 py-4 rounded font-bold tracking-widest uppercase hover:bg-white transition-colors flex items-center justify-center gap-2 group">
              Order Now <FiArrowRight className="group-hover:translate-x-1 transition-transform" />
            </Link>
            <button className="px-8 py-4 border border-white/20 rounded font-bold tracking-widest uppercase hover:bg-white/5 transition-colors flex items-center justify-center gap-2 text-white">
              <FiPlayCircle className="text-xl" /> Watch Film
            </button>
          </div>
        </motion.div>

        {/* RIGHT: 3D BURGER (Fixed z-index) */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 1 }}
          className="h-[400px] md:h-[600px] w-full relative z-20 order-2" // Z-20 forces it above text
        >
          <Canvas camera={{ position: [0, 0, 5], fov: 45 }}>
            <ambientLight intensity={0.5} />
            <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={1} />
            <pointLight position={[-10, -10, -10]} intensity={0.5} />
            <Suspense fallback={null}>
              <BurgerModel />
              <OrbitControls enableZoom={false} autoRotate autoRotateSpeed={2} />
            </Suspense>
          </Canvas>
          
          {/* Floating Price Tag */}
          <div className="absolute bottom-10 right-0 md:right-10 bg-white/10 backdrop-blur-md p-4 rounded-xl border border-white/10 z-30">
             <h4 className="text-primary font-serif font-bold italic text-xl">The Aura Gold</h4>
             <p className="text-[10px] text-gray-300 mb-2 max-w-[150px]">Aged Angus, Truffle Aioli, 24k Edible Gold Leaf.</p>
             <div className="text-2xl font-bold text-white">$18.00</div>
          </div>
        </motion.div>

      </div>
      
      {/* Scroll Indicator */}
      <motion.div 
        animate={{ y: [0, 10, 0] }} transition={{ repeat: Infinity, duration: 2 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 text-center"
      >
        <span className="text-[10px] tracking-[4px] uppercase text-gray-500">Scroll</span>
        <div className="w-[1px] h-8 bg-gradient-to-b from-primary to-transparent mx-auto mt-2"></div>
      </motion.div>
    </div>
  );
}