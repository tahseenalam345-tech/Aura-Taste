import { useEffect, useState } from 'react';
import { db } from '../../lib/firebase';
import { collection, deleteDoc, addDoc, doc, updateDoc, onSnapshot, query, orderBy, writeBatch } from 'firebase/firestore';
import { toast } from 'react-hot-toast';
import { FiBox, FiTrash2, FiZap, FiEdit2, FiCheck } from 'react-icons/fi';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('orders'); 
  const [orderSubTab, setOrderSubTab] = useState('Pending'); // Capitalized to match DB
  
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  
  // --- 1. ROBUST ORDER FETCHING (Fixes Missing Orders) ---
  useEffect(() => {
    if (activeTab === 'orders') {
      // Simple Query: Get all orders sorted by time. We filter locally to prevent index errors.
      const q = query(collection(db, "orders"), orderBy("createdAt", "desc"));
      
      const unsub = onSnapshot(q, (snap) => {
        const allOrders = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        setOrders(allOrders);
      }, (error) => {
        console.error("Order Fetch Error:", error);
        toast.error("Connection Error: Check Console");
      });
      return () => unsub();
    }
    
    if (activeTab === 'menu') {
      const unsub = onSnapshot(collection(db, "products"), (snap) => {
        setProducts(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      });
      return () => unsub();
    }
  }, [activeTab]);

  // Filter Orders locally for speed and reliability
  const filteredOrders = orders.filter(o => {
    if (orderSubTab === 'Pending') return o.status === 'Pending';
    if (orderSubTab === 'In Progress') return ['Approved', 'In Kitchen', 'Finishing', 'Delivering'].includes(o.status);
    if (orderSubTab === 'Completed') return o.status === 'Completed';
    return true;
  });

  // --- MAGIC BUTTON ---
  const generateDummyData = async () => {
    if (!window.confirm("⚠️ Add dummy items?")) return;
    const batch = writeBatch(db);
    const categories = [
      { name: "Burgers", items: ["Beef Smash", "Chicken Zinger"] },
      { name: "Pizza", items: ["Chicken Fajita", "Beef Peperoni"] },
      { name: "Beverages", items: ["Pepsi", "7Up"] }
    ];

    categories.forEach(cat => {
      cat.items.forEach(itemName => {
        const newRef = doc(collection(db, "products"));
        let sizes = [], extras = [{ name: "Cheese", price: 50 }];
        if(cat.name === "Pizza") sizes = [{ name: "Small", price: 500 }, { name: "Large", price: 1500 }];
        if(cat.name === "Beverages") { sizes = [{ name: "Reg", price: 100 }]; extras = []; }

        batch.set(newRef, {
          name: itemName, category: cat.name, basePrice: 350, description: "Tasty food.",
          image: "https://cdn-icons-png.flaticon.com/512/3075/3075977.png",
          sizes, extras, createdAt: new Date()
        });
      });
    });
    await batch.commit();
    toast.success("Done!");
  };

  const handleStatusUpdate = async (orderId, newStatus) => {
    await updateDoc(doc(db, "orders", orderId), { status: newStatus });
    toast.success("Updated!");
  };

  return (
    <div className="min-h-screen pt-24 px-4 pb-20 text-white w-full max-w-[1600px] mx-auto">
      
      {/* TABS */}
      <div className="flex gap-4 mb-8 border-b border-white/10 pb-4">
        <button onClick={() => setActiveTab('orders')} className={`px-6 py-2 rounded-lg font-bold ${activeTab === 'orders' ? 'bg-primary text-black' : 'text-gray-400'}`}>Live Orders</button>
        <button onClick={() => setActiveTab('menu')} className={`px-6 py-2 rounded-lg font-bold ${activeTab === 'menu' ? 'bg-primary text-black' : 'text-gray-400'}`}>Menu Management</button>
      </div>

      {/* === ORDERS VIEW === */}
      {activeTab === 'orders' && (
        <div>
          <div className="flex gap-2 mb-6">
            {['Pending', 'In Progress', 'Completed'].map(tab => (
              <button key={tab} onClick={() => setOrderSubTab(tab)} className={`px-4 py-2 rounded border font-bold ${orderSubTab === tab ? 'bg-primary text-black border-primary' : 'border-white/20'}`}>
                {tab}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 gap-4">
            {filteredOrders.length === 0 && <div className="text-gray-500">No orders in {orderSubTab}</div>}
            
            {filteredOrders.map(order => (
              <div key={order.id} className="bg-white/5 border border-white/10 p-6 rounded-xl flex flex-col lg:flex-row gap-6 justify-between items-start">
                <div className="min-w-[250px]">
                  <h3 className="text-xl font-bold text-primary mb-2">Order #{order.id.slice(-5).toUpperCase()}</h3>
                  <div className="text-sm text-gray-300">
                    <p><strong>Customer:</strong> {order.customer?.name || "Guest"}</p>
                    <p><strong>Phone:</strong> {order.customer?.phone || "--"}</p>
                    <p><strong>Address:</strong> {order.customer?.address || "Pickup"}</p>
                  </div>
                </div>

                <div className="flex-1 bg-black/20 p-4 rounded-lg w-full">
                  {order.items?.map((item, idx) => (
                    <div key={idx} className="flex justify-between border-b border-white/5 pb-2 mb-2">
                      <span className="font-bold text-white">{item.qty}x {item.name}</span>
                      <span className="text-primary">Rs. {item.price * item.qty}</span>
                    </div>
                  ))}
                  <div className="text-right font-bold text-lg mt-2">Total: Rs. {order.totalAmount}</div>
                </div>

                <div className="min-w-[200px]">
                   <select 
                    value={order.status} 
                    onChange={(e) => handleStatusUpdate(order.id, e.target.value)} 
                    className="w-full bg-black border border-primary rounded p-3 text-white font-bold"
                  >
                    {['Pending', 'Approved', 'In Kitchen', 'Finishing', 'Delivering', 'Completed'].map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* === MENU VIEW === */}
      {activeTab === 'menu' && (
        <>
          <button onClick={generateDummyData} className="mb-8 bg-green-700 text-white px-6 py-3 rounded font-bold flex gap-2 items-center"><FiZap/> Add Dummy Items</button>
          <AddItemForm products={products} />
        </>
      )}
    </div>
  );
}

// --- ADD ITEM FORM (Copied & Optimized from previous) ---
function AddItemForm({ products }) {
  const initial = { name: '', category: 'Burgers', basePrice: '', sizes: [], extras: [], image: '' };
  const [item, setItem] = useState(initial);
  const [temp, setTemp] = useState({ name: '', price: '' });

  const handlePublish = async () => {
    if(!item.name) return toast.error("Name needed");
    await addDoc(collection(db, "products"), { ...item, basePrice: parseFloat(item.basePrice), createdAt: new Date() });
    toast.success("Saved");
    setItem(initial);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <div className="bg-white/5 p-8 rounded-xl border border-white/10">
        <h2 className="text-2xl font-bold text-primary mb-6">Add New Item</h2>
        <div className="space-y-4">
          <input placeholder="Name" className="w-full bg-black/40 p-3 rounded text-white border border-white/10" value={item.name} onChange={e => setItem({...item, name: e.target.value})} />
          <div className="flex gap-4">
             <input placeholder="Price" type="number" className="w-1/2 bg-black/40 p-3 rounded text-white border border-white/10" value={item.basePrice} onChange={e => setItem({...item, basePrice: e.target.value})} />
             <select className="w-1/2 bg-black/40 p-3 rounded text-white border border-white/10" value={item.category} onChange={e => setItem({...item, category: e.target.value})}>
               {['Burgers', 'Pizza', 'Beverages'].map(c => <option key={c} value={c}>{c}</option>)}
             </select>
          </div>
          <input placeholder="Image URL" className="w-full bg-black/40 p-3 rounded text-white border border-white/10" value={item.image} onChange={e => setItem({...item, image: e.target.value})} />
          
          {/* Sizes Input */}
          <div className="bg-black/20 p-4 rounded">
            <div className="flex gap-2">
              <input placeholder="Size (e.g. Small)" className="bg-black/40 text-white p-2 rounded" value={temp.name} onChange={e => setTemp({...temp, name: e.target.value})} />
              <input placeholder="Price" className="bg-black/40 text-white p-2 rounded w-20" value={temp.price} onChange={e => setTemp({...temp, price: e.target.value})} />
              <button onClick={() => { setItem({...item, sizes: [...item.sizes, { ...temp, price: parseFloat(temp.price)}]}); setTemp({name:'', price:''}) }} className="bg-primary text-black px-4 rounded font-bold">+</button>
            </div>
            <div className="flex gap-2 mt-2 flex-wrap">{item.sizes.map((s, i) => <span key={i} className="text-xs bg-primary text-black px-2 py-1 rounded">{s.name}: {s.price}</span>)}</div>
          </div>

          <button onClick={handlePublish} className="w-full bg-primary text-black font-bold py-4 rounded-xl">PUBLISH</button>
        </div>
      </div>
      
      <div className="bg-white/5 p-6 rounded-xl border border-white/10 h-[600px] overflow-y-auto">
         <h3 className="font-bold text-white mb-4">Items</h3>
         {products.map(p => (
           <div key={p.id} className="flex justify-between p-3 border-b border-white/10">
             <span>{p.name}</span>
             <button onClick={() => deleteDoc(doc(db, "products", p.id))} className="text-red-500"><FiTrash2/></button>
           </div>
         ))}
      </div>
    </div>
  );
}