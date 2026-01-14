import { useEffect, useState } from 'react';
import { db } from '../../lib/firebase';
import { collection, deleteDoc, addDoc, doc, updateDoc, onSnapshot, query, where, orderBy, writeBatch } from 'firebase/firestore';
import { toast } from 'react-hot-toast';
import { FiBox, FiTrash2, FiZap } from 'react-icons/fi';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('orders'); // 'orders' or 'menu'
  const [orderSubTab, setOrderSubTab] = useState('pending'); // 'pending', 'progress', 'completed'
  
  // Data State
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // --- 1. MAGIC BUTTON: GENERATE DUMMY DATA ---
  const generateDummyData = async () => {
    if (!window.confirm("⚠️ This will add many dummy items to your menu. Continue?")) return;
    
    const batch = writeBatch(db);
    const categories = [
      { name: "Burgers", items: ["Beef Smash", "Chicken Zinger", "Jalapeno Spark"] },
      { name: "Pizza", items: ["Chicken Fajita", "Beef Peperoni", "Cheesy Lover"] },
      { name: "Wrapster", items: ["Zinger Wrap", "BBQ Wrap", "Veggie Roll"] },
      { name: "Crispy Chicken", items: ["2pc Fried", "Bucket (9pc)", "Spicy Shots"] },
      { name: "Fries", items: ["Plain Fries", "Loaded Mayo", "Pizza Fries"] },
      { name: "Twister", items: ["Classic Twister", "Texan Twist", "Mayo Twist"] },
      { name: "Shawarma", items: ["Chicken Shawarma", "Platter", "Arabian Roll"] },
      { name: "Nuggets", items: ["6 Nuggets", "20 Nuggets", "Tempura Nuggets"] },
      { name: "Wings", items: ["BBQ Wings", "Honey Mustard", "Flaming Wings"] },
      { name: "Desserts", items: ["Choco Lava", "Ice Cream Cup", "Brownie"] },
      { name: "Beverages", items: ["Pepsi", "7Up", "Dew"] }
    ];

    categories.forEach(cat => {
      cat.items.forEach(itemName => {
        const newRef = doc(collection(db, "products"));
        let sizes = [];
        let extras = [{ name: "Extra Cheese", price: 50 }];
        let description = `Delicious ${itemName} made with premium ingredients.`;
        
        if(cat.name === "Pizza") {
           sizes = [{ name: "Small", price: 500 }, { name: "Medium", price: 1200 }, { name: "Large", price: 1800 }, { name: "Party", price: 2500 }];
        } else if (cat.name === "Beverages") {
           sizes = [{ name: "Regular", price: 100 }, { name: "Large", price: 150 }];
           extras = []; 
        }

        batch.set(newRef, {
          name: itemName,
          category: cat.name,
          basePrice: 350,
          description: description,
          includedItems: "",
          image: "https://cdn-icons-png.flaticon.com/512/3075/3075977.png", 
          sizes: sizes,
          extras: extras,
          createdAt: new Date()
        });
      });
    });

    try {
      await batch.commit();
      toast.success("⚡ Dummy Menu Created Successfully!");
    } catch(e) {
      toast.error("Error creating data");
    }
  };

  // --- 2. PERFORMANCE OPTIMIZED FETCHING ---
  useEffect(() => {
    if (activeTab === 'menu') {
      const unsub = onSnapshot(collection(db, "products"), (snap) => {
        setProducts(snap.docs.map(d => ({ id: d.id, ...d.data() })));
        setLoading(false);
      });
      return () => unsub();
    } 
    
    if (activeTab === 'orders') {
      let q;
      if (orderSubTab === 'pending') {
        q = query(collection(db, "orders"), where("status", "==", "Pending"), orderBy("createdAt", "desc"));
      } else if (orderSubTab === 'progress') {
        q = query(collection(db, "orders"), where("status", "in", ["Approved", "In Kitchen", "Finishing", "Delivering"]), orderBy("createdAt", "desc"));
      } else {
        q = query(collection(db, "orders"), where("status", "==", "Completed"), orderBy("createdAt", "desc")); 
      }

      const unsub = onSnapshot(q, (snap) => {
        setOrders(snap.docs.map(d => ({ id: d.id, ...d.data() })));
        setLoading(false);
      });
      return () => unsub();
    }
  }, [activeTab, orderSubTab]);


  // --- 3. STATUS HANDLING ---
  const handleStatusUpdate = async (orderId, newStatus) => {
    try {
      await updateDoc(doc(db, "orders", orderId), { status: newStatus });
      toast.success(`Order moved to ${newStatus}`);
    } catch (e) {
      toast.error("Error updating status");
    }
  };

  const statusColors = {
    'Pending': 'bg-red-500/20 text-red-500 border-red-500',
    'Approved': 'bg-blue-500/20 text-blue-500 border-blue-500',
    'In Kitchen': 'bg-orange-500/20 text-orange-500 border-orange-500',
    'Finishing': 'bg-yellow-500/20 text-yellow-500 border-yellow-500',
    'Delivering': 'bg-purple-500/20 text-purple-500 border-purple-500',
    'Completed': 'bg-green-500/20 text-green-500 border-green-500',
  };

  return (
    <div className="min-h-screen pt-24 px-4 pb-20 text-white w-full max-w-[1600px] mx-auto">
      
      {/* HEADER TABS */}
      <div className="flex gap-4 mb-8 border-b border-white/10 pb-4">
        <button onClick={() => setActiveTab('orders')} className={`px-6 py-2 rounded-lg font-bold text-lg ${activeTab === 'orders' ? 'bg-primary text-black' : 'text-gray-400 hover:text-white'}`}>Live Orders</button>
        <button onClick={() => setActiveTab('menu')} className={`px-6 py-2 rounded-lg font-bold text-lg ${activeTab === 'menu' ? 'bg-primary text-black' : 'text-gray-400 hover:text-white'}`}>Menu Management</button>
      </div>

      {/* === ORDERS VIEW === */}
      {activeTab === 'orders' && (
        <div>
          <div className="flex gap-2 mb-6">
            <button onClick={() => setOrderSubTab('pending')} className={`px-4 py-2 rounded border ${orderSubTab === 'pending' ? 'bg-red-600 border-red-600' : 'border-white/20'}`}>Pending</button>
            <button onClick={() => setOrderSubTab('progress')} className={`px-4 py-2 rounded border ${orderSubTab === 'progress' ? 'bg-blue-600 border-blue-600' : 'border-white/20'}`}>In Progress</button>
            <button onClick={() => setOrderSubTab('completed')} className={`px-4 py-2 rounded border ${orderSubTab === 'completed' ? 'bg-green-600 border-green-600' : 'border-white/20'}`}>Completed</button>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {orders.length === 0 && <div className="text-gray-500">No orders found.</div>}
            
            {orders.map(order => (
              <div key={order.id} className="bg-white/5 border border-white/10 p-6 rounded-xl flex flex-col lg:flex-row gap-6 justify-between items-start animate-fadeIn">
                <div className="min-w-[250px]">
                  <h3 className="text-xl font-bold text-primary mb-2">Order #{order.id.slice(-5).toUpperCase()}</h3>
                  <div className="text-sm text-gray-300 space-y-1">
                    <p><strong className="text-gray-500">Name:</strong> {order.customer?.name || "Guest"}</p>
                    <p><strong className="text-gray-500">Phone:</strong> {order.customer?.phone || "N/A"}</p>
                    <p><strong className="text-gray-500">Address:</strong> {order.customer?.address || "Dine-in/Takeaway"}</p>
                    <p><strong className="text-gray-500">Time:</strong> {order.createdAt?.toDate().toLocaleTimeString()}</p>
                  </div>
                </div>

                <div className="flex-1 bg-black/20 p-4 rounded-lg w-full">
                  <div className="space-y-2">
                    {order.items?.map((item, idx) => (
                      <div key={idx} className="flex justify-between items-center border-b border-white/5 pb-2 last:border-0">
                        <span className="font-bold">{item.qty}x {item.name}</span>
                        <div className="text-right">
                          <span className="block text-xs text-gray-400">{item.selectedSize} {item.selectedExtras?.length > 0 && `+ ${item.selectedExtras.join(', ')}`}</span>
                          <span className="text-primary font-bold">Rs. {item.price * item.qty}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-3 text-right text-xl font-bold border-t border-white/10 pt-2">Total: Rs. {order.totalAmount}</div>
                </div>

                <div className="min-w-[200px] flex flex-col gap-2">
                  <div className={`px-3 py-1 rounded border text-center font-bold text-sm ${statusColors[order.status] || 'border-white'}`}>{order.status}</div>
                  <select value={order.status} onChange={(e) => handleStatusUpdate(order.id, e.target.value)} className="bg-black border border-white/20 rounded p-2 text-white outline-none focus:border-primary">
                    <option value="Pending">Pending</option>
                    <option value="Approved">Approved</option>
                    <option value="In Kitchen">In Kitchen</option>
                    <option value="Finishing">Finishing</option>
                    <option value="Delivering">Delivering</option>
                    <option value="Completed">Completed</option>
                  </select>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* === MENU MANAGEMENT VIEW === */}
      {activeTab === 'menu' && (
        <>
          <button onClick={generateDummyData} className="w-full bg-gradient-to-r from-green-600 to-green-800 text-white p-4 rounded-xl mb-8 font-bold flex items-center justify-center gap-2 hover:scale-[1.01] transition-transform shadow-lg border border-green-500/30">
            <FiZap className="text-yellow-300 text-xl" /> CLICK ONCE: GENERATE ALL DUMMY ITEMS
          </button>
          <AddItemForm products={products} />
        </>
      )}
    </div>
  );
}

// --- SUB COMPONENT: ADD ITEM FORM ---
function AddItemForm({ products }) {
  const [newItem, setNewItem] = useState({ 
    name: '', category: 'Burgers', image: '', description: '', 
    basePrice: '', includedItems: '', sizes: [], extras: [], customFields: []
  });
  const [tempSize, setTempSize] = useState({ name: '', price: '' });
  const [tempExtra, setTempExtra] = useState({ name: '', price: '' });
  const [tempCustom, setTempCustom] = useState({ label: '', value: '' });

  const handlePublish = async () => {
    if (!newItem.name || !newItem.basePrice) return toast.error("Name & Price required");
    try {
      await addDoc(collection(db, "products"), { ...newItem, basePrice: parseFloat(newItem.basePrice), createdAt: new Date() });
      toast.success("Item Added!");
      setNewItem({ ...newItem, name: '', basePrice: '' }); 
    } catch (e) { toast.error("Error"); }
  };

  const removeItem = (field, idx) => setNewItem(prev => ({ ...prev, [field]: prev[field].filter((_, i) => i !== idx) }));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <div className="bg-white/5 backdrop-blur-sm p-8 rounded-2xl border border-white/10 h-fit">
        <h2 className="text-2xl font-bold text-primary mb-6 flex items-center gap-2"><FiBox/> Add New Item</h2>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <input placeholder="Item Name" className="bg-black/40 border border-white/10 rounded p-3 text-white" value={newItem.name} onChange={e => setNewItem({...newItem, name: e.target.value})} />
            <input type="number" placeholder="Base Price (Rs)" className="bg-black/40 border border-white/10 rounded p-3 text-white" value={newItem.basePrice} onChange={e => setNewItem({...newItem, basePrice: e.target.value})} />
          </div>
          <select className="w-full bg-black/40 border border-white/10 rounded p-3 text-white" value={newItem.category} onChange={e => setNewItem({...newItem, category: e.target.value})}>
            {['Deals', 'Burgers', 'Pizza', 'Wrapster', 'Crispy Chicken', 'Fries', 'Twister', 'Shawarma', 'Nuggets', 'Wings', 'Desserts', 'Beverages'].map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <textarea placeholder="Included Items (For Deals)" className="w-full bg-black/40 border border-white/10 rounded p-3 text-white h-20" value={newItem.includedItems} onChange={e => setNewItem({...newItem, includedItems: e.target.value})} />
          <textarea placeholder="Description" className="w-full bg-black/40 border border-white/10 rounded p-3 text-white h-24" value={newItem.description} onChange={e => setNewItem({...newItem, description: e.target.value})} />
          <input placeholder="Image URL" className="w-full bg-black/40 border border-white/10 rounded p-3 text-white" value={newItem.image} onChange={e => setNewItem({...newItem, image: e.target.value})} />

          {/* DYNAMIC SECTIONS */}
          <div className="bg-black/20 p-4 rounded-xl border border-white/5 space-y-4">
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase">Sizes</label>
              <div className="flex gap-2 mt-2">
                <input placeholder="Size Name" className="flex-1 bg-black/40 p-2 rounded border border-white/10 text-sm" value={tempSize.name} onChange={e => setTempSize({...tempSize, name: e.target.value})} />
                <input placeholder="Price" type="number" className="w-24 bg-black/40 p-2 rounded border border-white/10 text-sm" value={tempSize.price} onChange={e => setTempSize({...tempSize, price: e.target.value})} />
                <button onClick={() => { if(tempSize.name) { setNewItem({...newItem, sizes: [...newItem.sizes, { ...tempSize, price: parseFloat(tempSize.price) }]}); setTempSize({name:'', price:''}); }}} className="bg-primary text-black px-3 rounded font-bold">+</button>
              </div>
              <div className="flex flex-wrap gap-2 mt-2">{newItem.sizes.map((s, i) => <span key={i} onClick={() => removeItem('sizes', i)} className="text-xs bg-blue-500/20 text-blue-400 px-2 py-1 rounded cursor-pointer">{s.name}: {s.price}</span>)}</div>
            </div>
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase">Extras</label>
              <div className="flex gap-2 mt-2">
                <input placeholder="Extra Name" className="flex-1 bg-black/40 p-2 rounded border border-white/10 text-sm" value={tempExtra.name} onChange={e => setTempExtra({...tempExtra, name: e.target.value})} />
                <input placeholder="Price" type="number" className="w-24 bg-black/40 p-2 rounded border border-white/10 text-sm" value={tempExtra.price} onChange={e => setTempExtra({...tempExtra, price: e.target.value})} />
                <button onClick={() => { if(tempExtra.name) { setNewItem({...newItem, extras: [...newItem.extras, { ...tempExtra, price: parseFloat(tempExtra.price) }]}); setTempExtra({name:'', price:''}); }}} className="bg-primary text-black px-3 rounded font-bold">+</button>
              </div>
              <div className="flex flex-wrap gap-2 mt-2">{newItem.extras.map((s, i) => <span key={i} onClick={() => removeItem('extras', i)} className="text-xs bg-orange-500/20 text-orange-400 px-2 py-1 rounded cursor-pointer">{s.name}: {s.price}</span>)}</div>
            </div>
          </div>
          <button onClick={handlePublish} className="w-full bg-primary text-black font-bold py-4 rounded-xl hover:scale-[1.01] transition-transform">PUBLISH TO MENU</button>
        </div>
      </div>
      <div className="bg-black/20 border border-white/10 p-6 rounded-2xl h-[800px] overflow-y-auto">
        <h3 className="font-bold text-white mb-4">Existing Items ({products.length})</h3>
        <div className="space-y-2">
          {products.map(p => (
            <div key={p.id} className="flex items-center gap-4 bg-white/5 p-3 rounded border border-white/10">
               <img src={p.image} className="w-10 h-10 rounded bg-black object-cover" />
               <div className="flex-1"><h4 className="font-bold text-sm text-white">{p.name}</h4><p className="text-xs text-gray-500">{p.category}</p></div>
               <button onClick={() => deleteDoc(doc(db, "products", p.id))} className="text-red-500 hover:bg-red-500/20 p-2 rounded"><FiTrash2/></button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}