
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { ShoppingCart, Store, Info, Phone, Search, Menu, X, Settings, CheckCircle, MapPin, AlertTriangle, ChevronRight, ChevronLeft } from 'lucide-react';
import { ViewType, Category, Product, CartItem, Order, Slide } from './types';
import { INITIAL_PRODUCTS, INITIAL_SLIDES } from './data';
import { supabase } from './supabase';
import AdminPanel from './components/AdminPanel';
import CartSidebar from './components/CartSidebar';
import ProductCard from './components/ProductCard';
import confetti from 'canvas-confetti';

const Toast = ({ message, type, onClose }: { message: string, type: 'success' | 'error', onClose: () => void }) => (
  <div className={`fixed bottom-24 left-1/2 -translate-x-1/2 z-[200] px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-3 animate-fade-in ${type === 'success' ? 'bg-emerald-600 text-white' : 'bg-red-600 text-white'}`}>
    {type === 'success' ? <CheckCircle size={20} /> : <AlertTriangle size={20} />}
    <span className="font-bold">{message}</span>
    <button onClick={onClose} className="ml-2 hover:opacity-70"><X size={16}/></button>
  </div>
);

const App: React.FC = () => {
  const [view, setView] = useState<ViewType>('STORE');
  const [products, setProducts] = useState<Product[]>([]);
  const [slides, setSlides] = useState<Slide[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dbError, setDbError] = useState<boolean>(false);
  const [toast, setToast] = useState<{ message: string, type: 'success' | 'error' } | null>(null);

  const [cart, setCart] = useState<CartItem[]>([]);
  const [activeCategory, setActiveCategory] = useState<Category>(Category.ALL);
  const [searchQuery, setSearchQuery] = useState('');
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isCartBouncing, setIsCartBouncing] = useState(false);

  const showToast = useCallback((message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  }, []);

  const fetchData = async () => {
    try {
      const { data: prodData, error: prodError } = await supabase.from('products').select('*');
      const { data: slideData } = await supabase.from('slides').select('*');
      const { data: orderData } = await supabase.from('orders').select('*').order('date', { ascending: false });

      if (prodError?.code === '42P01') {
        setDbError(true);
        setView('SETUP_REQUIRED');
        return;
      }

      setProducts(prodData && prodData.length > 0 ? prodData : INITIAL_PRODUCTS);
      setSlides(slideData && slideData.length > 0 ? slideData : INITIAL_SLIDES);
      setOrders(orderData || []);
    } catch (error) {
      console.error('Fetch error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Run on mount
  useEffect(() => {
    fetchData();

    // Subscribe to changes globally
    const channels = (supabase.channel('global-changes') as any)
      .on('postgres_changes', { event: '*', table: 'orders' }, (payload: any) => {
        if (payload.eventType === 'INSERT') {
          setOrders(prev => [payload.new as Order, ...prev]);
          showToast('নতুন একটি অর্ডার এসেছে!', 'success');
        } else if (payload.eventType === 'UPDATE') {
          setOrders(prev => prev.map(o => o.id === payload.new.id ? { ...o, ...payload.new } : o));
        } else if (payload.eventType === 'DELETE') {
          setOrders(prev => prev.filter(o => o.id !== payload.old.id));
        }
      })
      .on('postgres_changes', { event: '*', table: 'products' }, () => {
        fetchData(); // Simple refresh for product changes
      })
      .subscribe();

    return () => { supabase.removeChannel(channels); };
  }, [showToast]);

  // Slideshow timer
  useEffect(() => {
    if (view === 'STORE' && slides.length > 1) {
      const timer = setInterval(() => {
        setCurrentSlide(prev => (prev + 1) % slides.length);
      }, 6000);
      return () => clearInterval(timer);
    }
  }, [view, slides.length]);

  const addToCart = useCallback((product: Product) => {
    if (product.stock !== undefined && product.stock <= 0) {
      showToast('দুঃখিত, এই পণ্যটি এখন স্টকে নেই!', 'error');
      return;
    }

    let limitReached = false;
    setCart(prev => {
      const existing = prev.find(item => item.product.id === product.id);
      if (existing) {
        if (product.stock !== undefined && existing.quantity >= product.stock) {
          limitReached = true;
          return prev;
        }
        return prev.map(item => item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { product, quantity: 1 }];
    });

    if (limitReached) {
      showToast('দুঃখিত, স্টকের চেয়ে বেশি পরিমাণ যোগ করা সম্ভব নয়!', 'error');
      return;
    }

    setIsCartBouncing(true);
    setTimeout(() => setIsCartBouncing(false), 500);
    showToast(`${product.name} যোগ করা হয়েছে`);
  }, [showToast]);

  const cartTotal = useMemo(() => cart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0), [cart]);

  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const matchesCategory = activeCategory === Category.ALL || p.category === activeCategory;
      const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [products, activeCategory, searchQuery]);

  const placeOrder = async (customerData: { name: string, phone: string, address: string }) => {
    const newOrder = {
      customerName: customerData.name,
      phone: customerData.phone,
      address: customerData.address,
      items: cart,
      total: cartTotal,
      status: 'Pending',
      date: new Date().toISOString()
    };

    const { error } = await supabase.from('orders').insert([newOrder]);

    if (error) {
      showToast('অর্ডার দিতে ব্যর্থ হয়েছে। ইন্টারনেট চেক করুন।', 'error');
    } else {
      setCart([]);
      setView('ORDER_SUCCESS');
      confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 } });
    }
  };

  if (isLoading) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-white">
        <div className="w-12 h-12 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-emerald-800 font-bold tracking-widest uppercase text-xs">Samsul's Grocery is Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col font-sans bg-gray-50">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-4 h-20 flex justify-between items-center gap-4">
          <div className="flex items-center gap-3 cursor-pointer shrink-0" onClick={() => { setView('STORE'); window.scrollTo(0,0); }}>
            <div className="bg-emerald-600 p-2.5 rounded-2xl text-white shadow-lg"><Store size={24} /></div>
            <div className="hidden sm:block">
              <h1 className="text-xl font-black text-emerald-900 leading-none">সামসুল'স গ্রোসরি</h1>
              <p className="text-[10px] text-gray-400 font-bold flex items-center gap-1 uppercase tracking-tighter mt-1"><MapPin size={10}/> বদলগাছী, নওগাঁ</p>
            </div>
          </div>

          {view === 'STORE' && (
            <div className="hidden md:flex flex-grow max-w-xl relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input 
                type="text"
                placeholder="কি খুঁজছেন?"
                className="w-full bg-gray-100 border-2 border-transparent focus:border-emerald-500 focus:bg-white rounded-2xl py-3 pl-12 pr-4 outline-none transition-all font-medium text-sm"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          )}

          <div className="flex items-center gap-4">
            <nav className="hidden lg:flex items-center gap-2">
              <button onClick={() => {setView('STORE'); window.scrollTo(0,0);}} className={`px-4 py-2 rounded-xl font-bold transition-colors ${view === 'STORE' ? 'text-emerald-700 bg-emerald-50' : 'text-gray-500 hover:text-emerald-600'}`}>হোম</button>
              <button onClick={() => {setView('ABOUT'); window.scrollTo(0,0);}} className={`px-4 py-2 rounded-xl font-bold transition-colors ${view === 'ABOUT' ? 'text-emerald-700 bg-emerald-50' : 'text-gray-500 hover:text-emerald-600'}`}>আমাদের সম্পর্কে</button>
              <button onClick={() => {setView('ADMIN'); window.scrollTo(0,0);}} className={`px-4 py-2 rounded-xl font-bold transition-colors ${view === 'ADMIN' ? 'text-emerald-700 bg-emerald-50' : 'text-gray-500 hover:text-emerald-600'}`}>অ্যাডমিন</button>
            </nav>
            <button 
              onClick={() => setIsCartOpen(true)} 
              className={`relative p-3 bg-gray-100 hover:bg-emerald-50 rounded-2xl transition-all ${isCartBouncing ? 'scale-110 cart-bounce' : ''}`}
            >
              <ShoppingCart size={22} className="text-gray-700" />
              {cart.length > 0 && <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-black w-5 h-5 flex items-center justify-center rounded-full border-2 border-white">{cart.length}</span>}
            </button>
            <button className="lg:hidden p-2" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}><Menu size={24} /></button>
          </div>
        </div>
      </header>

      {isMobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-[60] bg-white p-6 animate-fade-in flex flex-col">
          <div className="flex justify-end mb-8"><button onClick={() => setIsMobileMenuOpen(false)}><X size={32}/></button></div>
          <nav className="flex flex-col gap-4">
            <button onClick={() => {setView('STORE'); setIsMobileMenuOpen(false); window.scrollTo(0,0);}} className="text-2xl font-black text-emerald-900 border-b pb-4 text-left">হোম পেজ</button>
            <button onClick={() => {setView('ADMIN'); setIsMobileMenuOpen(false); window.scrollTo(0,0);}} className="text-2xl font-black text-emerald-900 border-b pb-4 text-left">অ্যাডমিন প্যানেল</button>
            <button onClick={() => {setView('ABOUT'); setIsMobileMenuOpen(false); window.scrollTo(0,0);}} className="text-2xl font-black text-emerald-900 border-b pb-4 text-left">আমাদের সম্পর্কে</button>
          </nav>
        </div>
      )}

      <main className="flex-grow">
        {view === 'STORE' && (
          <div className="animate-fade-in">
            <div className="max-w-7xl mx-auto px-4 py-6">
              {/* Slideshow */}
              {slides.length > 0 && (
                <div className="relative rounded-[2.5rem] overflow-hidden mb-8 h-[250px] md:h-[500px] shadow-xl bg-emerald-900 group">
                  {slides.map((slide, index) => (
                    <div 
                      key={slide.id} 
                      className={`absolute inset-0 transition-all duration-1000 transform ${index === currentSlide ? 'opacity-100 scale-100' : 'opacity-0 scale-105 pointer-events-none'}`}
                    >
                      <img src={slide.image} className="w-full h-full object-cover opacity-40" alt={slide.title} />
                      <div className="absolute inset-0 flex flex-col justify-center px-8 md:px-20">
                        <h2 className="text-2xl md:text-6xl font-black text-white mb-4 max-w-2xl leading-tight">{slide.title}</h2>
                        <p className="text-emerald-100 mb-8 text-sm md:text-xl max-w-md font-medium">{slide.subtitle}</p>
                        <button 
                          onClick={() => document.getElementById('products')?.scrollIntoView({behavior:'smooth'})} 
                          className="bg-white text-emerald-900 px-10 py-4 rounded-2xl font-black w-fit shadow-xl hover:scale-105 transition-transform"
                        >
                          {slide.buttonText}
                        </button>
                      </div>
                    </div>
                  ))}
                  
                  {/* Indicators */}
                  <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
                    {slides.map((_, idx) => (
                      <button 
                        key={idx} 
                        onClick={() => setCurrentSlide(idx)}
                        className={`h-2 rounded-full transition-all ${idx === currentSlide ? 'w-8 bg-white' : 'w-2 bg-white/40'}`}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Mobile Search Bar */}
              <div className="md:hidden relative mb-6">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                  <Search size={18} />
                </span>
                <input 
                  type="text"
                  placeholder="কি খুঁজছেন?"
                  className="w-full bg-white border border-gray-200 focus:border-emerald-500 rounded-2xl py-3.5 pl-12 pr-4 outline-none transition-all font-medium text-sm shadow-sm"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              <div className="flex gap-3 overflow-x-auto no-scrollbar pb-6 sticky top-20 bg-gray-50/80 backdrop-blur-sm z-30 pt-2 mb-2">
                {Object.values(Category).map(cat => (
                  <button 
                    key={cat} 
                    onClick={() => setActiveCategory(cat)} 
                    className={`px-6 py-2.5 rounded-xl font-bold whitespace-nowrap border-2 transition-all ${activeCategory === cat ? 'bg-emerald-600 border-emerald-600 text-white shadow-lg' : 'bg-white border-gray-100 text-gray-500 hover:border-emerald-200'}`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              <div id="products" className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 md:gap-6">
                {filteredProducts.map(p => (
                  <ProductCard key={p.id} product={p} onAddToCart={addToCart} onQuickView={() => setSelectedProduct(p)} />
                ))}
              </div>
              
              {filteredProducts.length === 0 && (
                <div className="py-20 text-center flex flex-col items-center">
                  <div className="bg-gray-100 p-6 rounded-full mb-4 text-gray-300"><Search size={48}/></div>
                  <p className="text-gray-500 font-bold">দুঃখিত, কোনো পণ্য পাওয়া যায়নি!</p>
                </div>
              )}
            </div>
          </div>
        )}

        {view === 'CHECKOUT' && (
          <div className="max-w-xl mx-auto py-16 px-4 animate-fade-in">
            <h2 className="text-3xl font-black mb-8 text-emerald-900">ডেলিভারি তথ্য দিন</h2>
            <form onSubmit={(e) => { e.preventDefault(); const fd = new FormData(e.currentTarget); placeOrder({ name: fd.get('name') as string, phone: fd.get('phone') as string, address: fd.get('address') as string }); }} className="bg-white p-8 rounded-[2rem] shadow-xl space-y-5">
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-400 uppercase ml-2">আপনার নাম</label>
                <input name="name" required className="w-full p-4 bg-gray-50 border-2 border-transparent focus:border-emerald-500 rounded-xl font-bold outline-none transition-all" placeholder="যেমন: সামসুল হক" />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-400 uppercase ml-2">মোবাইল নম্বর</label>
                <input name="phone" required type="tel" className="w-full p-4 bg-gray-50 border-2 border-transparent focus:border-emerald-500 rounded-xl font-bold outline-none transition-all" placeholder="যেমন: ০১৭০০০০০০০০" />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-400 uppercase ml-2">ডেলিভারি ঠিকানা</label>
                <textarea name="address" required className="w-full p-4 bg-gray-50 border-2 border-transparent focus:border-emerald-500 rounded-xl font-bold outline-none transition-all" placeholder="আপনার গ্রাম ও বাড়ির ঠিকানা" rows={3}></textarea>
              </div>
              <div className="pt-4 border-t flex justify-between items-center">
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-gray-400 uppercase">মোট প্রদেয়</span>
                  <span className="text-2xl font-black text-emerald-800">৳ {cartTotal}</span>
                </div>
                <button type="submit" className="bg-emerald-600 text-white px-10 py-4 rounded-xl font-black shadow-xl hover:bg-emerald-700 transition-all active:scale-95">অর্ডার করুন</button>
              </div>
            </form>
          </div>
        )}

        {view === 'ORDER_SUCCESS' && (
          <div className="max-w-xl mx-auto py-32 text-center px-4">
            <div className="w-24 h-24 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-8"><CheckCircle size={48} /></div>
            <h2 className="text-4xl font-black text-emerald-900 mb-4 tracking-tight">অর্ডার সফল হয়েছে!</h2>
            <p className="text-gray-500 mb-10 text-lg font-medium">ধন্যবাদ! আমরা খুব শীঘ্রই আপনার ঠিকানায় বাজার পৌঁছে দেব। আমাদের প্রতিনিধি কল দিয়ে কনফার্ম করবেন।</p>
            <button onClick={() => setView('STORE')} className="bg-emerald-600 text-white px-12 py-5 rounded-2xl font-black shadow-xl hover:bg-emerald-700 transition-all">আরো বাজার করুন</button>
          </div>
        )}

        {view === 'ADMIN' && (
          <AdminPanel 
            products={products} setProducts={setProducts} 
            slides={slides} setSlides={setSlides}
            orders={orders} setOrders={setOrders}
            needsSetup={dbError}
            fetchData={fetchData}
          />
        )}

        {view === 'ABOUT' && (
          <div className="max-w-3xl mx-auto py-20 px-6 animate-fade-in">
            <h2 className="text-4xl font-black text-emerald-900 mb-8 text-center">আমাদের সম্পর্কে</h2>
            <div className="bg-white p-10 rounded-[2.5rem] shadow-lg space-y-6">
              <p className="text-lg text-gray-600 leading-relaxed font-medium">বদলগাছী বাজারের বিশ্বস্ততার প্রতীক **সামসুল'স গ্রোসরি**। আমরা সরাসরি খামারি ও পাইকারি বাজার থেকে পণ্য সংগ্রহ করে আপনার দোরগোড়ায় পৌঁছে দিই।</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-emerald-50 p-6 rounded-2xl">
                  <h4 className="font-bold text-emerald-800 mb-2">১ ঘণ্টায় ডেলিভারি</h4>
                  <p className="text-sm text-gray-500 font-medium">বদলগাছী সদরের ভেতর আমরা ১ ঘণ্টার দ্রুততম ডেলিভারি দিয়ে থাকি।</p>
                </div>
                <div className="bg-emerald-50 p-6 rounded-2xl">
                  <h4 className="font-bold text-emerald-800 mb-2">সেরা গুণমান</h4>
                  <p className="text-sm text-gray-500 font-medium">পণ্যের সতেজতা এবং গুণগত মানে আমরা কোনো আপোষ করি না।</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {view === 'SETUP_REQUIRED' && (
          <div className="flex flex-col items-center justify-center py-32 px-4 text-center animate-fade-in">
            <AlertTriangle size={64} className="text-amber-500 mb-6" />
            <h2 className="text-2xl font-black mb-2 text-emerald-950">ডাটাবেস কানেকশন ত্রুটি</h2>
            <p className="text-gray-500 mb-8 max-w-sm font-medium leading-relaxed">আপনার Supabase প্রজেক্টে এখনও প্রয়োজনীয় টেবিলগুলো তৈরি করা হয়নি। অ্যাডমিন প্যানেলে গিয়ে সেটআপ সম্পন্ন করুন।</p>
            <button onClick={() => setView('ADMIN')} className="bg-emerald-600 text-white px-8 py-3 rounded-xl font-bold shadow-lg">সেটআপ প্যানেল</button>
          </div>
        )}
      </main>

      {/* Product View Modal */}
      {selectedProduct && (() => {
        const isOutOfStock = selectedProduct.stock !== undefined && selectedProduct.stock <= 0;
        return (
          <div className="fixed inset-0 z-[100] bg-black/70 backdrop-blur-md flex items-center justify-center p-4" onClick={() => setSelectedProduct(null)}>
            <div className="bg-white w-full max-w-4xl rounded-[2.5rem] shadow-2xl overflow-hidden animate-fade-in flex flex-col md:flex-row" onClick={e => e.stopPropagation()}>
              <div className="relative w-full md:w-1/2 h-72 md:h-auto">
                <img src={selectedProduct.image} className="w-full h-full object-cover" alt={selectedProduct.name} />
                <button onClick={() => setSelectedProduct(null)} className="absolute top-6 left-6 bg-white/80 p-2 rounded-full md:hidden"><X/></button>
              </div>
              <div className="p-8 md:p-12 flex flex-col justify-between md:w-1/2">
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest bg-emerald-50 px-3 py-1 rounded-full">{selectedProduct.category}</span>
                    <button onClick={() => setSelectedProduct(null)} className="hidden md:block p-2 hover:bg-gray-100 rounded-full transition-all"><X size={24}/></button>
                  </div>
                  <h3 className="text-3xl font-black mb-4 text-gray-900">{selectedProduct.name}</h3>
                  <p className="text-gray-500 mb-6 text-lg font-medium leading-relaxed">{selectedProduct.description}</p>
                  
                  {/* Stock Information */}
                  <div className="mb-6">
                    {isOutOfStock ? (
                      <span className="bg-red-50 text-red-600 border border-red-100 rounded-xl px-4 py-2 text-sm font-bold">দুঃখিত, স্টক শেষ!</span>
                    ) : selectedProduct.stock !== undefined ? (
                      <span className="bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-xl px-4 py-2 text-sm font-bold">স্টক পরিমাণ: {selectedProduct.stock} {selectedProduct.unit}</span>
                    ) : null}
                  </div>

                  <div className="text-4xl font-black text-emerald-800 mb-10">৳ {selectedProduct.price} <span className="text-base font-bold text-gray-400">/ {selectedProduct.unit}</span></div>
                </div>
                <button 
                  disabled={isOutOfStock}
                  onClick={() => { addToCart(selectedProduct); setSelectedProduct(null); setIsCartOpen(true); }} 
                  className={`w-full py-5 rounded-2xl font-black text-xl flex items-center justify-center gap-3 shadow-xl transition-all ${isOutOfStock ? 'bg-gray-200 text-gray-400 cursor-not-allowed shadow-none' : 'bg-emerald-600 text-white hover:bg-emerald-700 active:scale-95'}`}
                >
                  <ShoppingCart size={24}/> {isOutOfStock ? 'স্টক শেষ' : 'ব্যাগে যোগ করুন'}
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      <footer className="bg-gray-950 text-white py-16 text-center mt-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col items-center mb-10">
            <div className="bg-emerald-600 p-3 rounded-2xl text-white mb-4"><Store size={32}/></div>
            <h2 className="text-3xl font-black mb-2 tracking-tight">সামসুল'স গ্রোসরি</h2>
            <p className="text-gray-500 font-medium">বদলগাছী সদর, নওগাঁ | ফোন: ০১৭০০-০০০০০০</p>
          </div>
          <div className="flex flex-wrap justify-center gap-6 text-sm font-bold text-gray-400 mb-12">
            <button onClick={() => setView('STORE')} className="hover:text-emerald-400 transition">হোম</button>
            <button onClick={() => setView('ABOUT')} className="hover:text-emerald-400 transition">আমাদের সম্পর্কে</button>
            <button onClick={() => setView('ADMIN')} className="hover:text-emerald-400 transition">অ্যাডমিন</button>
          </div>
          <div className="border-t border-gray-900 pt-8">
            <p className="text-[10px] text-gray-700 font-bold uppercase tracking-[0.5em]">© ২০২৪ SAMSUL GROCERY - ALL RIGHTS RESERVED</p>
          </div>
        </div>
      </footer>

      <CartSidebar 
        isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} 
        cart={cart} updateQuantity={(id, d) => setCart(prev => prev.map(i => {
          if (i.product.id === id) {
            const nextQty = i.quantity + d;
            if (d > 0 && i.product.stock !== undefined && nextQty > i.product.stock) {
              showToast('দুঃখিত, স্টকের চেয়ে বেশি পরিমাণ যোগ করা সম্ভব নয়!', 'error');
              return i;
            }
            return { ...i, quantity: Math.max(1, nextQty) };
          }
          return i;
        }))} 
        removeFromCart={(id) => setCart(prev => prev.filter(i => i.product.id !== id))} 
        onCheckout={() => { setIsCartOpen(false); setView('CHECKOUT'); }} 
      />
    </div>
  );
};

export default App;
