import { useEffect, useState } from 'react';
import { db } from '../lib/firebase';
import { collection, getDocs } from 'firebase/firestore';
import { AnimatePresence } from 'framer-motion';
import MenuSection from '../components/menu/MenuSection';
import ProductModal from '../components/menu/ProductModal';

export default function Menu() {
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  // Your requested categories
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
    <div className="min-h-screen w-full relative bg-transparent">
      
      {/* FIXED HEADER */}
      <div className="sticky top-0 z-40 bg-dark/95 backdrop-blur-md py-4 border-b border-white/10 shadow-xl">
        <div className="container mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-serif font-bold text-white leading-none">
            The <span className="text-primary">Collection</span>
          </h1>
          <p className="text-primary uppercase tracking-[2px] text-[10px] md:text-xs font-bold mt-1">
            Let's taste it your own way
          </p>
        </div>
      </div>

      {/* SCROLLABLE CONTENT */}
      <div className="container mx-auto pt-8 pb-32">
        {loading ? (
          <div className="text-center text-white pt-20">Loading Menu...</div>
        ) : (
          categoryOrder.map((category) => {
            const items = groupedProducts[category];
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

      {/* POPUP */}
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