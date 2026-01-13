import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { Canvas } from '@react-three/fiber';
import { Stars } from '@react-three/drei';
import { CartProvider } from './context/CartContext';
import { AuthProvider } from './context/AuthContext';
import { AnimatePresence, motion } from 'framer-motion'; // Animation library
import Navbar from './components/common/Navbar';
import Home from './pages/Home';
import Menu from './pages/Menu';
import Cart from './pages/Cart';
import Login from './pages/Login';
import AdminDashboard from './pages/admin/Dashboard';
import Deals from './pages/Deals';     // Import
import Delivery from './pages/Delivery'; // Import

// 1. The Fixed Background (Stars)
function StarBackground() {
  return (
    <div className="fixed inset-0 z-0 bg-dark pointer-events-none">
      <Canvas camera={{ position: [0, 0, 1] }}>
        <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
      </Canvas>
    </div>
  );
}

// 2. The Diamond Page Transition
// 2. The Diamond Page Transition (FAST VERSION)
const PageWrapper = ({ children }) => {
  return (
    <motion.div
      initial={{ opacity: 0, clipPath: 'polygon(50% 0, 50% 0, 50% 100%, 50% 100%)' }}
      animate={{ opacity: 1, clipPath: 'polygon(0 0, 100% 0, 100% 100%, 0 100%)' }}
      exit={{ opacity: 0, clipPath: 'polygon(50% 0, 50% 0, 50% 100%, 50% 100%)' }}
      // WAS: duration: 0.8 -> NOW: duration: 0.4 (2x Faster)
      transition={{ duration: 0.4, ease: "easeInOut" }}
      className="relative z-10"
    >
      {children}
    </motion.div>
  );
};

// 3. The Animated Routes
function AnimatedRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<PageWrapper><Home /></PageWrapper>} />
        <Route path="/menu" element={<PageWrapper><Menu /></PageWrapper>} />
        <Route path="/cart" element={<PageWrapper><Cart /></PageWrapper>} />
        <Route path="/login" element={<PageWrapper><Login /></PageWrapper>} />
        <Route path="/admin" element={<PageWrapper><AdminDashboard /></PageWrapper>} />
        <Route path="/deals" element={<PageWrapper><Deals /></PageWrapper>} />
<Route path="/delivery" element={<PageWrapper><Delivery /></PageWrapper>} />
      </Routes>
    </AnimatePresence>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          {/* Background is Fixed at Z-0 */}
          <StarBackground />
          
          <Navbar />
          <Toaster position="bottom-right" toastOptions={{ style: { background: '#1a1a1a', color: '#fff' }}} />
          
          {/* Routes handle the transitions */}
          <AnimatedRoutes />
          
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;