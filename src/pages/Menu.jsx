import { useEffect, useState } from 'react';
import { db } from '../lib/firebase';
import { collection, getDocs } from 'firebase/firestore';
import { AnimatePresence, motion } from 'framer-motion';
import MenuSection from '../components/menu/MenuSection';
import ProductModal from '../components/menu/ProductModal';

export default function Menu() {
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [activeCategory, setActiveCategory] = useState('Burgers'); // For scrolling

  const categoryOrder = [
    'Burgers', 'Pizza', 'Wrapster', 'Crispy Chicken', 
    'Fries', 'Twister', 'Shawarma', 'Nuggets', 
    'Wings', 'Desserts', 'Beverages'
  ];

  useEffect(() => {
    const fetchProducts = async () => {
      const snapshot = await getDocs(collection(db, "products"));
      setProducts(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    };
    fetchProducts();
  }, []);

  const groupedProducts = products.reduce((acc, product) => {
    const cat = product.category || 'Other';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(product);
    return acc;
  }, {});

  const scrollToCategory = (cat) => {
    setActiveCategory(cat);
    const element = document.getElementById(cat);
    if (element) {
      // Offset for the fixed header
      const y = element.getBoundingClientRect().top + window.scrollY - 200;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen w-full relative bg-transparent pt-32 pb-32">
      
      {/* 1. HEADER (Fixed text issue) */}
      <div className="container mx-auto text-center mb-8 relative z-20">
        <h1 className="text-5xl md:text-8xl font-serif font-bold text-white mb-2 leading-tight">
          The <span className="text-primary">Collection</span>
        </h1>
        <p className="text-gray-400 uppercase tracking-[4px] text-xs font-bold">
          Let's taste it your own way
        </p>
      </div>

      {/* 2. CATEGORY BAR (Like Screenshot) */}
      <div className="sticky top-20 z-40 bg-dark/95 backdrop-blur-md py-4 border-b border-white/5 mb-8 shadow-lg">
        <div className="container mx-auto px-4 overflow-x-auto scrollbar-hide">
          <div className="flex gap-3 w-max mx-auto">
            {categoryOrder.map((cat) => (
              <button
                key={cat}
                onClick={() => scrollToCategory(cat)}
                className={`px-6 py-2 rounded-lg font-bold uppercase text-xs tracking-wider transition-all border ${
                  activeCategory === cat 
                  ? 'bg-[#b90e0a] text-white border-[#b90e0a] shadow-[0_0_15px_rgba(185,14,10,0.5)]' 
                  : 'bg-[#1a1a1a] text-gray-400 border-white/10 hover:border-white/30'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 3. MENU SECTIONS */}
      <div className="container mx-auto px-4 relative z-10">
        {categoryOrder.map((category) => {
          const items = groupedProducts[category];
          if (!items || items.length === 0) return null;
          
          return (
            <div id={category} key={category} className="scroll-mt-40">
              <MenuSection 
                title={category} 
                products={items} 
                onProductClick={setSelectedProduct} 
              />
            </div>
          );
        })}
      </div>

      {/* 4. MODAL */}
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