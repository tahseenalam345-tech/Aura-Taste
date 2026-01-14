import { useEffect, useState } from 'react';
import { db } from '../lib/firebase';
import { collection, getDocs } from 'firebase/firestore';
import ProductCard from '../components/common/ProductCard';
import { motion } from 'framer-motion';

export default function Menu() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Define the EXACT order you want
  const categoryOrder = ['Burger', 'Pizza', 'Wrapsters', 'Fried Chicken', 'Sandwiches', 'Nuggets', 'Fries', 'Dips & Sides', 'Desserts', 'Drinks'];

  useEffect(() => {
    const fetchProducts = async () => {
      const snapshot = await getDocs(collection(db, "products"));
      setProducts(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    };
    fetchProducts();
  }, []);

  // Group products by category
  const groupedProducts = products.reduce((acc, product) => {
    const cat = product.category || 'Other';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(product);
    return acc;
  }, {});

  if (loading) return <div className="min-h-screen pt-32 text-center text-white">Loading Menu...</div>;

  return (
    <div className="min-h-screen pt-24 px-4 pb-12">
      <div className="container mx-auto">
        <h1 className="text-4xl md:text-6xl font-serif font-bold text-center mb-12">
          The <span className="text-primary">Collection</span>
        </h1>

        {/* Map through categories in specific order */}
        {categoryOrder.map((category) => {
          const categoryItems = groupedProducts[category];
          if (!categoryItems || categoryItems.length === 0) return null;

          return (
            <div key={category} className="mb-16">
              <motion.h2 
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                className="text-2xl font-bold text-white mb-6 border-l-4 border-primary pl-4 uppercase tracking-widest"
              >
                {category}
              </motion.h2>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {categoryItems.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}