
import React, { useState, useRef } from 'react';
import { Package, ClipboardList, TrendingUp, Users, Plus, Edit, Trash2, LogOut, CheckCircle, Upload, X } from 'lucide-react';
import { Product, Category, Order } from '../types';

interface AdminPanelProps {
  products: Product[];
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>;
  orders: Order[];
  setOrders: React.Dispatch<React.SetStateAction<Order[]>>;
}

const AdminPanel: React.FC<AdminPanelProps> = ({ products, setProducts, orders, setOrders }) => {
  const [activeTab, setActiveTab] = useState<'DASHBOARD' | 'PRODUCTS' | 'ORDERS'>('DASHBOARD');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  
  // Form States
  const [formData, setFormData] = useState({
    name: '',
    category: Category.RICE,
    price: '',
    unit: '',
    stock: '',
    description: '',
    image: 'https://picsum.photos/seed/grocery/400/300'
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  const totalSales = orders.reduce((sum, o) => sum + o.total, 0);

  const handleEditClick = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      category: product.category,
      price: product.price.toString(),
      unit: product.unit,
      stock: product.stock.toString(),
      description: product.description,
      image: product.image
    });
    setIsModalOpen(true);
  };

  const handleAddClick = () => {
    setEditingProduct(null);
    setFormData({
      name: '',
      category: Category.RICE,
      price: '',
      unit: '',
      stock: '',
      description: '',
      image: 'https://picsum.photos/seed/grocery/400/300'
    });
    setIsModalOpen(true);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, image: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newProductData: Product = {
      id: editingProduct ? editingProduct.id : Math.random().toString(36).substr(2, 9),
      name: formData.name,
      category: formData.category as Category,
      price: parseFloat(formData.price),
      unit: formData.unit,
      stock: parseInt(formData.stock),
      description: formData.description,
      image: formData.image
    };

    if (editingProduct) {
      setProducts(prev => prev.map(p => p.id === editingProduct.id ? newProductData : p));
    } else {
      setProducts(prev => [...prev, newProductData]);
    }

    setIsModalOpen(false);
    setEditingProduct(null);
  };

  const deleteProduct = (id: string) => {
    if (window.confirm('আপনি কি নিশ্চিত যে এই পণ্যটি ডিলিট করতে চান?')) {
      setProducts(prev => prev.filter(p => p.id !== id));
    }
  };

  const updateOrderStatus = (id: string, status: Order['status']) => {
    setOrders(prev => prev.map(o => o.id === id ? { ...o, status } : o));
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === 'admin123') {
      setIsAuthenticated(true);
    } else {
      alert('ভুল পাসওয়ার্ড!');
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto my-20 p-8 bg-white rounded-2xl shadow-xl border animate-fade-in">
        <h2 className="text-2xl font-bold text-center mb-6 text-emerald-800">অ্যাডমিন লগইন</h2>
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">পাসওয়ার্ড</label>
            <input 
              type="password" 
              className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none" 
              placeholder="পাসওয়ার্ড দিন"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <button className="w-full bg-emerald-600 text-white py-3 rounded-xl font-bold hover:bg-emerald-700 transition">প্রবেশ করুন</button>
        </form>
        <p className="mt-4 text-center text-xs text-gray-400">ডেমো পাসওয়ার্ড: admin123</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar */}
        <div className="w-full md:w-64 space-y-2">
          <button 
            onClick={() => setActiveTab('DASHBOARD')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition ${activeTab === 'DASHBOARD' ? 'bg-emerald-600 text-white shadow-md' : 'bg-white text-gray-600 hover:bg-emerald-50'}`}
          >
            <TrendingUp size={20} /> ড্যাশবোর্ড
          </button>
          <button 
            onClick={() => setActiveTab('PRODUCTS')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition ${activeTab === 'PRODUCTS' ? 'bg-emerald-600 text-white shadow-md' : 'bg-white text-gray-600 hover:bg-emerald-50'}`}
          >
            <Package size={20} /> পণ্য ম্যানেজমেন্ট
          </button>
          <button 
            onClick={() => setActiveTab('ORDERS')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition ${activeTab === 'ORDERS' ? 'bg-emerald-600 text-white shadow-md' : 'bg-white text-gray-600 hover:bg-emerald-50'}`}
          >
            <ClipboardList size={20} /> অর্ডারসমূহ
          </button>
          <hr className="my-4" />
          <button onClick={() => setIsAuthenticated(false)} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-red-500 hover:bg-red-50 transition">
            <LogOut size={20} /> লগআউট
          </button>
        </div>

        {/* Dashboard Content */}
        <div className="flex-grow">
          {activeTab === 'DASHBOARD' && (
            <div className="space-y-8 animate-fade-in">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white p-6 rounded-2xl border shadow-sm flex items-center gap-4">
                  <div className="bg-blue-100 text-blue-600 p-3 rounded-xl"><Package size={28} /></div>
                  <div><p className="text-gray-500 text-xs font-bold uppercase">মোট পণ্য</p><p className="text-2xl font-black">{products.length}</p></div>
                </div>
                <div className="bg-white p-6 rounded-2xl border shadow-sm flex items-center gap-4">
                  <div className="bg-emerald-100 text-emerald-600 p-3 rounded-xl"><ClipboardList size={28} /></div>
                  <div><p className="text-gray-500 text-xs font-bold uppercase">মোট অর্ডার</p><p className="text-2xl font-black">{orders.length}</p></div>
                </div>
                <div className="bg-white p-6 rounded-2xl border shadow-sm flex items-center gap-4">
                  <div className="bg-amber-100 text-amber-600 p-3 rounded-xl"><TrendingUp size={28} /></div>
                  <div><p className="text-gray-500 text-xs font-bold uppercase">মোট বিক্রয়</p><p className="text-2xl font-black">৳ {totalSales}</p></div>
                </div>
                <div className="bg-white p-6 rounded-2xl border shadow-sm flex items-center gap-4">
                  <div className="bg-purple-100 text-purple-600 p-3 rounded-xl"><Users size={28} /></div>
                  <div><p className="text-gray-500 text-xs font-bold uppercase">গ্রাহক</p><p className="text-2xl font-black">{new Set(orders.map(o => o.phone)).size}</p></div>
                </div>
              </div>

              <div className="bg-white rounded-2xl border shadow-sm p-6">
                <h3 className="text-xl font-bold mb-4">সাম্প্রতিক অর্ডারসমূহ</h3>
                {orders.length === 0 ? (
                  <p className="text-gray-400 italic">এখনও কোন অর্ডার পাওয়া যায়নি।</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="text-xs font-bold text-gray-400 uppercase tracking-wider border-b">
                          <th className="pb-3">আইডি</th>
                          <th className="pb-3">গ্রাহক</th>
                          <th className="pb-3 text-right">মোট টাকা</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        {orders.slice(0, 5).map(o => (
                          <tr key={o.id}>
                            <td className="py-4 font-medium text-emerald-600">#{o.id}</td>
                            <td className="py-4">{o.customerName}</td>
                            <td className="py-4 text-right font-bold">৳ {o.total}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'PRODUCTS' && (
            <div className="bg-white rounded-2xl border shadow-sm overflow-hidden animate-fade-in">
              <div className="p-6 border-b flex justify-between items-center bg-gray-50/50">
                <h3 className="text-xl font-bold">পণ্য তালিকা</h3>
                <button 
                  onClick={handleAddClick}
                  className="bg-emerald-600 text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2 hover:bg-emerald-700 transition"
                >
                  <Plus size={18} /> নতুন পণ্য যোগ করুন
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-gray-50 text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                      <th className="px-6 py-4">পণ্য</th>
                      <th className="px-6 py-4">ক্যাটাগরি</th>
                      <th className="px-6 py-4">দাম</th>
                      <th className="px-6 py-4">স্টক</th>
                      <th className="px-6 py-4 text-right">অ্যাকশন</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {products.map(p => (
                      <tr key={p.id} className="hover:bg-gray-50 transition">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <img src={p.image} className="w-10 h-10 rounded-lg object-cover bg-gray-100" />
                            <span className="font-bold text-gray-800">{p.name}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm font-medium text-gray-500">{p.category}</td>
                        <td className="px-6 py-4 font-bold text-emerald-700">৳ {p.price}</td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 rounded text-[10px] font-bold ${p.stock > 10 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                            {p.stock} {p.unit}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex justify-end gap-2">
                            <button 
                              onClick={() => handleEditClick(p)}
                              className="p-1.5 text-blue-500 hover:bg-blue-50 rounded-lg transition"
                            >
                              <Edit size={18} />
                            </button>
                            <button 
                              onClick={() => deleteProduct(p.id)} 
                              className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition"
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'ORDERS' && (
            <div className="space-y-4 animate-fade-in">
              {orders.length === 0 ? (
                <div className="bg-white p-20 text-center rounded-2xl border text-gray-400">অর্ডার নেই</div>
              ) : (
                orders.map(order => (
                  <div key={order.id} className="bg-white p-6 rounded-2xl border shadow-sm border-l-4 border-l-emerald-500">
                    <div className="flex flex-col md:flex-row justify-between mb-4 gap-4">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="text-lg font-bold">অর্ডার #{order.id}</h4>
                          <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                            order.status === 'Pending' ? 'bg-amber-100 text-amber-700' : 
                            order.status === 'Delivered' ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-700'
                          }`}>
                            {order.status === 'Pending' ? 'অপেক্ষমান' : order.status === 'Delivered' ? 'ডেলিভারি হয়েছে' : 'বাতিল'}
                          </span>
                        </div>
                        <p className="text-sm font-bold text-gray-700">{order.customerName} - {order.phone}</p>
                        <p className="text-sm text-gray-500">{order.address}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-black text-emerald-800">৳ {order.total}</p>
                        <p className="text-xs text-gray-400">{order.date}</p>
                      </div>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-4 mb-4">
                      <p className="text-xs font-bold text-gray-400 uppercase mb-2">পণ্য তালিকা</p>
                      <ul className="space-y-1">
                        {order.items.map(item => (
                          <li key={item.product.id} className="text-sm flex justify-between">
                            <span>{item.product.name} (x{item.quantity})</span>
                            <span className="font-bold">৳ {item.product.price * item.quantity}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="flex gap-2">
                      {order.status !== 'Delivered' && (
                        <button 
                          onClick={() => updateOrderStatus(order.id, 'Delivered')}
                          className="bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-emerald-700 transition"
                        >
                          <CheckCircle size={16} /> ডেলিভারি সম্পন্ন
                        </button>
                      )}
                      {order.status === 'Pending' && (
                        <button 
                          onClick={() => updateOrderStatus(order.id, 'Cancelled')}
                          className="bg-red-50 text-red-600 px-4 py-2 rounded-lg text-sm font-bold hover:bg-red-100 transition"
                        >
                          বাতিল করুন
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>

      {/* Product Modal (Add/Edit) */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in">
          <div className="bg-white w-full max-w-xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-6 border-b flex justify-between items-center bg-gray-50">
              <h3 className="text-xl font-bold text-gray-800">
                {editingProduct ? 'পণ্য সম্পাদনা করুন' : 'নতুন পণ্য যোগ করুন'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-gray-200 rounded-full transition">
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleFormSubmit} className="p-6 space-y-4 overflow-y-auto no-scrollbar">
              {/* Image Upload Preview */}
              <div className="flex flex-col items-center">
                <div className="relative group w-32 h-32 rounded-2xl overflow-hidden border-2 border-dashed border-gray-300 bg-gray-50 flex items-center justify-center mb-2">
                  {formData.image ? (
                    <img src={formData.image} className="w-full h-full object-cover" />
                  ) : (
                    <Upload className="text-gray-400" size={32} />
                  )}
                  <button 
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute inset-0 bg-black/40 text-white opacity-0 group-hover:opacity-100 transition flex flex-col items-center justify-center text-[10px] font-bold"
                  >
                    <Upload size={20} className="mb-1" /> ছবি পরিবর্তন করুন
                  </button>
                </div>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  className="hidden" 
                  accept="image/*" 
                  onChange={handleImageChange} 
                />
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">পণ্যের নাম</label>
                  <input 
                    required
                    value={formData.name}
                    onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition" 
                    placeholder="যেমন: মিনিকেট চাল" 
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">ক্যাটাগরি</label>
                    <select 
                      value={formData.category}
                      onChange={e => setFormData(prev => ({ ...prev, category: e.target.value as Category }))}
                      className="w-full px-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition"
                    >
                      {Object.values(Category).filter(c => c !== Category.ALL).map(c => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">ইউনিট</label>
                    <input 
                      required
                      value={formData.unit}
                      onChange={e => setFormData(prev => ({ ...prev, unit: e.target.value }))}
                      className="w-full px-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition" 
                      placeholder="যেমন: কেজি, ডজন, প্যাকেট" 
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">মূল্য (৳)</label>
                    <input 
                      required
                      type="number"
                      value={formData.price}
                      onChange={e => setFormData(prev => ({ ...prev, price: e.target.value }))}
                      className="w-full px-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition" 
                      placeholder="৳ ০০.০০" 
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">স্টক পরিমাণ</label>
                    <input 
                      required
                      type="number"
                      value={formData.stock}
                      onChange={e => setFormData(prev => ({ ...prev, stock: e.target.value }))}
                      className="w-full px-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition" 
                      placeholder="যেমন: ১০০" 
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">বর্ণনা</label>
                  <textarea 
                    value={formData.description}
                    onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    className="w-full px-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition" 
                    placeholder="পণ্যের বিস্তারিত তথ্য..." 
                    rows={2}
                  ></textarea>
                </div>
              </div>

              <div className="flex gap-4 pt-4 sticky bottom-0 bg-white">
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)} 
                  className="flex-1 px-6 py-3 border rounded-xl font-bold text-gray-600 hover:bg-gray-50 transition"
                >
                  ফিরে যান
                </button>
                <button 
                  type="submit"
                  className="flex-1 bg-emerald-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-emerald-700 shadow-lg shadow-emerald-200 transition"
                >
                  {editingProduct ? 'আপডেট করুন' : 'যোগ করুন'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;
