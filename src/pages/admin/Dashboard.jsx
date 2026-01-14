import { useEffect, useState } from 'react';
import { db } from '../../lib/firebase';
import { collection, updateDoc, deleteDoc, addDoc, doc, query, orderBy, onSnapshot } from 'firebase/firestore';
import { toast } from 'react-hot-toast';
import { FiPackage, FiTrash2, FiPlus, FiUpload, FiLink, FiRefreshCw } from 'react-icons/fi';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('orders');
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [imageMode, setImageMode] = useState('url'); 
  
  const categories = ['Burger', 'Pizza', 'Fries', 'Wrapsters', 'Fried Chicken', 'Nuggets', 'Sandwiches', 'Dips & Sides', 'Desserts', 'Drinks'];
  const orderStatuses = ['Pending', 'Approved', 'Making', 'Finishing', 'Delivering', 'Completed'];

  const [newProduct, setNewProduct] = useState({ name: '', price: '', category: 'Burger', image: '', description: '', details: '' });

  // REAL-TIME DATA LISTENER
  useEffect(() => {
    // 1. Live Orders
    const qOrders = query(collection(db, "orders"), orderBy("createdAt", "desc"));
    const unsubOrders = onSnapshot(qOrders, (snapshot) => {
      setOrders(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    // 2. Live Products
    const qProducts = query(collection(db, "products"));
    const unsubProducts = onSnapshot(qProducts, (snapshot) => {
      setProducts(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    return () => { unsubOrders(); unsubProducts(); };
  }, []);

  const handleStatusUpdate = async (orderId, newStatus) => {
    try { await updateDoc(doc(db, "orders", orderId), { status: newStatus }); toast.success("Updated!"); } 
    catch (error) { toast.error("Failed"); }
  };

  const handleRepairDatabase = async () => {
    if(!window.confirm("Reset all to Pending?")) return;
    const promises = orders.map(o => updateDoc(doc(db, "orders", o.id), { status: 'Pending' }));
    await Promise.all(promises);
    toast.success("Done");
  };

  const handleAddProduct = async (e) => {
    e.preventDefault();
    if(!newProduct.image) return toast.error("Image needed");
    try {
      await addDoc(collection(db, "products"), { ...newProduct, price: parseFloat(newProduct.price), createdAt: new Date() });
      toast.success("Added!");
      setNewProduct({ name: '', price: '', category: 'Burger', image: '', description: '', details: '' });
    } catch (error) { toast.error("Error"); }
  };

  const handleDeleteProduct = async (id) => {
    if (window.confirm("Delete?")) await deleteDoc(doc(db, "products", id));
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setNewProduct({ ...newProduct, image: reader.result });
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="min-h-screen text-white pt-24 px-4 pb-12">
      <div className="container mx-auto max-w-6xl">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-serif font-bold flex gap-2"><FiPackage className="text-primary"/> Command Center</h1>
          <div className="bg-white/5 p-1 rounded-lg flex gap-2">
            <button onClick={() => setActiveTab('orders')} className={`px-4 py-2 rounded text-xs font-bold ${activeTab === 'orders' ? 'bg-primary text-black' : ''}`}>ORDERS</button>
            <button onClick={() => setActiveTab('menu')} className={`px-4 py-2 rounded text-xs font-bold ${activeTab === 'menu' ? 'bg-primary text-black' : ''}`}>MENU</button>
          </div>
        </div>

        {activeTab === 'orders' && (
          <div className="bg-white/5 rounded-xl border border-white/10 overflow-hidden">
             <div className="p-4 flex justify-end"><button onClick={handleRepairDatabase} className="text-xs font-bold text-primary flex gap-2 items-center"><FiRefreshCw/> FIX BADGE</button></div>
             <div className="overflow-x-auto">
               <table className="w-full text-left">
                <thead className="bg-white/5 text-gray-300 border-b border-white/10">
                  <tr><th className="p-4 text-xs">ID</th><th className="p-4 text-xs">User</th><th className="p-4 text-xs">Items</th><th className="p-4 text-xs">Status</th><th className="p-4 text-xs">Action</th></tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {orders.map(order => (
                    <tr key={order.id} className="hover:bg-white/5">
                      <td className="p-4 font-mono text-primary">#{order.id.slice(0,5)}</td>
                      <td className="p-4 text-xs">{order.userEmail}</td>
                      <td className="p-4 text-xs text-gray-400">{order.items?.map(i => `${i.qty}x ${i.name}`).join(', ')}</td>
                      <td className="p-4"><span className="px-2 py-1 rounded text-[10px] font-bold bg-primary/20 text-primary">{order.status}</span></td>
                      <td className="p-4">
                        <select className="bg-black/50 border border-white/20 rounded px-2 py-1 text-xs text-white" value={order.status} onChange={(e) => handleStatusUpdate(order.id, e.target.value)}>
                          {orderStatuses.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'menu' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="bg-white/5 p-6 rounded-xl border border-white/10 h-fit">
              <h3 className="text-xl font-bold mb-4 flex gap-2"><FiPlus className="text-primary"/> Add Item</h3>
              <form onSubmit={handleAddProduct} className="space-y-4">
                <input placeholder="Name (e.g. Zinger)" required className="w-full bg-black/30 border border-white/10 p-3 rounded text-white" value={newProduct.name} onChange={e => setNewProduct({...newProduct, name: e.target.value})} />
                <div className="grid grid-cols-2 gap-4">
                  <input type="number" required placeholder="Price" className="bg-black/30 border border-white/10 p-3 rounded text-white" value={newProduct.price} onChange={e => setNewProduct({...newProduct, price: e.target.value})} />
                  <select className="bg-black/30 border border-white/10 p-3 rounded text-white" value={newProduct.category} onChange={e => setNewProduct({...newProduct, category: e.target.value})}>
                    {categories.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                {/* NEW FIELD: DETAILS */}
                <input placeholder="Details (e.g. Large, 500ml, 6 pcs)" className="w-full bg-black/30 border border-white/10 p-3 rounded text-white" value={newProduct.details} onChange={e => setNewProduct({...newProduct, details: e.target.value})} />
                
                <div className="flex gap-2"><button type="button" onClick={() => setImageMode('url')} className="flex-1 py-2 text-xs font-bold bg-white/5">URL</button><button type="button" onClick={() => setImageMode('file')} className="flex-1 py-2 text-xs font-bold bg-white/5">UPLOAD</button></div>
                {imageMode === 'url' ? <input placeholder="Image URL" className="w-full bg-black/30 border border-white/10 p-3 rounded text-white" value={newProduct.image} onChange={e => setNewProduct({...newProduct, image: e.target.value})} /> : <input type="file" onChange={handleImageUpload} className="w-full text-xs text-gray-400"/>}
                <button className="w-full bg-primary text-black font-bold py-3 rounded">ADD ITEM</button>
              </form>
            </div>
            <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
              {products.map(p => (
                <div key={p.id} className="bg-white/5 p-3 rounded-xl border border-white/10 flex items-center gap-4">
                  <img src={p.image} className="w-12 h-12 rounded object-cover bg-black" />
                  <div className="flex-1">
                    <h4 className="font-bold text-white">{p.name}</h4>
                    <p className="text-gray-400 text-xs">{p.category} • <span className="text-primary">${p.price}</span> {p.details && `• ${p.details}`}</p>
                  </div>
                  <button onClick={() => handleDeleteProduct(p.id)} className="text-red-500 hover:text-white"><FiTrash2 /></button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}