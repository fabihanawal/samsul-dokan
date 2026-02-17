
import React, { useState, useRef } from 'react';
import { Package, ClipboardList, TrendingUp, Users, Plus, Edit, Trash2, LogOut, CheckCircle, Upload, X, Layout, Image as ImageIcon, Loader2 } from 'lucide-react';
import { Product, Category, Order, Slide } from '../types';

interface AdminPanelProps {
  products: Product[];
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>;
  slides: Slide[];
  setSlides: React.Dispatch<React.SetStateAction<Slide[]>>;
  orders: Order[];
  setOrders: React.Dispatch<React.SetStateAction<Order[]>>;
}

const AdminPanel: React.FC<AdminPanelProps> = ({ products, setProducts, slides, setSlides, orders, setOrders }) => {
  const [activeTab, setActiveTab] = useState<'DASHBOARD' | 'PRODUCTS' | 'ORDERS' | 'SLIDES'>('DASHBOARD');
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [isSlideModalOpen, setIsSlideModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [editingSlide, setEditingSlide] = useState<Slide | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [isProcessingImage, setIsProcessingImage] = useState(false);
  
  // Product Form States
  const [productFormData, setProductFormData] = useState({
    name: '',
    category: Category.RICE,
    price: '',
    unit: '',
    stock: '',
    description: '',
    image: 'https://picsum.photos/seed/grocery/400/300'
  });

  // Slide Form States
  const [slideFormData, setSlideFormData] = useState({
    title: '',
    subtitle: '',
    buttonText: 'বাজার শুরু করুন',
    image: 'https://picsum.photos/seed/slide/1200/400'
  });

  const fileInputRef = useRef<HTMLInputElement>(null);
  const slideFileInputRef = useRef<HTMLInputElement>(null);

  const totalSales = orders.reduce((sum, o) => sum + o.total, 0);

  // IMPROVED IMAGE COMPRESSION UTILITY (Fixes black background issue)
  const compressImage = (base64Str: string, maxWidth = 800): Promise<string> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        
        if (width > maxWidth) {
          height = (maxWidth / width) * height;
          width = maxWidth;
        }
        
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        
        if (ctx) {
          // Fill background with white to avoid black boxes for transparent PNGs converted to JPEG
          ctx.fillStyle = '#FFFFFF';
          ctx.fillRect(0, 0, width, height);
          ctx.drawImage(img, 0, 0, width, height);
          // Using JPEG to keep file size small for LocalStorage
          resolve(canvas.toDataURL('image/jpeg', 0.7));
        } else {
          resolve(base64Str);
        }
      };
      img.onerror = () => resolve(base64Str);
      img.src = base64Str;
    });
  };

  // PRODUCT HANDLERS
  const handleEditProductClick = (product: Product) => {
    setEditingProduct(product);
    setProductFormData({
      name: product.name,
      category: product.category,
      price: product.price.toString(),
      unit: product.unit,
      stock: product.stock.toString(),
      description: product.description,
      image: product.image
    });
    setIsProductModalOpen(true);
  };

  const handleAddProductClick = () => {
    setEditingProduct(null);
    setProductFormData({
      name: '',
      category: Category.RICE,
      price: '',
      unit: '',
      stock: '',
      description: '',
      image: 'https://picsum.photos/seed/grocery/400/300'
    });
    setIsProductModalOpen(true);
  };

  const handleProductImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsProcessingImage(true);
      const reader = new FileReader();
      reader.onloadend = async () => {
        try {
          const compressed = await compressImage(reader.result as string, 600);
          setProductFormData(prev => ({ ...prev, image: compressed }));
        } catch (err) {
          console.error("Image processing failed", err);
        } finally {
          setIsProcessingImage(false);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleProductSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newProductData: Product = {
      id: editingProduct ? editingProduct.id : Math.random().toString(36).substr(2, 9),
      name: productFormData.name,
      category: productFormData.category as Category,
      price: parseFloat(productFormData.price),
      unit: productFormData.unit,
      stock: parseInt(productFormData.stock),
      description: productFormData.description,
      image: productFormData.image
    };
    if (editingProduct) setProducts(prev => prev.map(p => p.id === editingProduct.id ? newProductData : p));
    else setProducts(prev => [...prev, newProductData]);
    setIsProductModalOpen(false);
  };

  // SLIDE HANDLERS
  const handleEditSlideClick = (slide: Slide) => {
    setEditingSlide(slide);
    setSlideFormData({
      title: slide.title,
      subtitle: slide.subtitle,
      buttonText: slide.buttonText,
      image: slide.image
    });
    setIsSlideModalOpen(true);
  };

  const handleAddSlideClick = () => {
    setEditingSlide(null);
    setSlideFormData({
      title: '',
      subtitle: '',
      buttonText: 'বাজার শুরু করুন',
      image: 'https://picsum.photos/seed/slide/1200/400'
    });
    setIsSlideModalOpen(true);
  };

  const handleSlideImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsProcessingImage(true);
      const reader = new FileReader();
      reader.onloadend = async () => {
        try {
          const compressed = await compressImage(reader.result as string, 1000);
          setSlideFormData(prev => ({ ...prev, image: compressed }));
        } catch (err) {
          console.error("Slide image processing failed", err);
        } finally {
          setIsProcessingImage(false);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSlideSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newSlideData: Slide = {
      id: editingSlide ? editingSlide.id : Math.random().toString(36).substr(2, 9),
      ...slideFormData
    };
    if (editingSlide) setSlides(prev => prev.map(s => s.id === editingSlide.id ? newSlideData : s));
    else setSlides(prev => [...prev, newSlideData]);
    setIsSlideModalOpen(false);
  };

  const deleteSlide = (id: string) => {
    if (window.confirm('আপনি কি নিশ্চিত যে এই স্লাইডটি মুছতে চান?')) {
      setSlides(prev => prev.filter(s => s.id !== id));
    }
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
              className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none text-gray-900 font-bold" 
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
          <button onClick={() => setActiveTab('DASHBOARD')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition ${activeTab === 'DASHBOARD' ? 'bg-emerald-600 text-white shadow-md' : 'bg-white text-gray-600 hover:bg-emerald-50'}`}><TrendingUp size={20} /> ড্যাশবোর্ড</button>
          <button onClick={() => setActiveTab('PRODUCTS')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition ${activeTab === 'PRODUCTS' ? 'bg-emerald-600 text-white shadow-md' : 'bg-white text-gray-600 hover:bg-emerald-50'}`}><Package size={20} /> পণ্য ম্যানেজমেন্ট</button>
          <button onClick={() => setActiveTab('SLIDES')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition ${activeTab === 'SLIDES' ? 'bg-emerald-600 text-white shadow-md' : 'bg-white text-gray-600 hover:bg-emerald-50'}`}><Layout size={20} /> স্লাইডার ম্যানেজমেন্ট</button>
          <button onClick={() => setActiveTab('ORDERS')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition ${activeTab === 'ORDERS' ? 'bg-emerald-600 text-white shadow-md' : 'bg-white text-gray-600 hover:bg-emerald-50'}`}><ClipboardList size={20} /> অর্ডারসমূহ</button>
          <hr className="my-4" />
          <button onClick={() => setIsAuthenticated(false)} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-red-500 hover:bg-red-50 transition"><LogOut size={20} /> লগআউট</button>
        </div>

        {/* Dashboard Content */}
        <div className="flex-grow">
          {activeTab === 'DASHBOARD' && (
            <div className="space-y-8 animate-fade-in">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white p-6 rounded-2xl border shadow-sm flex items-center gap-4"><div className="bg-blue-100 text-blue-600 p-3 rounded-xl"><Package size={28} /></div><div><p className="text-gray-500 text-xs font-bold uppercase">মোট পণ্য</p><p className="text-2xl font-black">{products.length}</p></div></div>
                <div className="bg-white p-6 rounded-2xl border shadow-sm flex items-center gap-4"><div className="bg-emerald-100 text-emerald-600 p-3 rounded-xl"><ClipboardList size={28} /></div><div><p className="text-gray-500 text-xs font-bold uppercase">মোট অর্ডার</p><p className="text-2xl font-black">{orders.length}</p></div></div>
                <div className="bg-white p-6 rounded-2xl border shadow-sm flex items-center gap-4"><div className="bg-amber-100 text-amber-600 p-3 rounded-xl"><TrendingUp size={28} /></div><div><p className="text-gray-500 text-xs font-bold uppercase">মোট বিক্রয়</p><p className="text-2xl font-black">৳ {totalSales}</p></div></div>
                <div className="bg-white p-6 rounded-2xl border shadow-sm flex items-center gap-4"><div className="bg-purple-100 text-purple-600 p-3 rounded-xl"><Users size={28} /></div><div><p className="text-gray-500 text-xs font-bold uppercase">গ্রাহক</p><p className="text-2xl font-black">{new Set(orders.map(o => o.phone)).size}</p></div></div>
              </div>
              <div className="bg-white rounded-2xl border shadow-sm p-6">
                <h3 className="text-xl font-bold mb-4">সাম্প্রতিক অর্ডারসমূহ</h3>
                {orders.length === 0 ? <p className="text-gray-400 italic">অর্ডার নেই</p> : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead><tr className="text-xs font-bold text-gray-400 uppercase tracking-wider border-b"><th className="pb-3">আইডি</th><th className="pb-3">গ্রাহক</th><th className="pb-3 text-right">মোট টাকা</th></tr></thead>
                      <tbody className="divide-y">{orders.slice(0, 5).map(o => (<tr key={o.id}><td className="py-4 font-medium text-emerald-600">#{o.id}</td><td className="py-4">{o.customerName}</td><td className="py-4 text-right font-bold">৳ {o.total}</td></tr>))}</tbody>
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
                <button onClick={handleAddProductClick} className="bg-emerald-600 text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2 hover:bg-emerald-700 transition"><Plus size={18} /> নতুন পণ্য যোগ করুন</button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead><tr className="bg-gray-50 text-[10px] font-bold text-gray-500 uppercase tracking-widest"><th className="px-6 py-4">পণ্য</th><th className="px-6 py-4">ক্যাটাগরি</th><th className="px-6 py-4">দাম</th><th className="px-6 py-4 text-right">অ্যাকশন</th></tr></thead>
                  <tbody className="divide-y">{products.map(p => (<tr key={p.id} className="hover:bg-gray-50 transition"><td className="px-6 py-4"><div className="flex items-center gap-3"><img src={p.image} className="w-10 h-10 rounded-lg object-cover bg-gray-100" alt="" /><span className="font-bold text-gray-800">{p.name}</span></div></td><td className="px-6 py-4 text-sm font-medium text-gray-500">{p.category}</td><td className="px-6 py-4 font-bold text-emerald-700">৳ {p.price}</td><td className="px-6 py-4 text-right"><div className="flex justify-end gap-2"><button onClick={() => handleEditProductClick(p)} className="p-1.5 text-blue-500 hover:bg-blue-50 rounded-lg transition"><Edit size={18} /></button><button onClick={() => deleteProduct(p.id)} className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition"><Trash2 size={18} /></button></div></td></tr>))}</tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'SLIDES' && (
            <div className="bg-white rounded-2xl border shadow-sm overflow-hidden animate-fade-in">
              <div className="p-6 border-b flex justify-between items-center bg-gray-50/50">
                <h3 className="text-xl font-bold">স্লাইডার তালিকা</h3>
                <button onClick={handleAddSlideClick} className="bg-emerald-600 text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2 hover:bg-emerald-700 transition"><Plus size={18} /> নতুন স্লাইড যোগ করুন</button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead><tr className="bg-gray-50 text-[10px] font-bold text-gray-500 uppercase tracking-widest"><th className="px-6 py-4">স্লাইড ইমেজ</th><th className="px-6 py-4">শিরোনাম ও তথ্য</th><th className="px-6 py-4 text-right">অ্যাকশন</th></tr></thead>
                  <tbody className="divide-y">{slides.map(s => (<tr key={s.id} className="hover:bg-gray-50 transition"><td className="px-6 py-4"><img src={s.image} className="w-24 h-12 rounded-lg object-cover bg-gray-100 border" alt="" /></td><td className="px-6 py-4"><p className="font-bold text-gray-800">{s.title}</p><p className="text-xs text-gray-500 line-clamp-1">{s.subtitle}</p></td><td className="px-6 py-4 text-right"><div className="flex justify-end gap-2"><button onClick={() => handleEditSlideClick(s)} className="p-1.5 text-blue-500 hover:bg-blue-50 rounded-lg transition"><Edit size={18} /></button><button onClick={() => deleteSlide(s.id)} className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition"><Trash2 size={18} /></button></div></td></tr>))}</tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'ORDERS' && (
            <div className="space-y-4 animate-fade-in">
              {orders.length === 0 ? <div className="bg-white p-20 text-center rounded-2xl border text-gray-400">অর্ডার নেই</div> : orders.map(order => (
                <div key={order.id} className="bg-white p-6 rounded-2xl border shadow-sm border-l-4 border-l-emerald-500">
                  <div className="flex flex-col md:flex-row justify-between mb-4 gap-4">
                    <div><div className="flex items-center gap-2 mb-1"><h4 className="text-lg font-bold">অর্ডার #{order.id}</h4><span className={`px-3 py-1 rounded-full text-xs font-bold ${order.status === 'Pending' ? 'bg-amber-100 text-amber-700' : order.status === 'Delivered' ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-700'}`}>{order.status === 'Pending' ? 'অপেক্ষমান' : order.status === 'Delivered' ? 'ডেলিভারি হয়েছে' : 'বাতিল'}</span></div><p className="text-sm font-bold text-gray-700">{order.customerName} - {order.phone}</p><p className="text-sm text-gray-500">{order.address}</p></div>
                    <div className="text-right"><p className="text-2xl font-black text-emerald-800">৳ {order.total}</p><p className="text-xs text-gray-400">{order.date}</p></div>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-4 mb-4"><p className="text-xs font-bold text-gray-400 uppercase mb-2">পণ্য তালিকা</p><ul className="space-y-1">{order.items.map(item => (<li key={item.product.id} className="text-sm flex justify-between"><span>{item.product.name} (x{item.quantity})</span><span className="font-bold">৳ {item.product.price * item.quantity}</span></li>))}</ul></div>
                  <div className="flex gap-2">
                    {order.status !== 'Delivered' && <button onClick={() => updateOrderStatus(order.id, 'Delivered')} className="bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-emerald-700 transition"><CheckCircle size={16} /> ডেলিভারি সম্পন্ন</button>}
                    {order.status === 'Pending' && <button onClick={() => updateOrderStatus(order.id, 'Cancelled')} className="bg-red-50 text-red-600 px-4 py-2 rounded-lg text-sm font-bold hover:bg-red-100 transition">বাতিল করুন</button>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Product Modal */}
      {isProductModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in">
          <div className="bg-white w-full max-w-xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-6 border-b flex justify-between items-center bg-emerald-50">
              <h3 className="text-xl font-bold text-emerald-900">{editingProduct ? 'পণ্য সম্পাদনা' : 'নতুন পণ্য যোগ করুন'}</h3>
              <button onClick={() => setIsProductModalOpen(false)} className="p-2 hover:bg-red-50 rounded-full transition"><X size={20} /></button>
            </div>
            <form onSubmit={handleProductSubmit} className="p-6 space-y-4 overflow-y-auto no-scrollbar bg-white">
              <div className="flex flex-col items-center">
                <div className="relative group w-32 h-32 rounded-2xl overflow-hidden border-4 border-dashed border-emerald-100 bg-emerald-50/50 flex items-center justify-center mb-2">
                  {isProcessingImage ? <Loader2 size={32} className="animate-spin text-emerald-600" /> : <img src={productFormData.image} className="w-full h-full object-cover" alt="" />}
                  <button type="button" onClick={() => fileInputRef.current?.click()} className="absolute inset-0 bg-black/40 text-white opacity-0 group-hover:opacity-100 transition flex flex-col items-center justify-center text-[10px] font-bold"><Upload size={24} className="mb-1" /> আপডেট করুন</button>
                </div>
                <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleProductImageChange} />
              </div>
              <div className="space-y-4 text-black">
                <div><label className="block text-xs font-bold text-emerald-700 uppercase mb-1">পণ্যের নাম</label><input required value={productFormData.name} onChange={e => setProductFormData(p => ({...p, name: e.target.value}))} className="w-full px-4 py-3 border-2 border-gray-100 rounded-xl text-black bg-white font-bold focus:border-emerald-500 outline-none" placeholder="যেমন: মিনিকেট চাল" /></div>
                <div className="grid grid-cols-2 gap-4">
                  <div><label className="block text-xs font-bold text-emerald-700 uppercase mb-1">ক্যাটাগরি</label><select value={productFormData.category} onChange={e => setProductFormData(p => ({...p, category: e.target.value as Category}))} className="w-full px-4 py-3 border-2 border-gray-100 rounded-xl text-black bg-white font-bold focus:border-emerald-500 outline-none">{Object.values(Category).filter(c => c !== Category.ALL).map(c => <option key={c} value={c}>{c}</option>)}</select></div>
                  <div><label className="block text-xs font-bold text-emerald-700 uppercase mb-1">ইউনিট</label><input required value={productFormData.unit} onChange={e => setProductFormData(p => ({...p, unit: e.target.value}))} className="w-full px-4 py-3 border-2 border-gray-100 rounded-xl text-black bg-white font-bold focus:border-emerald-500 outline-none" placeholder="যেমন: কেজি" /></div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div><label className="block text-xs font-bold text-emerald-700 uppercase mb-1">দাম (৳)</label><input required type="number" value={productFormData.price} onChange={e => setProductFormData(p => ({...p, price: e.target.value}))} className="w-full px-4 py-3 border-2 border-gray-100 rounded-xl text-black bg-white font-bold focus:border-emerald-500 outline-none" placeholder="০০.০০" /></div>
                  <div><label className="block text-xs font-bold text-emerald-700 uppercase mb-1">স্টক</label><input required type="number" value={productFormData.stock} onChange={e => setProductFormData(p => ({...p, stock: e.target.value}))} className="w-full px-4 py-3 border-2 border-gray-100 rounded-xl text-black bg-white font-bold focus:border-emerald-500 outline-none" placeholder="যেমন: ১০০" /></div>
                </div>
                <div><label className="block text-xs font-bold text-emerald-700 uppercase mb-1">বর্ণনা</label><textarea value={productFormData.description} onChange={e => setProductFormData(p => ({...p, description: e.target.value}))} className="w-full px-4 py-3 border-2 border-gray-100 rounded-xl text-black bg-white font-bold focus:border-emerald-500 outline-none" placeholder="বিস্তারিত তথ্য..." rows={2}></textarea></div>
              </div>
              <div className="flex gap-4 pt-4 sticky bottom-0 bg-white border-t mt-4">
                <button type="button" onClick={() => setIsProductModalOpen(false)} className="flex-1 px-6 py-4 border-2 rounded-xl font-bold text-gray-500 hover:bg-gray-50 transition">ফিরে যান</button>
                <button type="submit" disabled={isProcessingImage} className="flex-1 bg-emerald-600 text-white px-6 py-4 rounded-xl font-bold hover:bg-emerald-700 transition shadow-lg flex items-center justify-center gap-2">{isProcessingImage && <Loader2 size={18} className="animate-spin" />}{editingProduct ? 'আপডেট করুন' : 'যোগ করুন'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Slide Modal */}
      {isSlideModalOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in">
          <div className="bg-white w-full max-w-xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] border border-emerald-100">
            <div className="p-6 border-b flex justify-between items-center bg-emerald-50">
              <h3 className="text-xl font-bold text-emerald-900 uppercase tracking-wide">{editingSlide ? 'স্লাইড তথ্য সম্পাদনা' : 'নতুন স্লাইড তৈরি করুন'}</h3>
              <button onClick={() => setIsSlideModalOpen(false)} className="p-2 hover:bg-red-50 hover:text-red-500 rounded-full transition"><X size={20} /></button>
            </div>
            
            <form onSubmit={handleSlideSubmit} className="p-6 space-y-5 overflow-y-auto no-scrollbar bg-white">
              <div className="space-y-2">
                <label className="block text-xs font-black text-emerald-700 uppercase tracking-widest">স্লাইডার ইমেজ আপডেট</label>
                <div className="relative group w-full h-44 rounded-2xl overflow-hidden border-4 border-dashed border-emerald-100 bg-emerald-50/20 flex items-center justify-center transition-all hover:border-emerald-400">
                  {isProcessingImage ? <Loader2 size={40} className="animate-spin text-emerald-600" /> : <img src={slideFormData.image} className="w-full h-full object-cover transition duration-500 group-hover:scale-105" alt="Slide Preview" />}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-3">
                    <button type="button" onClick={() => slideFileInputRef.current?.click()} className="bg-white text-emerald-700 px-5 py-2.5 rounded-2xl font-black flex items-center gap-2 hover:scale-105 transition active:scale-95 shadow-2xl"><ImageIcon size={20} /> ফটো নির্বাচন করুন</button>
                  </div>
                </div>
                <input type="file" ref={slideFileInputRef} className="hidden" accept="image/*" onChange={handleSlideImageChange} />
              </div>

              <div className="space-y-5">
                <div>
                  <label className="block text-xs font-black text-emerald-800 uppercase tracking-widest mb-1.5 ml-1">স্লাইড টাইটেল</label>
                  <input required value={slideFormData.title} onChange={e => setSlideFormData(p => ({...p, title: e.target.value}))} className="w-full px-5 py-4 border-2 border-gray-100 rounded-2xl text-black bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-50 outline-none transition font-black placeholder:text-gray-300 shadow-sm text-lg" placeholder="যেমন: নতুন অফার!" />
                </div>
                
                <div>
                  <label className="block text-xs font-black text-emerald-800 uppercase tracking-widest mb-1.5 ml-1">বিস্তারিত তথ্য (উপ-শিরোনাম)</label>
                  <textarea required value={slideFormData.subtitle} onChange={e => setSlideFormData(p => ({...p, subtitle: e.target.value}))} className="w-full px-5 py-4 border-2 border-gray-100 rounded-2xl text-black bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-50 outline-none transition font-bold placeholder:text-gray-300 shadow-sm min-h-[100px]" placeholder="অফার বা সচেতনতামূলক তথ্য লিখুন..."></textarea>
                </div>

                <div>
                  <label className="block text-xs font-black text-emerald-800 uppercase tracking-widest mb-1.5 ml-1">বাটন টেক্সট</label>
                  <input required value={slideFormData.buttonText} onChange={e => setSlideFormData(p => ({...p, buttonText: e.target.value}))} className="w-full px-5 py-4 border-2 border-gray-100 rounded-2xl text-black bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-50 outline-none transition font-black shadow-sm" placeholder="যেমন: অফারটি নিন" />
                </div>
              </div>

              <div className="flex gap-4 pt-4 sticky bottom-0 bg-white border-t mt-6">
                <button type="button" onClick={() => setIsSlideModalOpen(false)} className="flex-1 px-6 py-4 border-2 border-gray-100 rounded-2xl font-black text-gray-500 hover:bg-gray-100 transition active:scale-95">ফিরে যান</button>
                <button type="submit" disabled={isProcessingImage} className="flex-1 bg-emerald-700 text-white px-6 py-4 rounded-2xl font-black text-xl hover:bg-emerald-800 shadow-xl shadow-emerald-100 transition transform active:scale-95 flex items-center justify-center gap-2">
                  {isProcessingImage ? <Loader2 size={24} className="animate-spin" /> : (editingSlide ? <CheckCircle size={24} /> : <Plus size={24} />)}
                  {editingSlide ? 'সেভ করুন' : 'তৈরি করুন'}
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
