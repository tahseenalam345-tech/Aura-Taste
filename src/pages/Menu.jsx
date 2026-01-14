import { useEffect, useState } from 'react';
import { db } from '../lib/firebase';
import { collection, getDocs } from 'firebase/firestore';
import { AnimatePresence, motion } from 'framer-motion';
import MenuSection from '../components/menu/MenuSection';
import ProductModal from '../components/menu/ProductModal';

export default function Menu() {
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  // New Category Order
  const categoryOrder = [
    'Burgers', 'Pizza', 'Wrapster', 'Crispy Chicken', 
    'Fries', 'Twister', 'Shawarma', 'Nuggets', 
    'Wings', 'Desserts', 'Beverages'
  ];

  useEffect(() => {
    const fetchProducts = async () => {
      const snapshot = await getDocs(collection(db, "products"));
      setProducts(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    };
    fetchProducts();
  }, []);

  const groupedProducts = products.reduce((acc, product) => {
    const cat = product.category || 'Other';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(product);
    return acc;
  }, {});

  return (
    // min-h-screen allows vertical scrolling. snap-start for section scrolling.
    <div className="min-h-screen w-full snap-start pt-24 px-4 pb-32 overflow-x-hidden relative">
      
      {/* 1. HEADER SECTION */}
      <div className="container mx-auto text-center mb-16 relative z-10">
        <motion.h1 
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="text-5xl md:text-8xl font-serif font-bold text-white mb-4 tracking-tighter"
        >
          The <span className="text-primary">Collection</span>
        </motion.h1>
        
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="inline-block px-6 py-2 border border-white/20 rounded-full bg-black/30 backdrop-blur-md"
        >
          <p className="text-gray-300 uppercase tracking-[4px] text-xs md:text-sm font-bold">
            Let's taste it your own way
          </p>
        </motion.div>
      </div>

      {/* 2. MENU SECTIONS */}
      <div className="container mx-auto relative z-10">
        {loading ? (
          <div className="flex justify-center pt-20"><div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div></div>
        ) : (
          categoryOrder.map((category) => {
            const items = groupedProducts[category];
            // Only render category if it has items
            if (!items || items.length === 0) return null;
            
            return (
              <MenuSection 
                key={category} 
                title={category} 
                products={items} 
                onProductClick={setSelectedProduct} 
              />
            );
          })
        )}
      </div>

      {/* 3. MODAL */}
      <AnimatePresence>
        {selectedProduct && (
          <ProductModal 
            product={selectedProduct} 
            isOpen={!!selectedProduct} 
            onClose={() => setSelectedProduct(null)} 
          />
        )}
      </AnimatePresence>

    </div>
  );
}