import { useEffect, useState } from 'react';
import { db } from '../../lib/firebase';
import { collection, deleteDoc, addDoc, doc, updateDoc, onSnapshot, writeBatch } from 'firebase/firestore';
import { toast } from 'react-hot-toast';
import { FiBox, FiTrash2, FiEdit2, FiUpload, FiPlus, FiPrinter, FiDownload, FiZap } from 'react-icons/fi';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('orders'); 
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  
  // --- 1. DATA FETCHING ---
  useEffect(() => {
    const unsubOrders = onSnapshot(collection(db, "orders"), (snap) => {
      const all = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      all.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
      setOrders(all);
    });

    const unsubMenu = onSnapshot(collection(db, "products"), (snap) => {
      setProducts(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });

    return () => { unsubOrders(); unsubMenu(); };
  }, []);

  const handleStatusUpdate = async (orderId, newStatus) => {
    await updateDoc(doc(db, "orders", orderId), { status: newStatus });
    toast.success("Updated");
  };

  // --- RECEIPT LOGIC ---
  const generateReceipt = (order, type) => {
    const receiptContent = `
      <html>
        <head>
          <title>Receipt #${order.id.slice(-5)}</title>
          <style>
            body { font-family: monospace; padding: 20px; max-width: 300px; margin: 0 auto; }
            .header { text-align: center; border-bottom: 1px dashed #000; padding-bottom: 10px; margin-bottom: 10px; }
            .item { display: flex; justify-content: space-between; margin-bottom: 5px; }
            .total { border-top: 1px dashed #000; margin-top: 10px; padding-top: 10px; font-weight: bold; text-align: right; }
            .footer { margin-top: 20px; text-align: center; font-size: 10px; }
          </style>
        </head>
        <body>
          <div class="header">
            <h2>AURA TASTE</h2>
            <p>Order #${order.id.slice(-5).toUpperCase()}</p>
            <p>${new Date(order.createdAt?.seconds * 1000).toLocaleString()}</p>
          </div>
          <div>
            <p><strong>Customer:</strong> ${order.customer?.name}</p>
            <p><strong>Phone:</strong> ${order.customer?.phone}</p>
            <p><strong>Address:</strong> ${order.customer?.address}</p>
          </div>
          <hr/>
          ${order.items.map(item => `
            <div class="item">
              <span>${item.qty}x ${item.name} <br/><small>${item.selectedSize || ''}</small></span>
              <span>${item.price * item.qty}</span>
            </div>
          `).join('')}
          <div class="total">
            TOTAL: Rs. ${order.totalAmount}
          </div>
          <div class="footer">Thank you for dining with Aura!</div>
        </body>
      </html>
    `;

    if (type === 'print') {
      const win = window.open('', '', 'width=400,height=600');
      win.document.write(receiptContent);
      win.document.close();
      win.print();
    } else {
      const blob = new Blob([receiptContent], { type: "text/html" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `Receipt-${order.id.slice(-5)}.html`;
      a.click();
    }
  };

  return (
    <div className="min-h-screen pt-20 md:pt-24 px-4 pb-20 text-white w-full max-w-[1600px] mx-auto overflow-x-hidden">
      
      {/* HEADER TABS */}
      <div className="flex gap-4 mb-8 border-b border-white/10 pb-4 overflow-x-auto">
        <button onClick={() => setActiveTab('orders')} className={`whitespace-nowrap px-6 py-2 rounded-lg font-bold ${activeTab === 'orders' ? 'bg-primary text-black' : 'text-gray-400'}`}>Live Orders</button>
        <button onClick={() => setActiveTab('menu')} className={`whitespace-nowrap px-6 py-2 rounded-lg font-bold ${activeTab === 'menu' ? 'bg-primary text-black' : 'text-gray-400'}`}>Menu Admin</button>
      </div>

      {/* === ORDERS VIEW === */}
      {activeTab === 'orders' && (
        <div className="grid grid-cols-1 gap-4">
          {orders.length === 0 && <div className="text-gray-500">No active orders found.</div>}
          {orders.map(order => (
            <div key={order.id} className="bg-white/5 border border-white/10 p-4 md:p-6 rounded-xl flex flex-col xl:flex-row gap-6 justify-between items-start">
              
              {/* 1. CUSTOMER DETAILS */}
              <div className="min-w-[250px] space-y-1">
                <h3 className="text-xl font-bold text-primary mb-2">#{order.id.slice(-5).toUpperCase()}</h3>
                <p className="text-xs text-gray-400">{new Date(order.createdAt?.seconds * 1000).toLocaleString()}</p>
                <div className="bg-black/30 p-3 rounded mt-2 text-sm border border-white/5">
                  <p><span className="text-gray-500">Name:</span> <strong>{order.customer?.name || "Guest"}</strong></p>
                  <p><span className="text-gray-500">Email:</span> {order.customer?.email || "N/A"}</p>
                  <p><span className="text-gray-500">Phone:</span> {order.customer?.phone || "N/A"}</p>
                  <p><span className="text-gray-500">Addr:</span> {order.customer?.address || "Pickup"}</p>
                </div>
              </div>

              {/* 2. ORDER ITEMS */}
              <div className="flex-1 bg-black/20 p-4 rounded-lg w-full">
                {order.items?.map((item, idx) => (
                  <div key={idx} className="flex justify-between border-b border-white/5 pb-2 mb-2 text-sm md:text-base">
                    <span><span className="font-bold text-primary">{item.qty}x</span> {item.name} <span className="text-xs text-gray-500">{item.selectedSize ? `(${item.selectedSize})` : ''}</span></span>
                    <span>Rs. {item.price * item.qty}</span>
                  </div>
                ))}
                <div className="text-right font-bold text-lg mt-2 text-primary">Total: Rs. {order.totalAmount}</div>
                
                {/* RECEIPT BUTTONS */}
                <div className="flex gap-2 justify-end mt-4 pt-4 border-t border-white/10">
                   <button onClick={() => generateReceipt(order, 'print')} className="flex items-center gap-2 bg-white/10 hover:bg-white/20 px-3 py-2 rounded text-sm"><FiPrinter/> Print</button>
                   <button onClick={() => generateReceipt(order, 'download')} className="flex items-center gap-2 bg-white/10 hover:bg-white/20 px-3 py-2 rounded text-sm"><FiDownload/> Download</button>
                </div>
              </div>

              {/* 3. STATUS */}
              <div className="w-full xl:w-[200px]">
                 <select value={order.status || 'Pending'} onChange={(e) => handleStatusUpdate(order.id, e.target.value)} className="w-full bg-black border border-primary rounded p-3 text-white font-bold">
                  {['Pending', 'Approved', 'In Kitchen', 'Finishing', 'Delivering', 'Completed'].map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* === MENU VIEW === */}
      {activeTab === 'menu' && <AddItemForm products={products} />}
    </div>
  );
}

// ... AddItemForm component remains the same as previous (Dark theme, Image upload, etc.)
// (Paste the AddItemForm from the previous message here if you need the full file combined, 
//  but typically I assume you keep the bottom half I sent previously).
function AddItemForm({ products }) {
  // ... (Same as previous "Dark Box" code) ...
  // To save space in this response, use the AddItemForm from the PREVIOUS message.
  // It is perfectly compatible.
   const initial = { 
    name: '', category: 'Burgers', basePrice: '', sizes: [], extras: [], image: '', 
    description: '', tag: 'None', customFields: [] 
  };
  const [item, setItem] = useState(initial);
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(null);

  // Inputs
  const [tempSize, setTempSize] = useState({ name: '', price: '' });
  const [tempExtra, setTempExtra] = useState({ name: '', price: '', image: '' });
  const [customType, setCustomType] = useState('text');
  const [tempCustom, setTempCustom] = useState({ label: '', value: '', image: '' });

  const handleImageUpload = (e, callback) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => callback(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handlePublish = async () => {
    if(!item.name) return toast.error("Name Required");
    try {
      const payload = { ...item, createdAt: new Date() };
      if(isEditing) {
        await updateDoc(doc(db, "products", editId), item);
        toast.success("Item Updated");
        setIsEditing(false);
      } else {
        await addDoc(collection(db, "products"), payload);
        toast.success("Item Created");
      }
      setItem(initial);
    } catch(e) { toast.error("Error Saving"); }
  };

  const handleEdit = (p) => {
    setItem(p); setIsEditing(true); setEditId(p.id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const addCustomBox = () => {
    if(!tempCustom.label) return toast.error("Label needed");
    setItem({
      ...item,
      customFields: [...(item.customFields || []), { ...tempCustom, type: customType }]
    });
    setTempCustom({ label: '', value: '', image: '' });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* FORM */}
      <div className="bg-[#111] p-4 md:p-8 rounded-xl border border-white/10 shadow-2xl h-fit w-full">
        <h2 className="text-xl md:text-2xl font-bold text-yellow-400 mb-6">{isEditing ? 'Edit Item' : 'Add New Item'}</h2>
        
        <div className="space-y-5">
          <div><label className="text-xs text-gray-500 mb-1 block">Name</label><input className="w-full bg-[#222] border border-white/10 rounded p-3 text-white focus:border-yellow-400 outline-none" value={item.name} onChange={e => setItem({...item, name: e.target.value})} /></div>

          <div className="flex flex-col md:flex-row gap-4">
             <div className="w-full md:w-1/2"><label className="text-xs text-gray-500 mb-1 block">Category</label><select className="w-full bg-[#222] border border-white/10 rounded p-3 text-white outline-none" value={item.category} onChange={e => setItem({...item, category: e.target.value, sizes: []})}>{['Burgers', 'Pizza', 'Wrapster', 'Crispy Chicken', 'Fries', 'Twister', 'Shawarma', 'Nuggets', 'Wings', 'Desserts', 'Beverages'].map(c => <option key={c} value={c}>{c}</option>)}</select></div>
             <div className="w-full md:w-1/2"><label className="text-xs text-gray-500 mb-1 block">Base Price</label><input type="number" className="w-full bg-[#222] border border-white/10 rounded p-3 text-white outline-none" value={item.basePrice} onChange={e => setItem({...item, basePrice: e.target.value})} /></div>
          </div>

          <div><label className="text-xs text-gray-500 mb-1 block">Main Image</label><div className="flex gap-2"><input className="flex-1 bg-[#222] border border-white/10 rounded p-3 text-white text-sm outline-none" placeholder="Paste URL or Upload ->" value={item.image} onChange={e => setItem({...item, image: e.target.value})} /><label className="bg-white/10 px-4 flex items-center justify-center rounded cursor-pointer hover:bg-white/20"><FiUpload /><input type="file" className="hidden" onChange={(e) => handleImageUpload(e, (url) => setItem({...item, image: url}))}/></label></div>{item.image && <img src={item.image} className="w-16 h-16 mt-2 rounded object-cover border border-white/20" />}</div>

          <div><label className="text-xs text-gray-500 mb-1 block">Ingredients / Description</label><textarea className="w-full bg-[#222] border border-white/10 rounded p-3 text-white h-20 outline-none" value={item.description} onChange={e => setItem({...item, description: e.target.value})} /></div>

          {(item.category === 'Pizza' || item.category === 'Beverages') && (
            <div className="bg-[#1a1a1a] p-3 md:p-4 rounded border border-white/5"><label className="text-xs font-bold text-yellow-400 uppercase block mb-2">Sizes</label><div className="flex gap-2 mb-2"><input placeholder="Size (Small)" className="bg-[#222] text-white p-2 rounded w-1/2 text-sm" value={tempSize.name} onChange={e => setTempSize({...tempSize, name: e.target.value})} /><input placeholder="Price" className="bg-[#222] text-white p-2 rounded w-1/3 text-sm" value={tempSize.price} onChange={e => setTempSize({...tempSize, price: e.target.value})} /><button onClick={() => { setItem({...item, sizes: [...item.sizes, { ...tempSize, price: parseFloat(tempSize.price)}]}); setTempSize({name:'', price:''}) }} className="bg-yellow-400 text-black px-3 rounded font-bold">+</button></div><div className="flex flex-wrap gap-2">{item.sizes.map((s, i) => <span key={i} className="text-xs bg-blue-900 text-blue-200 px-2 py-1 rounded">{s.name}: {s.price}</span>)}</div></div>
          )}

          <div className="bg-[#1a1a1a] p-3 md:p-4 rounded border border-white/5"><label className="text-xs font-bold text-orange-500 uppercase block mb-2">Extra Toppings</label><div className="flex flex-col gap-2 mb-2"><div className="flex gap-2"><input placeholder="Name (Cheese)" className="bg-[#222] text-white p-2 rounded w-1/2 text-sm" value={tempExtra.name} onChange={e => setTempExtra({...tempExtra, name: e.target.value})} /><input placeholder="Price" className="bg-[#222] text-white p-2 rounded w-1/2 text-sm" value={tempExtra.price} onChange={e => setTempExtra({...tempExtra, price: e.target.value})} /></div><div className="flex gap-2"><label className="flex-1 bg-white/5 p-2 rounded text-xs text-gray-400 cursor-pointer flex items-center justify-center gap-2 border border-white/10 hover:bg-white/10"><FiUpload /> {tempExtra.image ? "Image Loaded" : "Upload Top Image"}<input type="file" className="hidden" onChange={(e) => handleImageUpload(e, (url) => setTempExtra({...tempExtra, image: url}))} /></label><button onClick={() => { setItem({...item, extras: [...item.extras, { ...tempExtra, price: parseFloat(tempExtra.price)}]}); setTempExtra({name:'', price:'', image: ''}) }} className="bg-yellow-400 text-black px-4 rounded font-bold">Add</button></div></div><div className="flex flex-wrap gap-2">{item.extras.map((s, i) => <span key={i} className="text-xs bg-orange-900 text-orange-200 px-2 py-1 rounded flex items-center gap-1">{s.image && <img src={s.image} className="w-4 h-4 rounded-full"/>}{s.name}: {s.price}</span>)}</div></div>

          <div className="bg-[#1a1a1a] p-3 md:p-4 rounded border border-yellow-400/30"><label className="text-xs font-bold text-yellow-400 uppercase block mb-2">Add Custom Box</label><div className="flex gap-2 mb-2"><select className="bg-[#222] text-white p-2 rounded text-sm w-1/3" value={customType} onChange={e => setCustomType(e.target.value)}><option value="text">Text Info</option><option value="number">Price Adder</option></select><input placeholder="Label" className="bg-[#222] text-white p-2 rounded text-sm w-1/3" value={tempCustom.label} onChange={e => setTempCustom({...tempCustom, label: e.target.value})} /><input placeholder="Value" className="bg-[#222] text-white p-2 rounded text-sm w-1/3" value={tempCustom.value} onChange={e => setTempCustom({...tempCustom, value: e.target.value})} /></div><div className="flex gap-2 mb-2"><label className="flex-1 bg-white/5 p-2 rounded text-xs text-gray-400 cursor-pointer flex items-center justify-center gap-2 border border-white/10"><FiUpload /> {tempCustom.image ? "Img Loaded" : "Upload Img"}<input type="file" className="hidden" onChange={(e) => handleImageUpload(e, (url) => setTempCustom({...tempCustom, image: url}))} /></label><button onClick={addCustomBox} className="bg-white/10 text-yellow-400 px-4 rounded font-bold hover:bg-white/20"><FiPlus /></button></div><div className="flex flex-wrap gap-2 mt-3">{item.customFields?.map((f, i) => <div key={i} className="bg-white/5 border border-white/20 px-3 py-1 rounded text-xs flex items-center gap-2">{f.image && <img src={f.image} className="w-4 h-4 rounded"/>}<span className="text-gray-300">{f.label}: {f.value}</span></div>)}</div></div>

          <div className="flex gap-2 flex-wrap">{['None', 'Fire 🔥', 'Delicious 😋', 'Star ⭐'].map(tag => <button key={tag} onClick={() => setItem({...item, tag})} className={`px-3 py-2 rounded text-xs border ${item.tag === tag ? 'bg-yellow-400 text-black border-yellow-400' : 'bg-[#222] border-white/10'}`}>{tag}</button>)}</div>

          <button onClick={handlePublish} className="w-full bg-yellow-400 text-black font-bold py-4 rounded-xl hover:bg-yellow-300 transition-colors shadow-lg">{isEditing ? 'UPDATE ITEM' : 'PUBLISH'}</button>
        </div>
      </div>
      
      {/* LIST */}
      <div className="bg-[#111] border border-white/10 p-4 md:p-6 rounded-xl h-[500px] md:h-[800px] overflow-y-auto"><h3 className="font-bold text-white mb-4">Existing Items</h3>{products.map(p => <div key={p.id} className="flex justify-between items-center p-3 border-b border-white/10 hover:bg-white/5 transition-colors"><div className="flex items-center gap-3"><img src={p.image} className="w-10 h-10 rounded object-cover bg-black" /><div><p className="font-bold text-sm text-white">{p.name}</p><p className="text-xs text-gray-500">{p.category}</p></div></div><div className="flex gap-2"><button onClick={() => handleEdit(p)} className="bg-white/10 p-2 rounded text-yellow-400 hover:bg-white/20"><FiEdit2 /></button><button onClick={() => deleteDoc(doc(db, "products", p.id))} className="bg-white/10 p-2 rounded text-red-500 hover:bg-white/20"><FiTrash2 /></button></div></div>)}</div>
    </div>
  );
}