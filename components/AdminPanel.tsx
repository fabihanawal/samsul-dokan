
import React, { useState } from 'react';
import { Package, ClipboardList, TrendingUp, LogOut, Plus, Trash2, X, Edit, Layout, Save, Database, Copy, CheckCircle2, AlertTriangle, RefreshCw, Upload, Image as ImageIcon, CheckCircle } from 'lucide-react';
import { Product, Order, Slide, Category } from '../types';
import { supabase } from '../supabase';
import { INITIAL_PRODUCTS, INITIAL_SLIDES } from '../data';

interface AdminPanelProps {
  products: Product[];
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>;
  slides: Slide[];
  setSlides: React.Dispatch<React.SetStateAction<Slide[]>>;
  orders: Order[];
  setOrders: React.Dispatch<React.SetStateAction<Order[]>>;
  needsSetup?: boolean;
}

const AdminPanel: React.FC<AdminPanelProps> = ({ products, setProducts, slides, setSlides, orders, setOrders, needsSetup = false }) => {
  const [activeTab, setActiveTab] = useState<'DASHBOARD' | 'PRODUCTS' | 'ORDERS' | 'SLIDES' | 'SETTINGS'>(needsSetup ? 'SETTINGS' : 'DASHBOARD');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [isSeeding, setIsSeeding] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [copied, setCopied] = useState(false);
  
  // Modals state
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [isSlideModalOpen, setIsSlideModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);

  // Form states
  const [productForm, setProductForm] = useState({
    name: '', price: '', unit: 'কেজি', category: Category.VEGETABLES, image: '', description: '', stock: '100'
  });
  const [slideForm, setSlideForm] = useState({
    image: '', title: '', subtitle: '', buttonText: 'বাজার শুরু করুন'
  });

  const sqlSchema = `-- ১. products টেবিল তৈরি করুন
CREATE TABLE products (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  price float8 NOT NULL,
  unit text NOT NULL,
  category text NOT NULL,
  image text,
  description text,
  stock int4 DEFAULT 100,
  created_at timestamptz DEFAULT now()
);

-- ২. slides টেবিল তৈরি করুন
CREATE TABLE slides (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  image text NOT NULL,
  title text NOT NULL,
  subtitle text,
  buttonText text DEFAULT 'বাজার শুরু করুন',
  created_at timestamptz DEFAULT now()
);

-- ৩. orders টেবিল তৈরি করুন
CREATE TABLE orders (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  customerName text NOT NULL,
  phone text NOT NULL,
  address text NOT NULL,
  items jsonb NOT NULL,
  total float8 NOT NULL,
  status text DEFAULT 'Pending',
  date timestamptz DEFAULT now()
);

-- টেবিলগুলোতে সবার অ্যাক্সেস নিশ্চিত করতে RLS বন্ধ করুন
ALTER TABLE products DISABLE ROW LEVEL SECURITY;
ALTER TABLE slides DISABLE ROW LEVEL SECURITY;
ALTER TABLE orders DISABLE ROW LEVEL SECURITY;`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(sqlSchema);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Image Upload Helper with unique filenames
  const handleFileUpload = async (file: File, type: 'product' | 'slide') => {
    setIsUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      // Added a timestamp for guaranteed uniqueness
      const fileName = `${Date.now()}-${Math.floor(Math.random() * 1000)}.${fileExt}`;
      const filePath = `${type}s/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('images')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from('images').getPublicUrl(filePath);
      
      if (type === 'product') {
        setProductForm(prev => ({ ...prev, image: data.publicUrl }));
      } else {
        setSlideForm(prev => ({ ...prev, image: data.publicUrl }));
      }
    } catch (error: any) {
      alert('ছবি আপলোড করতে সমস্যা হয়েছে! নিশ্চিত করুন যে আপনি Supabase Storage-এ "images" নামে একটি Public Bucket তৈরি করেছেন।');
      console.error(error);
    } finally {
      setIsUploading(false);
    }
  };

  const seedDatabase = async () => {
    setIsSeeding(true);
    try {
      const productsToInsert = INITIAL_PRODUCTS.map(({ id, ...rest }) => rest);
      await supabase.from('products').insert(productsToInsert);
      const slidesToInsert = INITIAL_SLIDES.map(({ id, ...rest }) => rest);
      await supabase.from('slides').insert(slidesToInsert);
      alert('সফলভাবে ডেমো ডেটা যুক্ত করা হয়েছে!');
      window.location.reload();
    } catch (error) {
      console.error(error);
      alert('ডেটা যুক্ত করতে সমস্যা হয়েছে।');
    } finally {
      setIsSeeding(false);
    }
  };

  const handleProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!productForm.image) return alert('অনুগ্রহ করে পণ্যের ছবি যোগ করুন।');
    
    const data = {
      ...productForm,
      price: parseFloat(productForm.price),
      stock: parseInt(productForm.stock)
    };

    if (editingItem) {
      const { error } = await supabase.from('products').update(data).eq('id', editingItem.id);
      if (!error) {
        setProducts(prev => prev.map(p => p.id === editingItem.id ? { ...p, ...data } : p));
        setIsProductModalOpen(false);
      }
    } else {
      const { data: inserted, error } = await supabase.from('products').insert([data]).select();
      if (!error && inserted) {
        setProducts(prev => [...prev, inserted[0]]);
        setIsProductModalOpen(false);
      }
    }
    setEditingItem(null);
  };

  const handleSlideSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!slideForm.image) return alert('স্লাইড ছবি আবশ্যিক।');
    
    if (editingItem) {
      const { error } = await supabase.from('slides').update(slideForm).eq('id', editingItem.id);
      if (!error) {
        setSlides(prev => prev.map(s => s.id === editingItem.id ? { ...s, ...slideForm } : s));
        setIsSlideModalOpen(false);
      }
    } else {
      const { data: inserted, error } = await supabase.from('slides').insert([slideForm]).select();
      if (!error && inserted) {
        setSlides(prev => [...prev, inserted[0]]);
        setIsSlideModalOpen(false);
      }
    }
    setEditingItem(null);
  };

  const deleteProduct = async (id: string) => {
    if (!confirm('আপনি কি নিশ্চিতভাবে এই পণ্যটি মুছে ফেলতে চান?')) return;
    const { error } = await supabase.from('products').delete().eq('id', id);
    if (!error) setProducts(prev => prev.filter(p => p.id !== id));
  };

  const deleteSlide = async (id: string) => {
    if (!confirm('আপনি কি নিশ্চিতভাবে এই স্লাইডটি মুছে ফেলতে চান?')) return;
    const { error } = await supabase.from('slides').delete().eq('id', id);
    if (!error) setSlides(prev => prev.filter(s => s.id !== id));
  };

  const updateOrderStatus = async (id: string, status: string) => {
    const { error } = await supabase.from('orders').update({ status }).eq('id', id);
    if (!error) setOrders(prev => prev.map(o => o.id === id ? { ...o, status: status as any } : o));
  };

  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto my-20 p-10 bg-white rounded-3xl shadow-2xl border border-emerald-100 animate-fade-in">
        <h2 className="text-3xl font-black text-center mb-8 text-emerald-800 tracking-tight">অ্যাডমিন প্যানেল</h2>
        <input 
          type="password" 
          className="w-full p-4 border-2 border-gray-100 rounded-2xl mb-6 focus:border-emerald-500 outline-none transition-all font-bold" 
          placeholder="পাসওয়ার্ড লিখুন" 
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && password === 'admin123' && setIsAuthenticated(true)}
        />
        <button 
          onClick={() => { if (password === 'admin123') setIsAuthenticated(true); else alert('ভুল পাসওয়ার্ড'); }}
          className="w-full bg-emerald-600 text-white py-4 rounded-2xl font-black text-lg shadow-lg shadow-emerald-200 active:scale-95 transition-all"
        >
          প্রবেশ করুন
        </button>
        <p className="text-center text-xs text-gray-400 mt-6 italic font-bold">পাসওয়ার্ড: admin123</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 flex flex-col lg:flex-row gap-8 animate-fade-in">
      {/* Sidebar */}
      <div className="w-full lg:w-64 space-y-2 shrink-0">
        <button onClick={() => setActiveTab('DASHBOARD')} className={`w-full flex items-center gap-3 px-6 py-4 rounded-2xl font-bold transition-all ${activeTab === 'DASHBOARD' ? 'bg-emerald-600 text-white shadow-lg' : 'bg-white hover:bg-emerald-50 text-gray-600'}`}><TrendingUp size={20} /> ড্যাশবোর্ড</button>
        <button onClick={() => setActiveTab('PRODUCTS')} className={`w-full flex items-center gap-3 px-6 py-4 rounded-2xl font-bold transition-all ${activeTab === 'PRODUCTS' ? 'bg-emerald-600 text-white shadow-lg' : 'bg-white hover:bg-emerald-50 text-gray-600'}`}><Package size={20} /> পণ্য তালিকা</button>
        <button onClick={() => setActiveTab('SLIDES')} className={`w-full flex items-center gap-3 px-6 py-4 rounded-2xl font-bold transition-all ${activeTab === 'SLIDES' ? 'bg-emerald-600 text-white shadow-lg' : 'bg-white hover:bg-emerald-50 text-gray-600'}`}><Layout size={20} /> স্লাইডার</button>
        <button onClick={() => setActiveTab('ORDERS')} className={`w-full flex items-center gap-3 px-6 py-4 rounded-2xl font-bold transition-all ${activeTab === 'ORDERS' ? 'bg-emerald-600 text-white shadow-lg' : 'bg-white hover:bg-emerald-50 text-gray-600'}`}><ClipboardList size={20} /> অর্ডারসমূহ</button>
        <button onClick={() => setActiveTab('SETTINGS')} className={`w-full flex items-center gap-3 px-6 py-4 rounded-2xl font-bold transition-all ${activeTab === 'SETTINGS' ? 'bg-emerald-600 text-white shadow-lg' : 'bg-white hover:bg-emerald-50 text-gray-600'}`}><Database size={20} /> সেটিংস</button>
        <hr className="my-6 border-gray-200" />
        <button onClick={() => setIsAuthenticated(false)} className="w-full flex items-center gap-3 px-6 py-4 rounded-2xl font-bold text-red-500 hover:bg-red-50 transition-all"><LogOut size={20} /> লগআউট</button>
      </div>

      {/* Content Area */}
      <div className="flex-grow space-y-6">
        {activeTab === 'SETTINGS' && (
          <div className="space-y-6">
            <div className="bg-white p-10 rounded-3xl border border-gray-100 shadow-sm text-center animate-fade-in">
              <Database size={60} className="mx-auto text-emerald-500 mb-6" />
              <h3 className="text-3xl font-black text-emerald-900 mb-4">সেটআপ ও সেটিংস</h3>
              
              <div className="bg-emerald-50 border border-emerald-100 p-8 rounded-[2.5rem] mb-10 text-left relative overflow-hidden">
                <h4 className="text-emerald-900 text-xl font-black mb-4 flex items-center gap-2"><CheckCircle className="text-emerald-600" /> স্ট্যাটাস চেক:</h4>
                <p className="text-emerald-800 font-medium leading-relaxed">১. আপনি সফলভাবে <b>'images'</b> বাকেট তৈরি করেছেন।<br/> ২. এখন আপনি পণ্য যোগ করার সময় সরাসরি গ্যালারি থেকে ছবি দিতে পারবেন।</p>
              </div>

              <div className="relative mb-10 text-left">
                <div className="absolute top-4 right-4 z-10 flex gap-2">
                  <button onClick={copyToClipboard} className="flex items-center gap-2 bg-emerald-100 text-emerald-700 px-4 py-2 rounded-xl text-xs font-bold hover:bg-emerald-200 transition-all shadow-sm">
                    {copied ? <><CheckCircle2 size={16}/> কপি হয়েছে</> : <><Copy size={16}/> SQL কপি করুন</>}
                  </button>
                </div>
                <pre className="bg-gray-950 text-emerald-400 p-8 rounded-3xl overflow-x-auto text-xs font-mono border-4 border-emerald-500/10 shadow-xl">
                  {sqlSchema}
                </pre>
              </div>

              <button 
                disabled={isSeeding}
                onClick={seedDatabase}
                className={`bg-emerald-600 text-white px-12 py-5 rounded-2xl font-black text-xl shadow-xl shadow-emerald-200 transition-all active:scale-95 flex items-center justify-center gap-3 mx-auto ${isSeeding ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {isSeeding ? <><RefreshCw size={24} className="animate-spin"/> প্রসেসিং...</> : 'ডেমো ডেটা রিস্টোর করুন'}
              </button>
            </div>
          </div>
        )}

        {activeTab === 'DASHBOARD' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
              <p className="text-gray-400 font-bold text-[10px] uppercase tracking-widest mb-2">মোট বিক্রয়</p>
              <p className="text-4xl font-black text-emerald-700">৳ {orders.reduce((s, o) => s + o.total, 0)}</p>
            </div>
            <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
              <p className="text-gray-400 font-bold text-[10px] uppercase tracking-widest mb-2">মোট অর্ডার</p>
              <p className="text-4xl font-black">{orders.length}</p>
            </div>
            <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
              <p className="text-gray-400 font-bold text-[10px] uppercase tracking-widest mb-2">পণ্য সংখ্যা</p>
              <p className="text-4xl font-black">{products.length}</p>
            </div>
          </div>
        )}

        {activeTab === 'PRODUCTS' && (
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="p-6 border-b flex justify-between items-center bg-gray-50/50">
              <h3 className="text-xl font-bold text-gray-800">পণ্যের তালিকা</h3>
              <button 
                onClick={() => { setEditingItem(null); setProductForm({name:'', price:'', unit:'কেজি', category: Category.VEGETABLES, image:'', description:'', stock:'100'}); setIsProductModalOpen(true); }}
                className="bg-emerald-600 text-white px-6 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-emerald-700 transition-all shadow-md"
              >
                <Plus size={18}/> নতুন পণ্য
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                  <tr><th className="p-6 text-left">নাম</th><th className="p-6 text-left">ক্যাটাগরি</th><th className="p-6 text-right">দাম</th><th className="p-6 text-right">অ্যাকশন</th></tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {products.map(p => (
                    <tr key={p.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="p-6 font-bold text-gray-700">{p.name}</td>
                      <td className="p-6 text-xs text-gray-500 font-black">{p.category}</td>
                      <td className="p-6 text-right font-black text-emerald-800">৳ {p.price}</td>
                      <td className="p-6 text-right space-x-2">
                        <button onClick={() => { setEditingItem(p); setProductForm({name:p.name, price:p.price.toString(), unit:p.unit, category:p.category, image:p.image, description:p.description, stock:p.stock.toString()}); setIsProductModalOpen(true); }} className="text-blue-500 hover:bg-blue-50 p-2 rounded-xl transition-all"><Edit size={18}/></button>
                        <button onClick={() => deleteProduct(p.id)} className="text-red-500 hover:bg-red-50 p-2 rounded-xl transition-all"><Trash2 size={18}/></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {products.length === 0 && <p className="p-20 text-center text-gray-300 font-bold">কোনো পণ্য পাওয়া যায়নি</p>}
            </div>
          </div>
        )}

        {activeTab === 'SLIDES' && (
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="p-6 border-b flex justify-between items-center bg-gray-50/50">
              <h3 className="text-xl font-bold text-gray-800">স্লাইডার ম্যানেজমেন্ট</h3>
              <button 
                onClick={() => { setEditingItem(null); setSlideForm({image:'', title:'', subtitle:'', buttonText:'বাজার শুরু করুন'}); setIsSlideModalOpen(true); }}
                className="bg-emerald-600 text-white px-6 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2"
              >
                <Plus size={18}/> নতুন স্লাইড
              </button>
            </div>
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              {slides.map(s => (
                <div key={s.id} className="group relative rounded-2xl overflow-hidden border border-gray-100 shadow-sm">
                  <img src={s.image} className="w-full h-40 object-cover opacity-80" alt="" />
                  <div className="p-4">
                    <h4 className="font-bold text-lg">{s.title}</h4>
                    <p className="text-xs text-gray-400 font-bold mt-1 truncate">{s.subtitle}</p>
                    <div className="mt-4 flex gap-2">
                      <button onClick={() => { setEditingItem(s); setSlideForm({image:s.image, title:s.title, subtitle:s.subtitle, buttonText:s.buttonText}); setIsSlideModalOpen(true); }} className="flex-1 bg-blue-50 text-blue-600 py-2 rounded-xl font-bold text-xs flex justify-center items-center gap-1 hover:bg-blue-100"><Edit size={14}/> এডিট</button>
                      <button onClick={() => deleteSlide(s.id)} className="flex-1 bg-red-50 text-red-600 py-2 rounded-xl font-bold text-xs flex justify-center items-center gap-1 hover:bg-red-100"><Trash2 size={14}/> ডিলিট</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'ORDERS' && (
          <div className="space-y-4">
            {orders.length === 0 ? <p className="text-center py-20 bg-white rounded-3xl border text-gray-300 font-bold">অর্ডার লিস্ট খালি</p> : orders.map(o => (
              <div key={o.id} className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4 animate-fade-in">
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <p className="font-black text-xl text-emerald-900">{o.customerName}</p>
                    <span className={`text-[10px] font-black uppercase px-2 py-1 rounded-full ${o.status === 'Delivered' ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'}`}>
                      {o.status === 'Pending' ? 'অপেক্ষমান' : 'সম্পন্ন'}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 font-bold">{o.phone} • {o.address}</p>
                  <p className="text-[10px] text-gray-400 mt-1 font-bold">{new Date(o.date).toLocaleString('bn-BD')}</p>
                </div>
                <div className="text-left md:text-right w-full md:w-auto">
                  <p className="text-2xl font-black text-emerald-800 mb-2">৳ {o.total}</p>
                  {o.status === 'Pending' && (
                    <button onClick={() => updateOrderStatus(o.id, 'Delivered')} className="bg-emerald-600 text-white px-6 py-2.5 rounded-xl text-sm font-bold shadow-md shadow-emerald-100 transition-all active:scale-95">ডেলিভারি সম্পন্ন</button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Product Modal */}
      {isProductModalOpen && (
        <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl overflow-hidden animate-fade-in max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b flex justify-between items-center bg-emerald-50">
              <h3 className="font-black text-emerald-900 text-xl tracking-tight">{editingItem ? 'পণ্য সম্পাদনা' : 'নতুন পণ্য যোগ'}</h3>
              <button onClick={() => setIsProductModalOpen(false)} className="p-2 hover:bg-white rounded-full"><X size={20}/></button>
            </div>
            <form onSubmit={handleProductSubmit} className="p-8 grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">পণ্যের নাম</label>
                <input required value={productForm.name} onChange={e => setProductForm({...productForm, name: e.target.value})} className="w-full p-4 bg-gray-50 border rounded-2xl outline-none focus:bg-white focus:border-emerald-500 transition-all font-bold" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">ক্যাটাগরি</label>
                <select value={productForm.category} onChange={e => setProductForm({...productForm, category: e.target.value as Category})} className="w-full p-4 bg-gray-50 border rounded-2xl outline-none font-bold">
                  {Object.values(Category).filter(c => c !== Category.ALL).map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">দাম (৳)</label>
                <input required type="number" value={productForm.price} onChange={e => setProductForm({...productForm, price: e.target.value})} className="w-full p-4 bg-gray-50 border rounded-2xl outline-none font-bold" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">একক (Unit)</label>
                <input required value={productForm.unit} onChange={e => setProductForm({...productForm, unit: e.target.value})} className="w-full p-4 bg-gray-50 border rounded-2xl outline-none font-bold" placeholder="যেমন: কেজি" />
              </div>
              
              <div className="md:col-span-2 space-y-3">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">পণ্যের ছবি</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <label className={`flex flex-col items-center justify-center border-2 border-dashed rounded-3xl p-6 cursor-pointer transition-all ${isUploading ? 'bg-gray-100 opacity-50' : 'hover:border-emerald-500 hover:bg-emerald-50'}`}>
                    <input 
                      type="file" 
                      className="hidden" 
                      accept="image/*"
                      disabled={isUploading}
                      onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0], 'product')} 
                    />
                    {isUploading ? <RefreshCw className="animate-spin text-emerald-600" size={32}/> : <Upload className="text-gray-300" size={32}/>}
                    <span className="text-xs font-black text-gray-400 mt-2 uppercase">{isUploading ? 'আপলোড হচ্ছে...' : 'ছবি আপলোড করুন'}</span>
                  </label>
                  
                  {productForm.image ? (
                    <div className="relative rounded-3xl overflow-hidden border group">
                      <img src={productForm.image} className="w-full h-full object-cover" alt="Preview" />
                      <button type="button" onClick={() => setProductForm({...productForm, image: ''})} className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-xl shadow-lg opacity-0 group-hover:opacity-100 transition-opacity">
                        <Trash2 size={16}/>
                      </button>
                    </div>
                  ) : (
                    <div className="border-2 border-dashed rounded-3xl flex items-center justify-center bg-gray-50">
                      <ImageIcon className="text-gray-200" size={48}/>
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <input value={productForm.image} onChange={e => setProductForm({...productForm, image: e.target.value})} className="flex-grow p-3 bg-gray-50 border rounded-xl text-[10px] font-mono" placeholder="অথবা ছবির ডিরেক্ট লিংক এখানে দিন" />
                </div>
              </div>

              <div className="md:col-span-2 space-y-1">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">পণ্যের বর্ণনা</label>
                <textarea rows={3} value={productForm.description} onChange={e => setProductForm({...productForm, description: e.target.value})} className="w-full p-4 bg-gray-50 border rounded-2xl outline-none focus:bg-white font-medium" />
              </div>
              <div className="md:col-span-2 pt-4">
                <button type="submit" disabled={isUploading} className="w-full bg-emerald-600 text-white py-5 rounded-2xl font-black text-xl shadow-xl shadow-emerald-200 active:scale-95 transition-all">
                   {editingItem ? 'আপডেট সম্পন্ন করুন' : 'নতুন পণ্য সেভ করুন'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Slide Modal */}
      {isSlideModalOpen && (
        <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-xl rounded-[2.5rem] shadow-2xl overflow-hidden animate-fade-in">
            <div className="p-6 border-b flex justify-between items-center bg-emerald-50">
              <h3 className="font-black text-emerald-900 text-xl">{editingItem ? 'স্লাইড সম্পাদনা' : 'নতুন স্লাইড'}</h3>
              <button onClick={() => setIsSlideModalOpen(false)}><X size={20}/></button>
            </div>
            <form onSubmit={handleSlideSubmit} className="p-8 space-y-6">
              <div className="space-y-3">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">স্লাইডার ছবি</label>
                <div className="flex flex-col gap-4">
                  {slideForm.image && <img src={slideForm.image} className="w-full h-40 object-cover rounded-2xl border" />}
                  <label className="flex items-center justify-center gap-3 border-2 border-dashed rounded-2xl p-6 cursor-pointer hover:bg-emerald-50 transition-all">
                    <input 
                      type="file" 
                      className="hidden" 
                      accept="image/*"
                      onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0], 'slide')} 
                    />
                    {isUploading ? <RefreshCw className="animate-spin" size={20}/> : <Upload size={20}/>}
                    <span className="font-bold">{isUploading ? 'আপলোড হচ্ছে...' : 'নতুন ছবি আপলোড করুন'}</span>
                  </label>
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">প্রধান টাইটেল</label>
                <input required value={slideForm.title} onChange={e => setSlideForm({...slideForm, title: e.target.value})} className="w-full p-4 bg-gray-50 border rounded-2xl outline-none font-bold" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">সাব-টাইটেল (ঐচ্ছিক)</label>
                <input value={slideForm.subtitle} onChange={e => setSlideForm({...slideForm, subtitle: e.target.value})} className="w-full p-4 bg-gray-50 border rounded-2xl outline-none font-medium" />
              </div>
              <button type="submit" disabled={isUploading} className="w-full bg-emerald-600 text-white py-5 rounded-2xl font-black text-xl shadow-xl shadow-emerald-100 transition-all active:scale-95">
                {editingItem ? 'আপডেট করুন' : 'স্লাইড সেভ করুন'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;
