import { useEffect, useState } from 'react';
import { db } from '../lib/firebase';
import { collection, getDocs } from 'firebase/firestore';
import { AnimatePresence } from 'framer-motion';
import MenuSection from '../components/menu/MenuSection';
import ProductModal from '../components/menu/ProductModal';

export default function Menu() {
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null); // For Modal
  const [loading, setLoading] = useState(true);

  const categoryOrder = ['Deals', 'Burger', 'Pizza', 'Wrapsters', 'Fried Chicken', 'Sandwiches', 'Drinks'];

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
    <div className="min-h-screen bg-dark w-full pt-24 px-4 pb-20 overflow-x-hidden">
      
      {/* Page Title */}
      <div className="container mx-auto text-center mb-12">
        <h1 className="text-4xl md:text-6xl font-serif font-bold mb-4">
          Our <span className="text-primary">Menu</span>
        </h1>
        <p className="text-gray-400">Select a category to browse</p>
      </div>

      <div className="container mx-auto">
        {loading ? (
          <div className="text-center text-white">Loading delicious items...</div>
        ) : (
          categoryOrder.map((category) => (
            <MenuSection 
              key={category} 
              title={category} 
              products={groupedProducts[category]} 
              onProductClick={setSelectedProduct} 
            />
          ))
        )}
      </div>

      {/* POPUP MODAL */}
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