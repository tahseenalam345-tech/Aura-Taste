import { useEffect, useState } from 'react';
import { db } from '../../lib/firebase';
import { collection, updateDoc, deleteDoc, addDoc, doc, query, orderBy, onSnapshot } from 'firebase/firestore';
import { toast } from 'react-hot-toast';
import { FiPackage, FiTrash2, FiPlus, FiX } from 'react-icons/fi';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('menu');
  const [products, setProducts] = useState([]);
  
  // Complex Form State
  const initialForm = { 
    name: '', category: 'Burger', image: '', description: '', 
    basePrice: '', 
    sizes: [], // Array of {name: 'Large', price: 1500}
    extras: [] // Array of {name: 'Cheese', price: 100}
  };
  const [newItem, setNewItem] = useState(initialForm);
  
  // Temp inputs for adding sizes/extras to the array
  const [tempSize, setTempSize] = useState({ name: '', price: '' });
  const [tempExtra, setTempExtra] = useState({ name: '', price: '' });

  // Load Products
  useEffect(() => {
    const unsub = onSnapshot(collection(db, "products"), (snap) => {
      setProducts(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    return () => unsub();
  }, []);

  const handleAddProduct = async (e) => {
    e.preventDefault();
    if (!newItem.name || !newItem.basePrice) return toast.error("Name & Base Price required");

    try {
      await addDoc(collection(db, "products"), {
        ...newItem,
        basePrice: parseFloat(newItem.basePrice),
        createdAt: new Date()
      });
      toast.success("Item Added Successfully!");
      setNewItem(initialForm); 
    } catch (err) {
      toast.error("Failed to add");
    }
  };

  // Helper to add a size to the list
  const addSize = () => {
    if(tempSize.name && tempSize.price) {
      setNewItem({ ...newItem, sizes: [...newItem.sizes, { ...tempSize, price: parseFloat(tempSize.price)}] });
      setTempSize({ name: '', price: '' });
    }
  };

  // Helper to add an extra to the list
  const addExtra = () => {
    if(tempExtra.name && tempExtra.price) {
      setNewItem({ ...newItem, extras: [...newItem.extras, { ...tempExtra, price: parseFloat(tempExtra.price)}] });
      setTempExtra({ name: '', price: '' });
    }
  };

  const removeArrayItem = (type, index) => {
    const updated = newItem[type].filter((_, i) => i !== index);
    setNewItem({ ...newItem, [type]: updated });
  };

  return (
    <div className="min-h-screen pt-24 px-4 pb-20 text-white">
      <div className="container mx-auto max-w-6xl">
        <h1 className="text-3xl font-serif font-bold mb-8">Admin Dashboard</h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
          {/* --- ADD ITEM FORM --- */}
          <div className="bg-white/5 p-6 rounded-xl border border-white/10 h-fit">
            <h3 className="text-xl font-bold mb-4 text-primary">Add New Item</h3>
            
            <div className="space-y-4">
              <input placeholder="Item Name (e.g. Zinger)" className="w-full bg-black/30 p-3 rounded border border-white/10 text-white" value={newItem.name} onChange={e => setNewItem({...newItem, name: e.target.value})} />
              
              <div className="grid grid-cols-2 gap-3">
                <input type="number" placeholder="Base Price (PKR)" className="bg-black/30 p-3 rounded border border-white/10 text-white" value={newItem.basePrice} onChange={e => setNewItem({...newItem, basePrice: e.target.value})} />
                <select className="bg-black/30 p-3 rounded border border-white/10 text-white" value={newItem.category} onChange={e => setNewItem({...newItem, category: e.target.value})}>
                  {['Burgers', 'Pizza', 'Wrapster', 'Crispy Chicken', 'Fries', 'Twister', 'Shawarma', 'Nuggets', 'Wings', 'Desserts', 'Beverages'].map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              <textarea placeholder="Description & Ingredients" className="w-full bg-black/30 p-3 rounded border border-white/10 text-white" value={newItem.description} onChange={e => setNewItem({...newItem, description: e.target.value})} />
              
              <input placeholder="Image URL" className="w-full bg-black/30 p-3 rounded border border-white/10 text-white" value={newItem.image} onChange={e => setNewItem({...newItem, image: e.target.value})} />

              {/* SIZES BUILDER */}
              <div className="p-4 bg-black/20 rounded border border-white/5">
                <p className="text-xs text-gray-400 mb-2 uppercase font-bold">Variations / Sizes (Optional)</p>
                <div className="flex gap-2 mb-2">
                  <input placeholder="Size (e.g. Large)" className="flex-1 bg-transparent border-b border-gray-600 text-sm p-1 text-white" value={tempSize.name} onChange={e => setTempSize({...tempSize, name: e.target.value})} />
                  <input placeholder="Price" type="number" className="w-20 bg-transparent border-b border-gray-600 text-sm p-1 text-white" value={tempSize.price} onChange={e => setTempSize({...tempSize, price: e.target.value})} />
                  <button onClick={addSize} type="button" className="text-primary font-bold"><FiPlus/></button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {newItem.sizes.map((s, i) => (
                    <span key={i} className="text-xs bg-primary/20 text-primary px-2 py-1 rounded flex items-center gap-2">
                      {s.name}: {s.price} <FiX className="cursor-pointer" onClick={() => removeArrayItem('sizes', i)} />
                    </span>
                  ))}
                </div>
              </div>

              {/* EXTRAS BUILDER */}
              <div className="p-4 bg-black/20 rounded border border-white/5">
                <p className="text-xs text-gray-400 mb-2 uppercase font-bold">Add-ons / Extras (Optional)</p>
                <div className="flex gap-2 mb-2">
                  <input placeholder="Extra (e.g. Cheese)" className="flex-1 bg-transparent border-b border-gray-600 text-sm p-1 text-white" value={tempExtra.name} onChange={e => setTempExtra({...tempExtra, name: e.target.value})} />
                  <input placeholder="Price" type="number" className="w-20 bg-transparent border-b border-gray-600 text-sm p-1 text-white" value={tempExtra.price} onChange={e => setTempExtra({...tempExtra, price: e.target.value})} />
                  <button onClick={addExtra} type="button" className="text-primary font-bold"><FiPlus/></button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {newItem.extras.map((s, i) => (
                    <span key={i} className="text-xs bg-orange-500/20 text-orange-400 px-2 py-1 rounded flex items-center gap-2">
                      {s.name}: {s.price} <FiX className="cursor-pointer" onClick={() => removeArrayItem('extras', i)} />
                    </span>
                  ))}
                </div>
              </div>

              <button onClick={handleAddProduct} className="w-full bg-primary text-black font-bold py-4 rounded-lg hover:bg-white transition-colors">
                PUBLISH ITEM
              </button>
            </div>
          </div>

          {/* ITEM LIST */}
          <div className="space-y-2 max-h-[800px] overflow-y-auto">
            {products.map(p => (
              <div key={p.id} className="flex items-center gap-4 bg-white/5 p-3 rounded border border-white/10">
                <img src={p.image} className="w-12 h-12 rounded bg-black object-cover" />
                <div className="flex-1">
                  <h4 className="font-bold text-white">{p.name}</h4>
                  <p className="text-xs text-gray-400">{p.sizes?.length > 0 ? `${p.sizes.length} Sizes` : `Rs. ${p.basePrice}`}</p>
                </div>
                <button onClick={() => deleteDoc(doc(db, "products", p.id))} className="text-red-500 hover:bg-red-500/20 p-2 rounded"><FiTrash2/></button>
              </div>
            ))}
          </div>

        </div>
      </div>
    </div>
  );
}