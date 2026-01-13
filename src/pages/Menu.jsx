import { useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import { collection, getDocs } from 'firebase/firestore';
import ProductCard from '../components/common/ProductCard';
import { motion } from 'framer-motion';
import { FiLoader } from 'react-icons/fi';

export default function Menu() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All');
  const categories = [
  'All', 'Burger', 'Pizza', 'Fries', 'Wrapsters', 
  'Fried Chicken', 'Nuggets', 'Sandwiches', 'Dips & Sides', 'Desserts'
];

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "products"));
        const items = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setProducts(items);
      } catch (error) {
        console.error("Error fetching menu:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const filteredProducts = filter === 'All' ? products : products.filter(p => p.category === filter);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white">
        <div className="flex flex-col items-center gap-4">
          <FiLoader className="animate-spin text-4xl text-primary" />
          <p>Loading Menu...</p>
        </div>
      </div>
    );
  }

  return (
    // FIX IS HERE: Changed 'bg-dark' to 'bg-transparent'
    <div className="min-h-screen bg-transparent text-white pt-24 px-4 pb-10 relative z-10">
      <div className="container mx-auto">
        <h1 className="text-5xl font-serif font-bold text-center mb-8">
          The <span className="text-primary">Collection</span>
        </h1>

        {/* Filter Tabs */}
        <div className="flex justify-center gap-4 mb-12 flex-wrap">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`px-6 py-2 rounded-full border border-white/10 transition-all font-bold tracking-widest text-xs uppercase ${
                filter === cat 
                ? 'bg-primary text-black' 
                : 'bg-white/5 text-gray-400 hover:bg-white/10'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Product Grid */}
        {filteredProducts.length > 0 ? (
          <motion.div 
            layout
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
          >
            {filteredProducts.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </motion.div>
        ) : (
          <div className="text-center text-gray-500 py-12">
            No items found in this category.
          </div>
        )}
      </div>
    </div>
  );
}