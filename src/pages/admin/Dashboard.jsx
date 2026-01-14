import { useEffect, useState, useRef } from 'react';
import { db } from '../../lib/firebase';
import { collection, updateDoc, deleteDoc, addDoc, doc, query, orderBy, onSnapshot } from 'firebase/firestore';
import { toast } from 'react-hot-toast';
import { FiPackage, FiTrash2, FiPlus, FiVolume2, FiGrid, FiActivity } from 'react-icons/fi';

// Sound effect for new orders
const NOTIFICATION_SOUND = "https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3";

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('orders');
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [prevOrderCount, setPrevOrderCount] = useState(0);
  const audioRef = useRef(new Audio(NOTIFICATION_SOUND));

  // Form State
  const initialForm = { 
    name: '', category: 'Burger', image: '', description: '', 
    tag: 'None', // Fire, Star, etc.
    basePrice: '', // Base price in PKR
    sizes: [], // e.g. [{name: 'Large', price: 500}]
    extras: [] // e.g. [{name: 'Cheese', price: 100}]
  };
  const [newItem, setNewItem] = useState(initialForm);
  
  // Helpers for dynamic inputs
  const [tempSize, setTempSize] = useState({ name: '', price: '' });
  const [tempExtra, setTempExtra] = useState({ name: '', price: '' });

  // --- 1. REAL-TIME ORDERS & NOTIFICATIONS ---
  useEffect(() => {
    const q = query(collection(db, "orders"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const liveOrders = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setOrders(liveOrders);

      // Check for NEW orders to play sound
      if (liveOrders.length > prevOrderCount && prevOrderCount > 0) {
        audioRef.current.play().catch(e => console.log("Audio blocked:", e));
        toast("🔔 NEW ORDER RECEIVED!", { icon: '🔥', duration: 5000 });
      }
      setPrevOrderCount(liveOrders.length);
    });
    return () => unsubscribe();
  }, [prevOrderCount]);

  // --- 2. FETCH PRODUCTS ---
  useEffect(() => {
    const unsub = onSnapshot(collection(db, "products"), (snap) => {
      setProducts(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    return () => unsub();
  }, []);

  // --- 3. ACTIONS ---
  const handleStatusUpdate = async (id, status) => {
    await updateDoc(doc(db, "orders", id), { status });
    toast.success(`Order is now ${status}`);
  };

  const handleAddProduct = async (e) => {
    e.preventDefault();
    if (!newItem.name || !newItem.basePrice) return toast.error("Name & Price required");

    try {
      await addDoc(collection(db, "products"), {
        ...newItem,
        basePrice: parseFloat(newItem.basePrice),
        createdAt: new Date()
      });
      toast.success("Item Added Successfully!");
      setNewItem(initialForm); // RESET FORM completely
    } catch (err) {
      toast.error("Failed to add");
    }
  };

  // Add Size Variant Helper
  const addSize = () => {
    if(tempSize.name && tempSize.price) {
      setNewItem({ ...newItem, sizes: [...newItem.sizes, tempSize] });
      setTempSize({ name: '', price: '' });
    }
  };

  // Add Extra Helper
  const addExtra = () => {
    if(tempExtra.name && tempExtra.price) {
      setNewItem({ ...newItem, extras: [...newItem.extras, tempExtra] });
      setTempExtra({ name: '', price: '' });
    }
  };

  return (
    <div className="min-h-screen pt-24 px-4 pb-20 text-white">
      <div className="container mx-auto max-w-6xl">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 bg-white/5 p-6 rounded-2xl border border-white/10">
          <h1 className="text-3xl font-serif font-bold flex gap-3 items-center">
            <FiActivity className="text-green-500" /> ADMIN DASHBOARD
          </h1>
          <div className="flex gap-3 mt-4 md:mt-0">
             <button onClick={() => setActiveTab('orders')} className={`px-6 py-2 rounded-full font-bold text-xs tracking-widest ${activeTab === 'orders' ? 'bg-primary text-black' : 'bg-white/10'}`}>LIVE ORDERS</button>
             <button onClick={() => setActiveTab('menu')} className={`px-6 py-2 rounded-full font-bold text-xs tracking-widest ${activeTab === 'menu' ? 'bg-primary text-black' : 'bg-white/10'}`}>MANAGE MENU</button>
          </div>
        </div>

        {/* --- ORDERS TAB --- */}
        {activeTab === 'orders' && (
          <div className="space-y-4">
             {orders.map(order => (
               <div key={order.id} className="bg-white/5 border border-white/10 p-6 rounded-xl flex flex-col md:flex-row justify-between gap-6 animate-fadeIn">
                 <div>
                    <h3 className="font-bold text-lg text-primary mb-1">Order #{order.id.slice(0,5).toUpperCase()}</h3>
                    <p className="text-sm text-gray-400 mb-2">{order.userEmail}</p>
                    <div className="space-y-1">
                      {order.items?.map((item, i) => (
                        <div key={i} className="text-sm">
                          <span className="font-bold text-white">{item.qty}x {item.name}</span>
                          {/* Show selected variants/extras if any */}
                          {(item.selectedSize || item.selectedExtras?.length > 0) && (
                            <div className="text-xs text-gray-400 ml-4">
                              {item.selectedSize && <span>Size: {item.selectedSize} </span>}
                              {item.selectedExtras && <span>(+ {item.selectedExtras.join(', ')})</span>}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                    <p className="mt-3 font-bold text-xl">Total: Rs. {order.totalAmount}</p>
                 </div>
                 
                 <div className="flex flex-col gap-2 min-w-[200px]">
                   <label className="text-xs uppercase text-gray-500 font-bold">Update Status</label>
                   <select 
                     value={order.status || 'Pending'} 
                     onChange={(e) => handleStatusUpdate(order.id, e.target.value)}
                     className={`p-3 rounded bg-black border ${order.status === 'Pending' ? 'border-red-500 text-red-500' : 'border-green-500 text-green-500'} font-bold outline-none`}
                   >
                     {['Pending', 'Approved', 'Kitchen', 'Delivery', 'Completed'].map(s => <option key={s} value={s}>{s}</option>)}
                   </select>
                 </div>
               </div>
             ))}
          </div>
        )}

        {/* --- MENU MANAGEMENT TAB (New Form) --- */}
        {activeTab === 'menu' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            {/* ADD ITEM FORM */}
            <div className="bg-white/5 p-6 rounded-xl border border-white/10 h-fit">
              <h3 className="text-xl font-bold mb-4 flex gap-2"><FiPlus className="text-primary"/> Add New Item</h3>
              
              <div className="space-y-3">
                <input placeholder="Item Name (e.g. Zinger)" className="w-full bg-black/30 p-3 rounded border border-white/10 text-white" value={newItem.name} onChange={e => setNewItem({...newItem, name: e.target.value})} />
                
                <div className="grid grid-cols-2 gap-3">
                  <input type="number" placeholder="Base Price (PKR)" className="bg-black/30 p-3 rounded border border-white/10 text-white" value={newItem.basePrice} onChange={e => setNewItem({...newItem, basePrice: e.target.value})} />
                  <select className="bg-black/30 p-3 rounded border border-white/10 text-white" value={newItem.category} onChange={e => setNewItem({...newItem, category: e.target.value})}>
                    {['Burger', 'Pizza', 'Fries', 'Drinks', 'Deals'].map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>

                {/* SPECIAL TAGS */}
                <div>
                  <label className="text-xs text-gray-400 uppercase">Special Tag (Shows icon on item)</label>
                  <div className="flex gap-2 mt-1">
                    {['None', 'Fire 🔥', 'Star ⭐', 'Delicious 😋'].map(tag => (
                      <button key={tag} onClick={() => setNewItem({...newItem, tag})} className={`px-3 py-1 rounded border text-xs ${newItem.tag === tag ? 'bg-primary text-black border-primary' : 'border-white/20'}`}>
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>

                <input placeholder="Image URL" className="w-full bg-black/30 p-3 rounded border border-white/10 text-white" value={newItem.image} onChange={e => setNewItem({...newItem, image: e.target.value})} />

                {/* SIZES BUILDER */}
                <div className="p-3 bg-black/20 rounded border border-white/5">
                  <p className="text-xs text-gray-400 mb-2 uppercase">Add Sizes (Optional)</p>
                  <div className="flex gap-2 mb-2">
                    <input placeholder="Size Name (Large)" className="w-1/2 bg-transparent border-b border-gray-600 text-sm p-1" value={tempSize.name} onChange={e => setTempSize({...tempSize, name: e.target.value})} />
                    <input placeholder="Price (1500)" type="number" className="w-1/3 bg-transparent border-b border-gray-600 text-sm p-1" value={tempSize.price} onChange={e => setTempSize({...tempSize, price: e.target.value})} />
                    <button onClick={addSize} type="button" className="text-green-500 font-bold">+</button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {newItem.sizes.map((s, i) => <span key={i} className="text-xs bg-white/10 px-2 py-1 rounded">{s.name}: {s.price}</span>)}
                  </div>
                </div>

                {/* EXTRAS BUILDER */}
                <div className="p-3 bg-black/20 rounded border border-white/5">
                  <p className="text-xs text-gray-400 mb-2 uppercase">Add Extras (Optional)</p>
                  <div className="flex gap-2 mb-2">
                    <input placeholder="Extra Name (Cheese)" className="w-1/2 bg-transparent border-b border-gray-600 text-sm p-1" value={tempExtra.name} onChange={e => setTempExtra({...tempExtra, name: e.target.value})} />
                    <input placeholder="Price (100)" type="number" className="w-1/3 bg-transparent border-b border-gray-600 text-sm p-1" value={tempExtra.price} onChange={e => setTempExtra({...tempExtra, price: e.target.value})} />
                    <button onClick={addExtra} type="button" className="text-green-500 font-bold">+</button>
                  </div>
                   <div className="flex flex-wrap gap-2">
                    {newItem.extras.map((s, i) => <span key={i} className="text-xs bg-white/10 px-2 py-1 rounded">{s.name}: {s.price}</span>)}
                  </div>
                </div>

                <button onClick={handleAddProduct} className="w-full bg-primary text-black font-bold py-4 rounded-lg hover:scale-[1.02] transition-transform">
                  SAVE PRODUCT
                </button>
              </div>
            </div>

            {/* PREVIEW LIST */}
            <div className="space-y-2 max-h-[800px] overflow-y-auto">
              {products.map(p => (
                <div key={p.id} className="flex items-center gap-4 bg-white/5 p-3 rounded border border-white/10">
                  <img src={p.image} className="w-12 h-12 rounded bg-black object-cover" />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold">{p.name}</h4>
                      {p.tag !== 'None' && <span className="text-xs bg-red-600 px-1 rounded">{p.tag}</span>}
                    </div>
                    <p className="text-xs text-gray-400">Rs. {p.basePrice}</p>
                  </div>
                  <button onClick={() => deleteDoc(doc(db, "products", p.id))} className="text-red-500 hover:bg-red-500/20 p-2 rounded"><FiTrash2/></button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}