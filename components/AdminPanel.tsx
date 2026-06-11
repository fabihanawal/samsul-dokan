
import React, { useState, useMemo, useRef } from 'react';
import { Package, ClipboardList, TrendingUp, LogOut, Plus, Trash2, X, Database, Copy, CheckCircle2, RefreshCw, CheckCircle, Clock, AlertCircle, Settings, Phone, MapPin, Edit, Upload, ImageIcon, Loader2, Search } from 'lucide-react';
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
  fetchData: () => Promise<void>;
}

const AdminPanel: React.FC<AdminPanelProps> = ({ products, setProducts, slides, setSlides, orders, setOrders, needsSetup = false, fetchData }) => {
  const [activeTab, setActiveTab] = useState<'DASHBOARD' | 'PRODUCTS' | 'ORDERS' | 'SETTINGS'>(needsSetup ? 'SETTINGS' : 'DASHBOARD');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [isSeeding, setIsSeeding] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [copied, setCopied] = useState(false);
  
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [productForm, setProductForm] = useState({ 
    name: '', 
    price: '', 
    unit: 'কেজি', 
    category: Category.VEGETABLES, 
    image: '', 
    description: '',
    stock: '0'
  });

  const [orderSearchQuery, setOrderSearchQuery] = useState('');
  const [orderStatusFilter, setOrderStatusFilter] = useState<'ALL' | 'Pending' | 'Delivered' | 'Cancelled'>('ALL');

  const filteredOrders = useMemo(() => {
    return orders.filter(o => {
      const matchesSearch = (o.customerName || '').toLowerCase().includes(orderSearchQuery.toLowerCase()) || 
                            (o.phone || '').includes(orderSearchQuery) || 
                            (o.address || '').toLowerCase().includes(orderSearchQuery.toLowerCase());
      const matchesStatus = orderStatusFilter === 'ALL' || o.status === orderStatusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [orders, orderSearchQuery, orderStatusFilter]);

  const stats = useMemo(() => {
    const totalSales = orders.filter(o => o.status === 'Delivered').reduce((sum, o) => sum + o.total, 0);
    const pendingOrders = orders.filter(o => o.status === 'Pending').length;
    return { totalSales, pendingOrders, totalOrders: orders.length };
  }, [orders]);

  const sqlSchema = `-- ১. টেবিলগুলো তৈরি করুন
CREATE TABLE products (id uuid DEFAULT gen_random_uuid() PRIMARY KEY, name text, price float8, unit text, category text, image text, description text, stock int DEFAULT 0, created_at timestamptz DEFAULT now());
CREATE TABLE slides (id uuid DEFAULT gen_random_uuid() PRIMARY KEY, image text, title text, subtitle text, buttonText text, created_at timestamptz DEFAULT now());
CREATE TABLE orders (id uuid DEFAULT gen_random_uuid() PRIMARY KEY, customerName text, phone text, address text, items jsonb, total float8, status text DEFAULT 'Pending', date timestamptz DEFAULT now());

-- ২. সিকিউরিটি বন্ধ করুন (পাবলিক এক্সেস)
ALTER TABLE products DISABLE ROW LEVEL SECURITY;
ALTER TABLE slides DISABLE ROW LEVEL SECURITY;
ALTER TABLE orders DISABLE ROW LEVEL SECURITY;

-- ৩. স্টোরেজ বাকেট তৈরি করুন (নাম: products)
-- Supabase Dashboard > Storage > New Bucket > "products" (Public: Yes)
-- নিচের পলিসিগুলো SQL Editor এ রান করুন:
-- CREATE POLICY "Public Access" ON storage.objects FOR SELECT USING (bucket_id = 'products');
-- CREATE POLICY "All Access" ON storage.objects FOR ALL USING (bucket_id = 'products');
-- CREATE POLICY "Allow Public Upload" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'products');
-- CREATE POLICY "Allow Public Update" ON storage.objects FOR UPDATE USING (bucket_id = 'products');`;

  const seedData = async () => {
    setIsSeeding(true);
    try {
      await supabase.from('products').insert(INITIAL_PRODUCTS.map(({id, ...r}) => r));
      await supabase.from('slides').insert(INITIAL_SLIDES.map(({id, ...r}) => r));
      alert('ডেমো ডেটা সফলভাবে যোগ হয়েছে!');
      fetchData();
    } catch (e) { alert('সেটআপ করতে সমস্যা হয়েছে। ডাটাবেস টেবিল আগে তৈরি করুন।'); }
    finally { setIsSeeding(false); }
  };

  const updateOrderStatus = async (id: string, newStatus: 'Pending' | 'Delivered' | 'Cancelled') => {
    const { error } = await supabase.from('orders').update({ status: newStatus }).eq('id', id);
    if (error) {
      alert('স্ট্যাটাস আপডেট হয়নি');
    } else {
      fetchData();
    }
  };

  const deleteProduct = async (id: string) => {
    if(confirm('আপনি কি নিশ্চিতভাবে এই পণ্যটি মুছে ফেলতে চান?')) {
      const { error } = await supabase.from('products').delete().eq('id', id);
      if(!error) fetchData();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const openAddModal = () => {
    setEditingProductId(null);
    setProductForm({ name: '', price: '', unit: 'কেজি', category: Category.VEGETABLES, image: '', description: '', stock: '0' });
    setSelectedFile(null);
    setPreviewUrl(null);
    setIsProductModalOpen(true);
  };

  const openEditModal = (product: Product) => {
    setEditingProductId(product.id);
    setProductForm({
      name: product.name,
      price: product.price.toString(),
      unit: product.unit,
      category: product.category,
      image: product.image,
      description: product.description,
      stock: (product.stock || 0).toString()
    });
    setSelectedFile(null);
    setPreviewUrl(product.image);
    setIsProductModalOpen(true);
  };

  const uploadImage = async (file: File): Promise<string> => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
    const filePath = `product-images/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('products')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (uploadError) {
      throw uploadError;
    }

    const { data } = supabase.storage
      .from('products')
      .getPublicUrl(filePath);

    return data.publicUrl;
  };

  const saveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedFile && !productForm.image) {
      alert('দয়া করে একটি ছবি আপলোড করুন');
      return;
    }

    setIsSaving(true);
    
    try {
      let imageUrl = productForm.image;

      // Upload file if selected
      if (selectedFile) {
        try {
          imageUrl = await uploadImage(selectedFile);
        } catch (uploadErr: any) {
          console.error('Upload error:', uploadErr);
          if (uploadErr.message === 'Failed to fetch') {
            throw new Error('ইমেজ আপলোড করতে ব্যর্থ হয়েছে। আপনার ইন্টারনেট কানেকশন চেক করুন অথবা AdBlocker বন্ধ করে চেষ্টা করুন।');
          }
          throw new Error(`ইমেজ আপলোড হয়নি: ${uploadErr.message || 'Unknown Error'}. আপনি কি Supabase-এ 'products' নামে পাবলিক বাকেট তৈরি করেছেন?`);
        }
      }

      const payload = {
        name: productForm.name,
        price: parseFloat(productForm.price),
        unit: productForm.unit,
        category: productForm.category,
        image: imageUrl,
        description: productForm.description,
        stock: parseInt(productForm.stock) || 0
      };

      const { error } = editingProductId 
        ? await supabase.from('products').update(payload).eq('id', editingProductId)
        : await supabase.from('products').insert([payload]);
      
      if (error) throw error;

      alert(editingProductId ? 'পণ্য আপডেট করা হয়েছে!' : 'নতুন পণ্য যোগ করা হয়েছে!');
      setIsProductModalOpen(false);
      fetchData();
    } catch (error: any) {
      console.error('Error saving product:', error);
      const errorMessage = error.message === 'Failed to fetch' 
        ? 'সার্ভারের সাথে যোগাযোগ করা যাচ্ছে না। ইন্টারনেট চেক করুন অথবা AdBlocker বন্ধ করুন।' 
        : error.message || 'অজানা একটি সমস্যা হয়েছে।';
      alert(`পণ্য সেভ করা যায়নি: ${errorMessage}`);
    } finally {
      setIsSaving(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto my-32 p-10 bg-white rounded-[2.5rem] shadow-2xl text-center animate-fade-in border">
        <div className="bg-emerald-600 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6 text-white shadow-lg"><Settings size={32}/></div>
        <h2 className="text-2xl font-black mb-6 text-emerald-950">অ্যাডমিন প্যানেল</h2>
        <input type="password" value={password} onChange={e => setPassword(e.target.value)} className="w-full p-4 border-2 focus:border-emerald-500 rounded-2xl mb-4 font-bold outline-none transition-all text-center" placeholder="পাসওয়ার্ড দিন" />
        <button onClick={() => { if(password === 'admin123') setIsAuthenticated(true); else alert('ভুল পাসওয়ার্ড'); }} className="w-full bg-emerald-600 text-white py-4 rounded-2xl font-black text-lg shadow-lg hover:bg-emerald-700 transition-all">প্রবেশ করুন</button>
        <p className="mt-6 text-xs text-gray-400 font-bold uppercase tracking-widest">Default Pass: admin123</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 flex flex-col lg:flex-row gap-8 animate-fade-in">
      <div className="w-full lg:w-72 space-y-2 shrink-0">
        <div className="p-6 bg-emerald-950 rounded-3xl mb-4 text-white">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-400 mb-2">প্রশাসক</p>
          <h2 className="text-xl font-black">অ্যাডমিন ড্যাশবোর্ড</h2>
        </div>
        {[
          { id: 'DASHBOARD', label: 'সারসংক্ষেপ', icon: TrendingUp },
          { id: 'PRODUCTS', label: 'পণ্য তালিকা', icon: Package },
          { id: 'ORDERS', label: 'অর্ডারসমূহ', icon: ClipboardList },
          { id: 'SETTINGS', label: 'ডাটাবেস সেটিংস', icon: Database },
        ].map(tab => (
          <button 
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)} 
            className={`w-full text-left px-6 py-4 rounded-2xl font-black flex items-center gap-4 transition-all ${activeTab === tab.id ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-100 translate-x-1' : 'text-gray-500 hover:bg-gray-100'}`}
          >
            <tab.icon size={20}/> {tab.label}
          </button>
        ))}
        <button onClick={() => setIsAuthenticated(false)} className="w-full text-left px-6 py-4 rounded-2xl font-black text-red-500 mt-10 flex items-center gap-4 hover:bg-red-50 transition-all"><LogOut size={20}/> লগআউট</button>
      </div>

      <div className="flex-grow">
        {activeTab === 'DASHBOARD' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100">
                <p className="text-gray-400 font-bold text-xs uppercase mb-1 tracking-widest">মোট ডেলিভারি বিক্রয়</p>
                <p className="text-4xl font-black text-emerald-800">৳ {stats.totalSales}</p>
              </div>
              <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100">
                <p className="text-gray-400 font-bold text-xs uppercase mb-1 tracking-widest">অপেক্ষমান অর্ডার</p>
                <p className="text-4xl font-black text-amber-500">{stats.pendingOrders}</p>
              </div>
              <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100">
                <p className="text-gray-400 font-bold text-xs uppercase mb-1 tracking-widest">মোট পণ্য সংখ্যা</p>
                <p className="text-4xl font-black text-gray-800">{products.length}</p>
              </div>
            </div>
            
            <div className="bg-emerald-900 p-10 rounded-[2.5rem] text-white flex flex-col md:flex-row justify-between items-center gap-6">
              <div>
                <h3 className="text-2xl font-black mb-2">মার্কেট স্ট্যাটাস</h3>
                <p className="text-emerald-300 font-medium opacity-80">আপনার শপ এখন সক্রিয় আছে এবং গ্রাহকরা অর্ডার করতে পারছেন।</p>
              </div>
              <button onClick={fetchData} className="bg-emerald-600 px-8 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-950/20"><RefreshCw size={18}/> রিফ্রেশ করুন</button>
            </div>
          </div>
        )}

        {activeTab === 'PRODUCTS' && (
          <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-8 border-b flex justify-between items-center bg-gray-50/50">
              <h3 className="font-black text-xl text-gray-800">পণ্যের ডাটাবেস</h3>
              <button onClick={openAddModal} className="bg-emerald-600 text-white px-6 py-2.5 rounded-xl text-sm font-black flex items-center gap-2 shadow-lg hover:bg-emerald-700 active:scale-95 transition-all"><Plus size={18}/> নতুন পণ্য</button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 text-[10px] uppercase font-black text-gray-400 tracking-widest">
                  <tr><th className="p-6 text-left">নাম</th><th className="p-6 text-center">ক্যাটাগরি</th><th className="p-6 text-right">মূল্য</th><th className="p-6 text-center">অ্যাকশন</th></tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {products.map(p => (
                    <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                      <td className="p-6 flex items-center gap-3">
                        <img src={p.image} className="w-10 h-10 rounded-lg object-cover bg-gray-100" />
                        <span className="font-bold text-gray-800">{p.name}</span>
                      </td>
                      <td className="p-6 text-center"><span className="text-[10px] font-black bg-gray-100 px-3 py-1 rounded-full uppercase">{p.category}</span></td>
                      <td className="p-6 text-right font-black text-emerald-800">৳ {p.price} <span className="text-[10px] text-gray-400 font-bold">/ {p.unit}</span></td>
                      <td className="p-6 text-center flex justify-center gap-2">
                        <button onClick={() => openEditModal(p)} className="text-emerald-600 p-3 hover:bg-emerald-50 rounded-xl transition-all" title="এডিট করুন"><Edit size={20}/></button>
                        <button onClick={() => deleteProduct(p.id)} className="text-red-500 p-3 hover:bg-red-50 rounded-xl transition-all" title="ডিলিট করুন"><Trash2 size={20}/></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'ORDERS' && (
          <div className="space-y-4">
            {/* Filter and Search Bar */}
            <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
              <div className="relative w-full md:max-w-xs">
                <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input 
                  type="text" 
                  placeholder="গ্রাহকের নাম, ঠিকানা বা ফোন দিয়ে খুঁজুন..." 
                  value={orderSearchQuery} 
                  onChange={(e) => setOrderSearchQuery(e.target.value)} 
                  className="w-full bg-gray-50 border border-gray-200 focus:border-emerald-500 rounded-xl py-2.5 pl-11 pr-4 outline-none font-medium text-sm transition-all"
                />
              </div>
              <div className="flex gap-2 w-full md:w-auto overflow-x-auto no-scrollbar">
                {(['ALL', 'Pending', 'Delivered', 'Cancelled'] as const).map(status => (
                  <button
                    key={status}
                    onClick={() => setOrderStatusFilter(status)}
                    className={`px-4 py-2 rounded-xl text-xs font-black border transition-all whitespace-nowrap ${orderStatusFilter === status ? 'bg-emerald-600 border-emerald-600 text-white shadow-md' : 'bg-gray-50 border-gray-100 text-gray-500 hover:bg-gray-100'}`}
                  >
                    {status === 'ALL' ? 'সব অর্ডার' : status === 'Pending' ? 'অপেক্ষমান' : status === 'Delivered' ? 'ডেলিভারি সম্পন্ন' : 'বাতিল'}
                  </button>
                ))}
              </div>
            </div>

            {filteredOrders.length === 0 ? (
              <div className="text-center py-32 bg-white rounded-[2rem] border border-dashed border-gray-200 text-gray-300">
                <ClipboardList size={64} className="mx-auto mb-4 opacity-20" />
                <p className="font-black text-xl">কোনো অর্ডার পাওয়া যায়নি!</p>
              </div>
            ) : filteredOrders.map(o => (
              <div key={o.id} className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm flex flex-col lg:flex-row justify-between gap-8 group hover:shadow-md transition-all animate-fade-in">
                <div className="flex-grow">
                  <div className="flex flex-wrap items-center gap-3 mb-3">
                    <h4 className="text-xl font-black text-emerald-950">{o.customerName}</h4>
                    <span className={`text-[10px] font-black px-3 py-1 rounded-full ${o.status === 'Delivered' ? 'bg-emerald-100 text-emerald-700' : o.status === 'Pending' ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'}`}>
                      {o.status === 'Pending' ? 'পেন্ডিং' : o.status === 'Delivered' ? 'ডেলিভারি সম্পন্ন' : 'বাতিল'}
                    </span>
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{new Date(o.date).toLocaleString('bn-BD')}</span>
                  </div>
                  <p className="text-sm text-gray-500 font-bold mb-6 flex items-center gap-2"><Phone size={14}/> {o.phone} | <MapPin size={14}/> {o.address}</p>
                  
                  <div className="space-y-2">
                    {o.items.map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between text-sm bg-gray-50/50 p-3 rounded-xl border border-gray-50">
                        <span className="font-bold text-gray-700">{item.product.name} × {item.quantity}</span>
                        <span className="font-black text-emerald-800">৳ {item.product.price * item.quantity}</span>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="lg:text-right flex flex-row lg:flex-col justify-between items-end border-t lg:border-t-0 lg:border-l pt-6 lg:pt-0 lg:pl-10">
                  <div className="mb-4">
                    <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mb-1">মোট অর্ডার মূল্য</p>
                    <p className="text-3xl font-black text-emerald-800">৳ {o.total}</p>
                  </div>
                  <div className="flex flex-wrap gap-2 justify-end">
                    {o.status === 'Pending' ? (
                      <>
                        <button onClick={() => updateOrderStatus(o.id, 'Delivered')} className="bg-emerald-600 text-white px-4 py-2.5 rounded-xl shadow-md hover:bg-emerald-700 transition-all flex items-center gap-1.5 font-bold text-xs"><CheckCircle size={14}/> ডেলিভারি সম্পন্ন</button>
                        <button onClick={() => updateOrderStatus(o.id, 'Cancelled')} className="bg-red-50 text-red-600 px-4 py-2.5 rounded-xl border border-red-100 hover:bg-red-100 transition-all flex items-center gap-1.5 font-bold text-xs"><X size={14}/> বাতিল করুন</button>
                      </>
                    ) : (
                      <button onClick={() => updateOrderStatus(o.id, 'Pending')} className="bg-gray-100 text-gray-700 px-4 py-2.5 rounded-xl hover:bg-gray-200 transition-all flex items-center gap-1.5 font-bold text-xs"><RefreshCw size={14}/> পুনরায় পেন্ডিং করুন</button>
                    )}
                    <button onClick={async () => { if(confirm('অর্ডারটি চিরতরে মুছে ফেলতে চান?')) { const { error } = await supabase.from('orders').delete().eq('id', o.id); if(!error) fetchData(); } }} className="text-red-400 p-2.5 hover:bg-red-50 rounded-xl transition-all" title="মুছে ফেলুন"><Trash2 size={18}/></button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'SETTINGS' && (
          <div className="bg-white p-10 rounded-[2.5rem] border border-gray-100 shadow-sm text-center">
            <div className="bg-amber-50 w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-6 text-amber-500"><Database size={40}/></div>
            <h3 className="text-2xl font-black mb-4 text-emerald-950">ডাটাবেস ও স্টোরেজ সেটআপ</h3>
            <p className="text-gray-500 mb-8 font-medium leading-relaxed">আপনার Supabase প্রজেক্টে ডেটা ও ইমেজ আপলোড এনাবল করার জন্য নিচের SQL কোডটি কপি করে **SQL Editor**-এ রান করুন। এবং স্টোরেজ সেকশনে 'products' নামে একটি পাবলিক বাকেট তৈরি করুন।</p>
            <div className="relative mb-8">
              <pre className="bg-gray-950 text-emerald-400 p-6 rounded-2xl text-xs overflow-x-auto text-left whitespace-pre-wrap font-mono leading-relaxed shadow-2xl border-4 border-gray-900">{sqlSchema}</pre>
              <button 
                onClick={() => { navigator.clipboard.writeText(sqlSchema); setCopied(true); setTimeout(() => setCopied(false), 2000); }} 
                className="absolute top-4 right-4 bg-emerald-600/80 backdrop-blur-md text-white px-4 py-2 rounded-xl flex items-center gap-2 font-bold text-xs hover:bg-emerald-600 transition-all"
              >
                {copied ? <><CheckCircle2 size={14}/> কপি হয়েছে</> : <><Copy size={14}/> কপি করুন</>}
              </button>
            </div>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <button disabled={isSeeding} onClick={seedData} className="bg-emerald-600 text-white px-8 py-4 rounded-2xl font-black flex items-center justify-center gap-3 shadow-xl hover:bg-emerald-700 transition-all disabled:opacity-50">
                {isSeeding ? <RefreshCw className="animate-spin" size={20}/> : <Plus size={20}/>} ডেমো ডেটা যোগ করুন
              </button>
              <button onClick={fetchData} className="bg-gray-100 text-gray-700 px-8 py-4 rounded-2xl font-black hover:bg-gray-200 transition-all">কানেকশন চেক করুন</button>
            </div>
          </div>
        )}
      </div>

      {/* Product Add/Edit Modal */}
      {isProductModalOpen && (
        <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-xl rounded-[2.5rem] shadow-2xl p-10 overflow-y-auto max-h-[95vh] no-scrollbar">
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-2xl font-black text-emerald-950">
                {editingProductId ? 'পণ্য এডিট করুন' : 'নতুন পণ্য যোগ'}
              </h3>
              <button onClick={() => setIsProductModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-full"><X/></button>
            </div>
            <form onSubmit={saveProduct} className="space-y-6">
              {/* Image Upload Area */}
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">পণ্যের ছবি</label>
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className={`relative w-full aspect-video rounded-2xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-all overflow-hidden ${previewUrl ? 'border-emerald-500 bg-emerald-50' : 'border-gray-200 hover:border-emerald-400 hover:bg-gray-50'}`}
                >
                  {previewUrl ? (
                    <>
                      <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/20 opacity-0 hover:opacity-100 flex items-center justify-center transition-opacity">
                        <Upload className="text-white" size={32} />
                      </div>
                    </>
                  ) : (
                    <div className="flex flex-col items-center text-gray-400">
                      <ImageIcon size={48} strokeWidth={1} className="mb-2" />
                      <p className="text-sm font-bold">ইমেজ আপলোড করতে ক্লিক করুন</p>
                      <p className="text-[10px] mt-1">PNG, JPG up to 5MB</p>
                    </div>
                  )}
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    className="hidden" 
                    accept="image/*" 
                    onChange={handleFileChange} 
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">পণ্যের নাম</label>
                <input required value={productForm.name} onChange={e => setProductForm({...productForm, name: e.target.value})} className="w-full p-4 bg-gray-50 border-2 border-transparent focus:border-emerald-500 rounded-xl font-bold outline-none transition-all" placeholder="যেমন: মিনিকেট চাল" />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">মূল্য (৳)</label>
                  <input type="number" required value={productForm.price} onChange={e => setProductForm({...productForm, price: e.target.value})} className="w-full p-4 bg-gray-50 border-2 border-transparent focus:border-emerald-500 rounded-xl font-bold outline-none transition-all" placeholder="৬৫" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">স্টক পরিমাণ</label>
                  <input type="number" required value={productForm.stock} onChange={e => setProductForm({...productForm, stock: e.target.value})} className="w-full p-4 bg-gray-50 border-2 border-transparent focus:border-emerald-500 rounded-xl font-bold outline-none transition-all" placeholder="১০০" />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">একক</label>
                <input required value={productForm.unit} onChange={e => setProductForm({...productForm, unit: e.target.value})} className="w-full p-4 bg-gray-50 border-2 border-transparent focus:border-emerald-500 rounded-xl font-bold outline-none transition-all" placeholder="কেজি" />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">ক্যাটাগরি</label>
                <select 
                  value={productForm.category} 
                  onChange={e => setProductForm({...productForm, category: e.target.value as Category})}
                  className="w-full p-4 bg-gray-50 border-2 border-transparent focus:border-emerald-500 rounded-xl font-bold outline-none transition-all cursor-pointer"
                >
                  {Object.values(Category).filter(c => c !== Category.ALL).map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">সংক্ষিপ্ত বর্ণনা</label>
                <textarea value={productForm.description} onChange={e => setProductForm({...productForm, description: e.target.value})} className="w-full p-4 bg-gray-50 border-2 border-transparent focus:border-emerald-500 rounded-xl font-bold outline-none transition-all" placeholder="পণ্য সম্পর্কে বিস্তারিত" rows={3} />
              </div>

              <button 
                type="submit" 
                disabled={isSaving}
                className="w-full bg-emerald-600 text-white py-5 rounded-2xl font-black text-lg shadow-xl hover:bg-emerald-700 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="animate-spin" size={20}/>
                    প্রসেসিং হচ্ছে...
                  </>
                ) : (
                  <>
                    <CheckCircle size={20}/>
                    {editingProductId ? 'আপডেট করুন' : 'পণ্য সেভ করুন'}
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;
