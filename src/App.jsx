import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { Canvas } from '@react-three/fiber';
import { Stars } from '@react-three/drei';
import { CartProvider } from './context/CartContext';
import { AuthProvider } from './context/AuthContext';
import { AnimatePresence, motion } from 'framer-motion'; 

// IMPORTS
import Navbar from './components/common/Navbar';
import Home from './pages/Home';
import Menu from './pages/Menu';
import Cart from './pages/Cart';
import Login from './pages/Login';
import AdminDashboard from './pages/admin/Dashboard';
import Deals from './pages/Deals';     
import Delivery from './pages/Delivery'; 
import MakeYourDeal from './pages/MakeYourDeal';
import InstallButton from './components/common/InstallButton'; 

function StarBackground() {
  return (
    <div className="fixed inset-0 z-[-1] bg-dark pointer-events-none">
      <Canvas camera={{ position: [0, 0, 1] }}>
        <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
      </Canvas>
    </div>
  );
}

const PageWrapper = ({ children }) => {
  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="relative z-10 w-full"
    >
      {children}
    </motion.div>
  );
};

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
        <Route path="/make-deal" element={<PageWrapper><MakeYourDeal /></PageWrapper>} />
      </Routes>
    </AnimatePresence>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          {/* Background forced to back */}
          <StarBackground />
          
          <Navbar />
          <InstallButton />
          
          <Toaster position="top-center" toastOptions={{ style: { background: '#1a1a1a', color: '#fff', border: '1px solid #FFD700' }}} />
          
          <div className="relative z-10">
             <AnimatedRoutes />
          </div>
          
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;