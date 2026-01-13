import { motion } from 'framer-motion';
import { useCart } from '../context/CartContext';
import { toast } from 'react-hot-toast';
import { FiPlus } from 'react-icons/fi';

const deals = [
  { id: 'd1', name: "Friday Deal", price: 25.00, description: "2 Burgers + 2 Fries + 2 Drinks", image: "https://images.unsplash.com/photo-1549488391-587fd52f0195?w=500", category: "Deals" },
  { id: 'd2', name: "Sunday Mega Deal", price: 40.00, description: "4 Burgers + Family Fries + 1.5L Coke", image: "https://images.unsplash.com/photo-1594212699903-ec8a3eca50f5?w=500", category: "Deals" },
  { id: 'd3', name: "Midnight Deal", price: 15.00, description: "1 Spicy Wrapster + 1 Loaded Fries", image: "https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=500", category: "Deals" },
  { id: 'd4', name: "Party Deal", price: 65.00, description: "10 Nuggets + 5 Burgers + 3 Pizzas", image: "https://images.unsplash.com/photo-1561758033-d8f19662cb23?w=500", category: "Deals" }
];

export default function Deals() {
  const { addToCart } = useCart();

  const handleAdd = (deal) => {
    addToCart(deal);
    toast.success(`${deal.name} Added!`);
  };

  return (
    <div className="min-h-screen bg-transparent text-white pt-24 px-4 pb-10 relative z-10">
      <div className="container mx-auto">
        <h1 className="text-5xl font-serif font-bold text-center mb-12">
          Exclusive <span className="text-primary">Deals</span>
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {deals.map((deal, index) => (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              key={deal.id} 
              className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden hover:border-primary/50 transition-all group relative h-64 md:h-80 flex"
            >
              {/* Image Section */}
              <div className="w-1/2 h-full relative overflow-hidden">
                <img src={deal.image} alt={deal.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                <div className="absolute inset-0 bg-gradient-to-r from-transparent to-black/80"></div>
              </div>

              {/* Text Section */}
              <div className="w-1/2 p-6 flex flex-col justify-center relative z-10 bg-black/60 backdrop-blur-sm -ml-10">
                <h3 className="text-2xl font-serif font-bold text-white mb-2">{deal.name}</h3>
                <p className="text-gray-400 text-sm mb-4">{deal.description}</p>
                <div className="mt-auto flex items-center gap-4">
                  <span className="text-2xl font-bold text-primary">${deal.price}</span>
                  <button onClick={() => handleAdd(deal)} className="bg-primary text-black px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest hover:bg-white transition-colors">
                    Add Deal
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}