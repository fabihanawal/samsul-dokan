
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { ShoppingCart, Store, Info, Phone, Search, Menu, X, ArrowRight, Settings, CheckCircle, MapPin, Heart, AlertTriangle, Eye } from 'lucide-react';
import { ViewType, Category, Product, CartItem, Order, Slide } from './types';
import { INITIAL_PRODUCTS, INITIAL_SLIDES } from './data';
import { supabase } from './supabase';
import AdminPanel from './components/AdminPanel';
import CartSidebar from './components/CartSidebar';
import ProductCard from './components/ProductCard';
import confetti from 'canvas-confetti';

const App: React.FC = () => {
  const [view, setView] = useState<ViewType | 'ORDER_SUCCESS' | 'SETUP_REQUIRED'>('STORE');
  const [products, setProducts] = useState<Product[]>([]);
  const [slides, setSlides] = useState<Slide[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dbError, setDbError] = useState<string | null>(null);

  const [cart, setCart] = useState<CartItem[]>([]);
  const [activeCategory, setActiveCategory] = useState<Category>(Category.ALL);
  const [searchQuery, setSearchQuery] = useState('');
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isCartBouncing, setIsCartBouncing] = useState(false);

  const refreshData = async () => {
    setIsLoading(true);
    setDbError(null);
    try {
      const { data: prodData, error: prodError } = await supabase.from('products').select('*');
      const { data: slideData, error: slideError } = await supabase.from('slides').select('*');
      const { data: orderData } = await supabase.from('orders').select('*').order('date', { ascending: false });

      if (prodError?.code === '42P01' || slideError?.code === '42P01') {
        setDbError('DATABASE_TABLES_MISSING');
        setView('SETUP_REQUIRED');
        return;
      }

      if (prodData && prodData.length > 0) setProducts(prodData);
      else setProducts(INITIAL_PRODUCTS);

      if (slideData && slideData.length > 0) setSlides(slideData);
      else setSlides(INITIAL_SLIDES);

      if (orderData) setOrders(orderData);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshData();
  }, []);

  useEffect(() => {
    if (view === 'STORE' && slides.length > 0) {
      const timer = setInterval(() => {
        setCurrentSlide(prev => (prev + 1) % slides.length);
      }, 5000);
      return () => clearInterval(timer);
    }
  }, [view, slides.length]);

  const addToCart = useCallback((product: Product) => {
    setCart(prev => {
      const existing = prev.find(item => item.product.id === product.id);
      if (existing) {
        return prev.map(item => 
          item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
    
    // Bounce feedback
    setIsCartBouncing(true);
    setTimeout(() => setIsCartBouncing(false), 500);
  }, []);

  const removeFromCart = useCallback((productId: string) => {
    setCart(prev => prev.filter(item => item.product.id !== productId));
  }, []);

  const updateQuantity = useCallback((productId: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.product.id === productId) {
        const newQty = Math.max(1, item.quantity + delta);
        return { ...item, quantity: newQty };
      }
      return item;
    }));
  }, []);

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

    const { data, error } = await supabase.from('orders').insert([newOrder]).select();

    if (error) {
      alert('অর্ডার সেভ করতে সমস্যা হয়েছে। দয়া করে আপনার ইন্টারনেট কানেকশন চেক করুন।');
    } else {
      setOrders(prev => [data[0], ...prev]);
      setCart([]);
      setView('ORDER_SUCCESS');
      confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#059669', '#10b981', '#34d399', '#ffffff']
      });
    }
  };

  const NavItem: React.FC<{ label: string; viewTarget: ViewType; icon?: React.ReactNode }> = ({ label, viewTarget, icon }) => (
    <button 
      onClick={() => { setView(viewTarget); setIsMobileMenuOpen(false); window.scrollTo(0,0); }}
      className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold transition-all duration-300 ${
        view === viewTarget ? 'text-emerald-700 bg-emerald-50 shadow-sm border border-emerald-100' : 'text-gray-500 hover:text-emerald-600 hover:bg-gray-50'
      }`}
    >
      {icon}
      <span>{label}</span>
    </button>
  );

  if (isLoading) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-white">
        <div className="w-16 h-16 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-emerald-800 font-bold animate-pulse tracking-widest">লোডিং হচ্ছে...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col selection:bg-emerald-100">
      {/* Top Banner */}
      <div className="bg-emerald-800 text-white text-[10px] md:text-xs py-2 px-4 text-center font-bold tracking-wider uppercase">
        বদলগাছী সদরে ১ ঘণ্টার মধ্যে হোম ডেলিভারি ফ্রি! আজই অর্ডার করুন।
      </div>

      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20 gap-4">
            {/* Logo */}
            <div className="flex items-center gap-4 cursor-pointer shrink-0" onClick={() => setView('STORE')}>
              <div className="bg-emerald-600 p-2.5 rounded-2xl text-white shadow-lg shadow-emerald-100 transition-transform active:scale-90"><Store size={26} /></div>
              <div className="hidden sm:block">
                <h1 className="text-xl font-black text-emerald-900 leading-none">সামসুল'স গ্রোসরি</h1>
                <p className="text-[10px] text-gray-400 font-bold mt-1 flex items-center gap-1 uppercase tracking-tighter"><MapPin size={10}/> বদলগাছী, নওগাঁ</p>
              </div>
            </div>

            {/* Search Bar - Desktop */}
            {view === 'STORE' && (
              <div className="hidden md:flex flex-grow max-w-xl relative group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-emerald-500 transition-colors" size={18} />
                <input 
                  type="text"
                  placeholder="আপনার প্রিয় পণ্যটি খুঁজুন..."
                  className="w-full bg-gray-50 border-2 border-transparent focus:border-emerald-500 focus:bg-white rounded-2xl py-3 pl-12 pr-4 outline-none transition-all font-medium text-sm shadow-inner"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center gap-2 md:gap-4">
              <nav className="hidden lg:flex items-center gap-1">
                <NavItem label="হোম" viewTarget="STORE" icon={<Store size={18} />} />
                <NavItem label="আমাদের কথা" viewTarget="ABOUT" icon={<Info size={18} />} />
                <NavItem label="অ্যাডমিন" viewTarget="ADMIN" icon={<Settings size={18} />} />
              </nav>
              
              <div className="h-8 w-[1px] bg-gray-200 hidden lg:block mx-2"></div>

              <button 
                onClick={() => setIsCartOpen(true)} 
                className={`group relative p-3 text-gray-700 hover:bg-emerald-50 rounded-2xl transition-all active:scale-95 ${isCartBouncing ? 'animate-bounce' : ''}`}
              >
                <ShoppingCart size={24} className="group-hover:text-emerald-600" />
                {cart.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-black w-6 h-6 flex items-center justify-center rounded-full border-4 border-white shadow-sm animate-fade-in">
                    {cart.length}
                  </span>
                )}
              </button>
              
              <button 
                className="lg:hidden p-3 text-gray-700 hover:bg-gray-100 rounded-2xl" 
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              >
                {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Floating Cart Button for Mobile */}
      {cart.length > 0 && !isCartOpen && view === 'STORE' && (
        <button 
          onClick={() => setIsCartOpen(true)}
          className={`fixed bottom-6 right-6 z-50 md:hidden bg-emerald-600 text-white p-5 rounded-full shadow-2xl flex items-center gap-3 animate-fade-in ${isCartBouncing ? 'scale-110' : 'scale-100'} transition-transform`}
        >
          <div className="relative">
            <ShoppingCart size={24} />
            <span className="absolute -top-4 -right-4 bg-red-500 text-white text-[10px] font-black w-6 h-6 flex items-center justify-center rounded-full border-2 border-emerald-600">{cart.length}</span>
          </div>
          <span className="font-black">৳ {cartTotal}</span>
        </button>
      )}

      {/* Mobile Navigation Drawer */}
      {isMobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 top-20 bg-white z-50 p-6 animate-fade-in border-t shadow-2xl">
          <nav className="flex flex-col gap-3">
            <NavItem label="হোম পেজ" viewTarget="STORE" icon={<Store size={22} />} />
            <NavItem label="আমাদের সম্পর্কে" viewTarget="ABOUT" icon={<Info size={22} />} />
            <NavItem label="অ্যাডমিন প্যানেল" viewTarget="ADMIN" icon={<Settings size={22} />} />
          </nav>
        </div>
      )}

      <main className="flex-grow">
        {view === 'STORE' && (
          <div className="animate-fade-in">
            {/* Hero Slider */}
            <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
              {slides.length > 0 && (
                <div className="relative rounded-[2.5rem] overflow-hidden mb-10 h-72 md:h-[500px] shadow-2xl bg-emerald-900 group">
                  {slides.map((slide, index) => (
                    <div key={slide.id} className={`absolute inset-0 transition-all duration-1000 ease-out ${index === currentSlide ? 'opacity-100 scale-100' : 'opacity-0 scale-105 pointer-events-none'}`}>
                      <img src={slide.image} alt={slide.title} className="w-full h-full object-cover opacity-50" />
                      <div className="absolute inset-0 bg-gradient-to-r from-emerald-950/95 via-emerald-900/40 to-transparent flex flex-col justify-center px-8 md:px-20">
                        <span className="text-emerald-400 font-black text-xs md:text-sm uppercase tracking-[0.4em] mb-4">সামসুল'স গ্রোসরি স্পেশাল</span>
                        <h2 className="text-3xl md:text-6xl font-black text-white mb-6 leading-tight max-w-2xl">{slide.title}</h2>
                        <p className="text-emerald-100/90 text-sm md:text-xl mb-10 max-w-lg leading-relaxed font-medium">{slide.subtitle}</p>
                        <button 
                          onClick={() => {
                            const productsSection = document.getElementById('products-grid');
                            productsSection?.scrollIntoView({ behavior: 'smooth' });
                          }} 
                          className="bg-white text-emerald-900 px-10 py-4 rounded-2xl font-black w-fit hover:bg-emerald-50 transition-all shadow-xl"
                        >
                          {slide.buttonText}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Category Filter */}
              <div className="mb-10">
                <div className="flex gap-4 overflow-x-auto no-scrollbar pb-4 -mx-4 px-4">
                  {Object.values(Category).map(cat => (
                    <button
                      key={cat}
                      onClick={() => setActiveCategory(cat)}
                      className={`px-8 py-3.5 rounded-2xl font-black whitespace-nowrap transition-all border-2 text-sm ${
                        activeCategory === cat 
                        ? 'bg-emerald-600 border-emerald-600 text-white shadow-xl shadow-emerald-200' 
                        : 'bg-white border-gray-100 text-gray-500 hover:border-emerald-200 hover:text-emerald-600'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Product Grid */}
              <div id="products-grid" className="scroll-mt-32">
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-8">
                  {filteredProducts.map(product => (
                    <ProductCard 
                      key={product.id} 
                      product={product} 
                      onAddToCart={addToCart} 
                      onQuickView={() => setSelectedProduct(product)}
                    />
                  ))}
                </div>
                {filteredProducts.length === 0 && (
                  <div className="py-24 text-center">
                    <p className="text-2xl font-black text-gray-400">দুঃখিত, কোনো পণ্য পাওয়া যায়নি!</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {view === 'CHECKOUT' && (
          <div className="max-w-xl mx-auto py-20 px-4 animate-fade-in">
            <h2 className="text-4xl font-black mb-10 text-center text-emerald-900">চেকআউট</h2>
            <form onSubmit={(e) => {
              e.preventDefault();
              const fd = new FormData(e.currentTarget);
              placeOrder({
                name: fd.get('name') as string,
                phone: fd.get('phone') as string,
                address: fd.get('address') as string,
              });
            }} className="bg-white p-10 rounded-[3rem] shadow-2xl space-y-6">
              <input name="name" required className="w-full p-4 bg-gray-50 border rounded-2xl font-bold" placeholder="আপনার নাম" />
              <input name="phone" required type="tel" className="w-full p-4 bg-gray-50 border rounded-2xl font-bold" placeholder="মোবাইল নম্বর" />
              <textarea name="address" required className="w-full p-4 bg-gray-50 border rounded-2xl font-bold" placeholder="ঠিকানা" rows={3}></textarea>
              <div className="pt-6 border-t">
                <div className="flex justify-between items-center mb-6">
                  <span className="text-gray-500 font-bold">মোট দেয়:</span>
                  <span className="text-3xl font-black text-emerald-800">৳ {cartTotal}</span>
                </div>
                <button className="w-full bg-emerald-600 text-white py-5 rounded-2xl font-black text-xl shadow-xl hover:bg-emerald-700 transition-all">
                  অর্ডার সম্পন্ন করুন
                </button>
              </div>
            </form>
          </div>
        )}

        {view === 'ORDER_SUCCESS' && (
          <div className="max-w-2xl mx-auto py-32 px-4 text-center animate-fade-in">
            <div className="w-32 h-32 bg-emerald-100 text-emerald-600 rounded-[2.5rem] flex items-center justify-center mx-auto mb-10 shadow-2xl">
              <CheckCircle size={72} strokeWidth={2.5} />
            </div>
            <h2 className="text-5xl font-black text-emerald-900 mb-6 tracking-tight">অর্ডার সফল হয়েছে!</h2>
            <p className="text-gray-500 text-xl mb-12 font-medium">আমরা খুব শীঘ্রই ডেলিভারির জন্য আপনার সাথে যোগাযোগ করব।</p>
            <button onClick={() => setView('STORE')} className="bg-emerald-600 text-white px-12 py-5 rounded-2xl font-black text-xl shadow-xl hover:bg-emerald-700 transition-all shadow-emerald-200">আরো বাজার করুন</button>
          </div>
        )}

        {view === 'ADMIN' && (
          <AdminPanel 
            products={products} setProducts={setProducts} 
            slides={slides} setSlides={setSlides}
            orders={orders} setOrders={setOrders}
            needsSetup={dbError === 'DATABASE_TABLES_MISSING'}
          />
        )}

        {view === 'ABOUT' && (
          <div className="max-w-4xl mx-auto py-20 px-6 animate-fade-in text-center">
            <h2 className="text-5xl font-black text-emerald-900 mb-10">আমাদের সম্পর্কে</h2>
            <p className="text-xl text-gray-600 leading-relaxed max-w-2xl mx-auto font-medium">বদলগাছীর সাধারণ মানুষের নিত্যদিনের বাজারকে সহজ ও আধুনিক করতে আমাদের পথচলা। আমরা সরাসরি খামারিদের থেকে তাজা পণ্য আপনার কাছে পৌঁছে দিই। আপনার সুস্বাস্থ্যই আমাদের সার্থকতা।</p>
          </div>
        )}

        {view === 'SETUP_REQUIRED' && (
          <div className="min-h-screen bg-emerald-50 flex items-center justify-center p-6">
            <div className="max-w-2xl w-full bg-white rounded-[3rem] shadow-2xl p-12 text-center">
              <AlertTriangle size={48} className="text-amber-500 mx-auto mb-8" />
              <h2 className="text-4xl font-black text-emerald-900 mb-4">সেটআপ প্রয়োজন</h2>
              <p className="text-gray-500 mb-10 font-medium">প্রথমে আপনার ডাটাবেস টেবিলগুলো তৈরি করে ডেমো ডাটা যুক্ত করুন।</p>
              <button onClick={() => setView('ADMIN')} className="bg-emerald-600 text-white px-10 py-4 rounded-2xl font-black text-xl shadow-lg shadow-emerald-100">অ্যাডমিন প্যানেলে যান</button>
            </div>
          </div>
        )}
      </main>

      {/* Product Detail Modal */}
      {selectedProduct && (
        <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-4xl rounded-[3rem] shadow-2xl overflow-hidden animate-fade-in flex flex-col md:flex-row max-h-[90vh] overflow-y-auto">
            <div className="w-full md:w-1/2 aspect-square relative">
              <img src={selectedProduct.image} alt={selectedProduct.name} className="w-full h-full object-cover" />
              <button onClick={() => setSelectedProduct(null)} className="absolute top-6 left-6 bg-white/80 p-2 rounded-full md:hidden shadow-lg"><X/></button>
            </div>
            <div className="w-full md:w-1/2 p-10 flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-start mb-4">
                  <span className="bg-emerald-100 text-emerald-700 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest">{selectedProduct.category}</span>
                  <button onClick={() => setSelectedProduct(null)} className="hidden md:block p-2 hover:bg-gray-100 rounded-full transition-all"><X/></button>
                </div>
                <h3 className="text-3xl font-black text-gray-900 mb-2">{selectedProduct.name}</h3>
                <p className="text-gray-500 font-medium mb-6 leading-relaxed text-lg">{selectedProduct.description}</p>
                <div className="flex items-end gap-2 mb-10">
                  <span className="text-4xl font-black text-emerald-800">৳ {selectedProduct.price}</span>
                  <span className="text-gray-400 font-bold mb-1">প্রতি {selectedProduct.unit}</span>
                </div>
              </div>
              <button 
                onClick={() => { addToCart(selectedProduct); setSelectedProduct(null); setIsCartOpen(true); }}
                className="w-full bg-emerald-600 text-white py-5 rounded-2xl font-black text-xl shadow-xl shadow-emerald-200 hover:bg-emerald-700 active:scale-95 transition-all flex items-center justify-center gap-3"
              >
                <ShoppingCart /> ব্যাগে যোগ করুন
              </button>
            </div>
          </div>
        </div>
      )}

      <footer className="bg-gray-950 text-white py-20 mt-auto">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h1 className="text-3xl font-black mb-4 tracking-tight">সামসুল'স গ্রোসরি</h1>
          <p className="text-gray-400 mb-8 font-medium">বদলগাছী বাজার, বদলগাছী, নওগাঁ, বাংলাদেশ</p>
          <div className="flex justify-center gap-6 mb-12">
            <a href="tel:01700000000" className="flex items-center gap-2 text-emerald-400 font-bold hover:scale-105 transition-transform"><Phone size={20}/> ০১৭০০-০০০০০০</a>
          </div>
          <p className="text-[10px] text-gray-600 uppercase tracking-[0.4em] font-bold">© ২০২৪ সকল স্বত্ব সংরক্ষিত</p>
        </div>
      </footer>

      <CartSidebar 
        isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} 
        cart={cart} updateQuantity={updateQuantity} 
        removeFromCart={removeFromCart} onCheckout={() => { setIsCartOpen(false); setView('CHECKOUT'); }} 
      />
    </div>
  );
};

export default App;
