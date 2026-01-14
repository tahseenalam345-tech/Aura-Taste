import { useEffect, useState } from 'react';
import { db } from '../lib/firebase';
import { collection, getDocs } from 'firebase/firestore';
import { AnimatePresence } from 'framer-motion';
import MenuSection from '../components/menu/MenuSection';
import ProductModal from '../components/menu/ProductModal';

export default function Menu() {
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [activeCategory, setActiveCategory] = useState('Burgers');

  const categoryOrder = [
    'Burgers', 'Pizza', 'Wrapster', 'Crispy Chicken', 
    'Fries', 'Twister', 'Shawarma', 'Nuggets', 
    'Wings', 'Desserts', 'Beverages'
  ];

  useEffect(() => {
    const fetch = async () => {
      const snap = await getDocs(collection(db, "products"));
      setProducts(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    };
    fetch();
  }, []);

  const grouped = products.reduce((acc, p) => {
    const cat = p.category || 'Other';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(p);
    return acc;
  }, {});

  const handleScrollTo = (cat) => {
    setActiveCategory(cat);
    const el = document.getElementById(cat);
    if(el) {
      const y = el.getBoundingClientRect().top + window.scrollY - 180;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen w-full relative bg-transparent pt-32 pb-32">
      <div className="container mx-auto text-center mb-8 relative z-20">
        <h1 className="text-5xl md:text-8xl font-serif font-bold text-white mb-2">The <span className="text-primary">Collection</span></h1>
        <p className="text-gray-400 uppercase tracking-[4px] text-xs font-bold">Let's taste it your own way</p>
      </div>

      {/* CATEGORY BAR (RED BUTTONS) */}
      <div className="sticky top-20 z-40 bg-dark/95 backdrop-blur-md py-4 border-b border-white/5 mb-8 shadow-lg">
        <div className="container mx-auto px-4 overflow-x-auto scrollbar-hide">
          <div className="flex gap-3 w-max mx-auto">
            {categoryOrder.map((cat) => (
              <button
                key={cat}
                onClick={() => handleScrollTo(cat)}
                className={`px-6 py-3 rounded-md font-bold uppercase text-xs tracking-wider transition-all border ${
                  activeCategory === cat 
                  ? 'bg-[#b90e0a] text-white border-[#b90e0a] shadow-lg scale-105' // RED ACTIVE
                  : 'bg-[#1a1a1a] text-gray-400 border-white/10 hover:border-white/30'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        {categoryOrder.map((cat) => (
          grouped[cat] && <div id={cat} key={cat}><MenuSection title={cat} products={grouped[cat]} onProductClick={setSelectedProduct} /></div>
        ))}
      </div>

      <AnimatePresence>
        {selectedProduct && <ProductModal product={selectedProduct} isOpen={!!selectedProduct} onClose={() => setSelectedProduct(null)} />}
      </AnimatePresence>
    </div>
  );
}