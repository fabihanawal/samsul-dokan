
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { ShoppingCart, User, Store, Info, Phone, Search, Menu, X, Trash2, Plus, Minus, ArrowRight, Settings, ChevronLeft, ChevronRight } from 'lucide-react';
import { ViewType, Category, Product, CartItem, Order, Slide } from './types';
import { INITIAL_PRODUCTS, INITIAL_SLIDES } from './data';
import AdminPanel from './components/AdminPanel';
import CartSidebar from './components/CartSidebar';
import ProductCard from './components/ProductCard';

const App: React.FC = () => {
  const [view, setView] = useState<ViewType>('STORE');
  const [products, setProducts] = useState<Product[]>(() => {
    const saved = localStorage.getItem('samsul_products');
    return saved ? JSON.parse(saved) : INITIAL_PRODUCTS;
  });
  const [slides, setSlides] = useState<Slide[]>(() => {
    const saved = localStorage.getItem('samsul_slides');
    return saved ? JSON.parse(saved) : INITIAL_SLIDES;
  });
  const [cart, setCart] = useState<CartItem[]>([]);
  const [activeCategory, setActiveCategory] = useState<Category>(Category.ALL);
  const [searchQuery, setSearchQuery] = useState('');
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [orders, setOrders] = useState<Order[]>(() => {
    const saved = localStorage.getItem('samsul_orders');
    return saved ? JSON.parse(saved) : [];
  });
  
  const [currentSlide, setCurrentSlide] = useState(0);

  // Auto-play slider
  useEffect(() => {
    if (view === 'STORE' && slides.length > 0) {
      const timer = setInterval(() => {
        setCurrentSlide(prev => (prev + 1) % slides.length);
      }, 5000);
      return () => clearInterval(timer);
    }
  }, [view, slides.length]);

  // Sync state to local storage
  useEffect(() => {
    localStorage.setItem('samsul_products', JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem('samsul_slides', JSON.stringify(slides));
  }, [slides]);

  useEffect(() => {
    localStorage.setItem('samsul_orders', JSON.stringify(orders));
  }, [orders]);

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
    setIsCartOpen(true);
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
      const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                           p.description.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [products, activeCategory, searchQuery]);

  const placeOrder = (customerData: { name: string, phone: string, address: string }) => {
    const newOrder: Order = {
      id: Math.random().toString(36).substr(2, 9),
      customerName: customerData.name,
      phone: customerData.phone,
      address: customerData.address,
      items: [...cart],
      total: cartTotal,
      status: 'Pending',
      date: new Date().toLocaleDateString('bn-BD')
    };
    setOrders(prev => [newOrder, ...prev]);
    setCart([]);
    setView('STORE');
    alert('আপনার অর্ডারটি সফলভাবে সম্পন্ন হয়েছে! আমরা শীঘ্রই আপনার সাথে যোগাযোগ করব।');
  };

  const NavItem: React.FC<{ label: string; viewTarget: ViewType; icon?: React.ReactNode }> = ({ label, viewTarget, icon }) => (
    <button 
      onClick={() => {
        setView(viewTarget);
        setIsMobileMenuOpen(false);
      }}
      className={`flex items-center gap-2 px-3 py-2 rounded-lg font-medium transition-all duration-200 ${
        view === viewTarget 
          ? 'text-emerald-700 bg-emerald-50' 
          : 'text-gray-600 hover:text-emerald-600 hover:bg-gray-50'
      }`}
    >
      {icon}
      <span>{label}</span>
    </button>
  );

  const nextSlide = () => setCurrentSlide(prev => (prev + 1) % slides.length);
  const prevSlide = () => setCurrentSlide(prev => (prev - 1 + slides.length) % slides.length);

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            {/* Logo */}
            <div className="flex items-center gap-4 cursor-pointer shrink-0" onClick={() => setView('STORE')}>
              <div className="bg-emerald-600 p-2 rounded-lg text-white shadow-md">
                <Store size={28} />
              </div>
              <div className="hidden sm:block">
                <h1 className="text-xl md:text-2xl font-bold text-emerald-800 leading-none">সামসুল'স গ্রোসরি</h1>
                <p className="text-[10px] md:text-xs text-gray-500 font-medium mt-1">বদলগাছী, নওগাঁ</p>
              </div>
            </div>

            {/* STUNNING ENHANCED WELCOME TEXT */}
            <div className="hidden lg:flex flex-1 justify-center items-center px-4 overflow-hidden">
              <div className="text-center animate-welcome cursor-default select-none">
                <p className="text-lg md:text-xl lg:text-2xl font-black italic uppercase tracking-[0.2em] bg-gradient-to-r from-emerald-600 via-green-500 to-teal-500 bg-clip-text text-transparent">
                  WELCOME TO SAMSUL'S GROCERY
                </p>
                <div className="flex items-center justify-center gap-4 mt-0.5">
                   <div className="h-[1px] w-12 bg-gradient-to-r from-transparent to-emerald-400"></div>
                   <span className="text-[10px] font-bold text-emerald-600/60 tracking-[0.3em] uppercase">Premium Local Service</span>
                   <div className="h-[1px] w-12 bg-gradient-to-l from-transparent to-emerald-400"></div>
                </div>
              </div>
            </div>

            {/* Desktop Navigation Links */}
            <nav className="hidden xl:flex items-center gap-1 mx-2">
              <NavItem label="হোম" viewTarget="STORE" icon={<Store size={18} />} />
              <NavItem label="অ্যাডমিন" viewTarget="ADMIN" icon={<Settings size={18} />} />
            </nav>

            {/* Desktop Search Bar */}
            <div className="hidden md:flex items-center max-w-[150px] lg:max-w-[200px] ml-auto mr-4">
              <div className="relative w-full">
                <input
                  type="text"
                  placeholder="খুঁজুন..."
                  className="w-full pl-9 pr-3 py-1.5 rounded-full border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition text-xs"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <Search className="absolute left-3 top-2 text-gray-400" size={14} />
              </div>
            </div>

            {/* Actions (Cart & Mobile Menu) */}
            <div className="flex items-center gap-2 sm:gap-4 shrink-0">
              <button 
                onClick={() => setIsCartOpen(true)}
                className="relative p-2.5 text-gray-700 hover:bg-emerald-50 hover:text-emerald-600 rounded-full transition-all duration-200"
                aria-label="Shopping Cart"
              >
                <ShoppingCart size={24} />
                {cart.length > 0 && (
                  <span className="absolute top-1 right-1 bg-red-500 text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full border-2 border-white animate-pulse">
                    {cart.length}
                  </span>
                )}
              </button>

              <button 
                className="md:hidden p-2.5 text-gray-700 hover:bg-gray-100 rounded-full transition"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                aria-label="Menu"
              >
                {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white border-b absolute top-20 left-0 w-full z-30 animate-fade-in shadow-xl">
          <div className="px-4 py-6 space-y-6 text-center">
            <p className="text-emerald-700 font-black italic uppercase text-xs tracking-widest">Welcome to Samsul's Grocery</p>
            <div className="relative">
              <input
                type="text"
                placeholder="পণ্য খুঁজুন..."
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-emerald-500"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Search className="absolute left-4 top-3.5 text-gray-400" size={18} />
            </div>
            <nav className="flex flex-col gap-2">
              <NavItem label="হোম পেজ" viewTarget="STORE" icon={<Store size={20} />} />
              <NavItem label="আমাদের সম্পর্কে" viewTarget="ABOUT" icon={<Info size={20} />} />
              <NavItem label="অ্যাডমিন ড্যাশবোর্ড" viewTarget="ADMIN" icon={<Settings size={20} />} />
            </nav>
            <div className="pt-4 border-t flex flex-col gap-4">
               <a href="https://wa.me/8801700000000" target="_blank" rel="noreferrer" className="w-full bg-green-500 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2">
                 <Phone size={18} /> হোয়াটস্যাপে অর্ডার দিন
               </a>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-grow">
        {view === 'STORE' && (
          <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8 animate-fade-in">
            {/* Dynamic Slider Section */}
            {slides.length > 0 && (
              <div className="relative rounded-3xl overflow-hidden mb-10 h-56 sm:h-72 md:h-96 shadow-xl group bg-emerald-900">
                {slides.map((slide, index) => (
                  <div 
                    key={slide.id} 
                    className={`absolute inset-0 transition-all duration-1000 ease-in-out ${index === currentSlide ? 'opacity-100 scale-100' : 'opacity-0 scale-110 pointer-events-none'}`}
                  >
                    <img 
                      src={slide.image} 
                      alt={slide.title} 
                      className="w-full h-full object-cover opacity-60"
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-emerald-900/90 via-emerald-900/40 to-transparent flex flex-col justify-center px-8 sm:px-16">
                      <span className="bg-emerald-500 text-white text-[10px] md:text-xs font-black px-3 py-1 rounded-full w-fit mb-4 tracking-widest uppercase animate-fade-in">বদলগাছী স্পেশাল</span>
                      <h2 className="text-xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-white mb-4 leading-tight max-w-2xl drop-shadow-lg">
                        {slide.title}
                      </h2>
                      <p className="text-emerald-100 text-xs sm:text-lg md:text-xl font-medium max-w-lg mb-8 opacity-90 drop-shadow-md">
                        {slide.subtitle}
                      </p>
                      <div className="flex flex-wrap gap-4">
                        <button 
                          onClick={() => {
                            if (slide.buttonText === 'আমাদের সম্পর্কে') setView('ABOUT');
                            else document.getElementById('products')?.scrollIntoView({ behavior: 'smooth' });
                          }} 
                          className="bg-white text-emerald-900 px-6 py-2.5 md:px-8 md:py-3.5 rounded-full font-black hover:bg-emerald-50 transition transform hover:-translate-y-1 shadow-xl text-sm md:text-base"
                        >
                          {slide.buttonText}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}

                {/* Slider Controls */}
                <button onClick={prevSlide} className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/40 text-white p-2 rounded-full backdrop-blur-md opacity-0 group-hover:opacity-100 transition duration-300">
                  <ChevronLeft size={24} />
                </button>
                <button onClick={nextSlide} className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/40 text-white p-2 rounded-full backdrop-blur-md opacity-0 group-hover:opacity-100 transition duration-300">
                  <ChevronRight size={24} />
                </button>

                {/* Dots */}
                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
                  {slides.map((_, idx) => (
                    <button 
                      key={idx} 
                      onClick={() => setCurrentSlide(idx)}
                      className={`h-2 rounded-full transition-all duration-300 ${idx === currentSlide ? 'w-8 bg-emerald-500' : 'w-2 bg-white/50'}`}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Categories */}
            <div className="mb-10">
              <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                <div className="w-1.5 h-6 bg-emerald-600 rounded-full"></div>
                ক্যাটাগরি সমূহ
              </h3>
              <div className="flex gap-4 overflow-x-auto no-scrollbar pb-4 -mx-4 px-4">
                {Object.values(Category).map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className={`whitespace-nowrap px-8 py-3 rounded-2xl font-bold transition-all duration-300 shadow-sm border ${
                      activeCategory === cat 
                      ? 'bg-emerald-600 text-white border-emerald-600 scale-105 ring-4 ring-emerald-100' 
                      : 'bg-white text-gray-600 border-gray-100 hover:border-emerald-300 hover:text-emerald-600 hover:shadow-md'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Products Grid */}
            <div id="products" className="scroll-mt-24">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
                <div>
                  <h3 className="text-2xl md:text-3xl font-black text-gray-900">
                    {activeCategory === Category.ALL ? 'সকল পণ্য' : activeCategory}
                  </h3>
                  <div className="w-20 h-1 bg-emerald-500 rounded-full mt-2"></div>
                </div>
                <p className="bg-white px-4 py-1.5 rounded-full text-emerald-700 font-bold border border-emerald-100 text-sm">
                  {filteredProducts.length} টি পণ্য পাওয়া গেছে
                </p>
              </div>
              
              {filteredProducts.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-8">
                  {filteredProducts.map(product => (
                    <ProductCard key={product.id} product={product} onAddToCart={addToCart} />
                  ))}
                </div>
              ) : (
                <div className="py-24 text-center bg-white rounded-3xl border border-dashed border-gray-300">
                  <div className="text-gray-200 mb-6 flex justify-center">
                    <Search size={80} strokeWidth={1.5} />
                  </div>
                  <p className="text-2xl text-gray-500 font-bold">দুঃখিত! এই পণ্যটি খুঁজে পাওয়া যায়নি।</p>
                  <button onClick={() => {setSearchQuery(''); setActiveCategory(Category.ALL);}} className="mt-6 text-emerald-600 font-bold hover:underline">সকল পণ্য দেখুন</button>
                </div>
              )}
            </div>
          </div>
        )}

        {view === 'ADMIN' && (
          <div className="animate-fade-in">
            <AdminPanel 
              products={products} 
              setProducts={setProducts} 
              slides={slides}
              setSlides={setSlides}
              orders={orders} 
              setOrders={setOrders}
            />
          </div>
        )}

        {view === 'CHECKOUT' && (
          <div className="max-w-2xl mx-auto px-4 py-12 animate-fade-in">
            <div className="text-center mb-10">
              <h2 className="text-3xl font-black text-gray-900 mb-2">চেকআউট</h2>
              <p className="text-gray-500">আপনার তথ্য দিয়ে অর্ডারটি সম্পন্ন করুন</p>
            </div>
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              placeOrder({
                name: formData.get('name') as string,
                phone: formData.get('phone') as string,
                address: formData.get('address') as string,
              });
            }} className="space-y-6 bg-white p-8 rounded-3xl shadow-xl border border-emerald-50">
              <div className="grid grid-cols-1 gap-6">
                <div>
                  <label className="block text-sm font-black text-gray-700 mb-2">আপনার নাম *</label>
                  <input required name="name" type="text" className="w-full px-5 py-4 rounded-2xl border border-gray-200 focus:ring-4 focus:ring-emerald-100 focus:border-emerald-500 outline-none transition" placeholder="নাম লিখুন" />
                </div>
                <div>
                  <label className="block text-sm font-black text-gray-700 mb-2">মোবাইল নম্বর *</label>
                  <input required name="phone" type="tel" className="w-full px-5 py-4 rounded-2xl border border-gray-200 focus:ring-4 focus:ring-emerald-100 focus:border-emerald-500 outline-none transition" placeholder="০১৭০০-০০০০০০" />
                </div>
                <div>
                  <label className="block text-sm font-black text-gray-700 mb-2">ডেলিভারি ঠিকানা *</label>
                  <textarea required name="address" rows={3} className="w-full px-5 py-4 rounded-2xl border border-gray-200 focus:ring-4 focus:ring-emerald-100 focus:border-emerald-500 outline-none transition" placeholder="এলাকা, গ্রাম এবং বাড়ির নম্বর"></textarea>
                </div>
              </div>
              
              <div className="p-5 bg-emerald-50 rounded-2xl border border-emerald-100 flex items-start gap-4">
                <div className="bg-emerald-600 p-2 rounded-lg text-white mt-1">
                  <User size={18} />
                </div>
                <div>
                  <p className="text-emerald-900 font-black mb-1 text-base">পেমেন্ট মেথড:</p>
                  <p className="text-emerald-700 text-sm">ক্যাশ অন ডেলিভারি (পণ্য হাতে পেয়ে পেমেন্ট করবেন)</p>
                </div>
              </div>

              <div className="border-t border-dashed border-gray-200 pt-8 mt-8">
                <div className="flex justify-between items-center text-2xl font-black mb-8 px-2">
                  <span className="text-gray-800">মোট বিল:</span>
                  <span className="text-emerald-700">৳ {cartTotal}</span>
                </div>
                <button type="submit" className="w-full bg-emerald-600 text-white py-5 rounded-2xl font-black text-xl hover:bg-emerald-700 transition transform active:scale-[0.98] shadow-2xl shadow-emerald-200 flex items-center justify-center gap-3">
                  অর্ডার প্লেস করুন <ArrowRight size={24} />
                </button>
              </div>
            </form>
          </div>
        )}

        {view === 'ABOUT' && (
          <div className="max-w-4xl mx-auto px-4 py-16 animate-fade-in">
             <div className="text-center mb-12">
               <h2 className="text-4xl md:text-5xl font-black text-emerald-900 mb-4">আমাদের সম্পর্কে জানুন</h2>
               <div className="w-24 h-1.5 bg-emerald-500 rounded-full mx-auto"></div>
             </div>
             
             <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-16">
               <div className="space-y-6">
                 <h3 className="text-2xl font-black text-gray-900">বিশ্বস্ত কেনাকাটার ঠিকানা</h3>
                 <p className="text-lg text-gray-600 leading-relaxed">
                   বদলগাছীর প্রাণকেন্দ্রে চার মাথার মোড়ে অবস্থিত 'সামসুল'স গ্রোসরি' দীর্ঘ এক দশক ধরে গ্রাহকদের সেবা দিয়ে আসছে। আমরা বিশ্বাস করি গুণমান এবং বিশ্বস্ততায়।
                 </p>
                 <div className="space-y-4">
                   {[
                     "১০০% খাঁটি ও তাজা পণ্যের নিশ্চয়তা",
                     "সঠিক ওজন এবং ন্যায্য মূল্য",
                     "বদলগাছী উপজেলায় দ্রুত হোম ডেলিভারি",
                     "সহজ রিটার্ন পলিসি"
                   ].map((item, idx) => (
                     <div key={idx} className="flex items-center gap-3">
                       <div className="w-6 h-6 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center shrink-0">
                         <Plus size={14} />
                       </div>
                       <span className="font-bold text-gray-700">{item}</span>
                     </div>
                   ))}
                 </div>
               </div>
               <div className="rounded-3xl overflow-hidden shadow-2xl border-8 border-white transform rotate-2">
                 <img src="https://images.unsplash.com/photo-1488459716781-31db52582fe9?auto=format&fit=crop&q=80&w=800" alt="Fresh Produce" className="w-full h-full object-cover" />
               </div>
             </div>

             <div className="bg-emerald-900 text-white p-10 rounded-[3rem] shadow-2xl mb-16 relative overflow-hidden">
               <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-32 -mt-32"></div>
               <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
                 <div>
                   <p className="text-4xl font-black mb-2">৫০০০+</p>
                   <p className="text-emerald-300 font-bold">সন্তুষ্ট গ্রাহক</p>
                 </div>
                 <div>
                   <p className="text-4xl font-black mb-2">১০০%</p>
                   <p className="text-emerald-300 font-bold">খাঁটি পণ্য</p>
                 </div>
                 <div>
                   <p className="text-4xl font-black mb-2">১ ঘণ্টা</p>
                   <p className="text-emerald-300 font-bold">ডেলিভারি সময়</p>
                 </div>
               </div>
             </div>

             <div className="space-y-8">
               <h3 className="text-3xl font-black text-center text-gray-900 mb-8">যোগাযোগ ও অবস্থান</h3>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                 <div className="bg-white p-8 rounded-3xl shadow-lg border border-gray-100 flex flex-col items-center text-center">
                   <div className="bg-emerald-100 text-emerald-600 p-4 rounded-2xl mb-4">
                     <Phone size={32} />
                   </div>
                   <h4 className="text-xl font-black text-emerald-900 mb-2">আমাদের ফোন করুন</h4>
                   <p className="text-gray-600 font-bold text-lg">+৮৮০ ১৭০০ ০০০০০০</p>
                   <p className="text-gray-400 text-sm mt-1">সকাল ৭টা - রাত ১০টা</p>
                 </div>
                 <div className="bg-white p-8 rounded-3xl shadow-lg border border-gray-100 flex flex-col items-center text-center">
                   <div className="bg-emerald-100 text-emerald-600 p-4 rounded-2xl mb-4">
                     <Store size={32} />
                   </div>
                   <h4 className="text-xl font-black text-emerald-900 mb-2">দোকানের ঠিকানা</h4>
                   <p className="text-gray-600 font-bold text-lg">চার মাথার মোড়, বদলগাছী, নওগাঁ</p>
                   <p className="text-gray-400 text-sm mt-1">সাপ্তাহিক কোনো ছুটি নেই</p>
                 </div>
               </div>
             </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white pt-16 pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <div className="bg-emerald-600 p-2 rounded-lg text-white">
                  <Store size={24} />
                </div>
                <h4 className="text-2xl font-black text-white">সামসুল'স গ্রোসরি</h4>
              </div>
              <p className="text-gray-400 leading-relaxed font-medium">
                বদলগাছী বাসীর বিশ্বস্ত কেনাকাটার ডিজিটাল ঠিকানা। আপনার নিত্যপ্রয়োজনীয় সকল পণ্য এখন এক ক্লিক দূরে।
              </p>
            </div>
            <div>
              <h4 className="text-xl font-bold mb-6 text-emerald-400">কুইক লিঙ্ক</h4>
              <ul className="space-y-4 text-gray-400 font-bold">
                <li><button onClick={() => setView('STORE')} className="hover:text-emerald-400 transition">হোম পেজ</button></li>
                <li><button onClick={() => setView('ABOUT')} className="hover:text-emerald-400 transition">আমাদের সম্পর্কে</button></li>
                <li><button className="hover:text-emerald-400 transition">গোপনীয়তা নীতি</button></li>
                <li><button className="hover:text-emerald-400 transition">ব্যবহারের শর্তাবলী</button></li>
              </ul>
            </div>
            <div>
              <h4 className="text-xl font-bold mb-6 text-emerald-400">শীর্ষ ক্যাটাগরি</h4>
              <ul className="space-y-4 text-gray-400 font-bold">
                {Object.values(Category).slice(0, 5).map(cat => (
                  <li key={cat}><button onClick={() => {setActiveCategory(cat); setView('STORE');}} className="hover:text-emerald-400 transition">{cat}</button></li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="text-xl font-bold mb-6 text-emerald-400">সরাসরি যোগাযোগ</h4>
              <div className="space-y-4 text-gray-400 font-medium">
                <p className="flex items-start gap-3">
                   <Store className="text-emerald-500 mt-1 shrink-0" size={18} />
                   <span>চার মাথার মোড়, বদলগাছী, নওগাঁ</span>
                </p>
                <p className="flex items-center gap-3">
                   <Phone className="text-emerald-500 shrink-0" size={18} />
                   <span>+৮৮০ ১৭০০ ০০০০০০</span>
                </p>
                <div className="flex gap-4 mt-8">
                  <a href="#" className="bg-white/5 p-3 rounded-2xl hover:bg-emerald-600 hover:-translate-y-1 transition-all duration-300">
                    <User size={20} />
                  </a>
                  <a href="#" className="bg-white/5 p-3 rounded-2xl hover:bg-emerald-600 hover:-translate-y-1 transition-all duration-300">
                    <Settings size={20} />
                  </a>
                </div>
              </div>
            </div>
          </div>
          <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-gray-500 text-sm font-medium">
            <p>&copy; ২০২৪ সামসুল'স গ্রোসরি - সকল স্বত্ব সংরক্ষিত।</p>
            <p className="flex items-center gap-2">
              বদলগাছীর স্থানীয় ব্যবসা <span className="text-red-500">❤️</span>
            </p>
          </div>
        </div>
      </footer>

      {/* Cart Sidebar */}
      <CartSidebar 
        isOpen={isCartOpen} 
        onClose={() => setIsCartOpen(false)} 
        cart={cart} 
        updateQuantity={updateQuantity} 
        removeFromCart={removeFromCart} 
        onCheckout={() => { setIsCartOpen(false); setView('CHECKOUT'); }} 
      />

      {/* WhatsApp Floating Button */}
      <a 
        href="https://wa.me/8801700000000" 
        target="_blank" 
        rel="noreferrer"
        className="fixed bottom-6 right-6 bg-green-500 text-white p-5 rounded-[1.5rem] shadow-2xl hover:scale-110 active:scale-95 transition-all duration-300 z-40 group"
      >
        <Phone size={28} />
        <span className="absolute right-full mr-4 bg-white text-green-600 px-4 py-2 rounded-xl text-sm font-black shadow-xl opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap hidden md:block">
          সরাসরি সাহায্য নিন
        </span>
      </a>
    </div>
  );
};

export default App;
