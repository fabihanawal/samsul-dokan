
import React from 'react';
import { X, Trash2, Plus, Minus, ShoppingCart, ArrowRight } from 'lucide-react';
import { CartItem } from '../types';

interface CartSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  cart: CartItem[];
  updateQuantity: (id: string, delta: number) => void;
  removeFromCart: (id: string) => void;
  onCheckout: () => void;
}

const CartSidebar: React.FC<CartSidebarProps> = ({ 
  isOpen, onClose, cart, updateQuantity, removeFromCart, onCheckout 
}) => {
  const total = cart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity" onClick={onClose} />
      
      <div className="absolute right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl flex flex-col animate-fade-in translate-x-0 transition-transform">
        <div className="p-6 border-b flex justify-between items-center bg-emerald-50">
          <div className="flex items-center gap-3">
            <ShoppingCart className="text-emerald-700" size={24} />
            <h2 className="text-xl font-bold text-emerald-900">আপনার ব্যাগ ({cart.length})</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white rounded-full transition text-emerald-800">
            <X size={24} />
          </button>
        </div>

        <div className="flex-grow overflow-y-auto p-4 space-y-4 no-scrollbar">
          {cart.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-400">
              <ShoppingCart size={80} strokeWidth={1} />
              <p className="mt-4 text-lg font-medium">আপনার ব্যাগ এখন খালি!</p>
              <button onClick={onClose} className="mt-4 text-emerald-600 font-bold underline">বাজার করতে যান</button>
            </div>
          ) : (
            cart.map(item => (
              <div key={item.product.id} className="flex gap-4 p-3 bg-white rounded-xl border border-gray-100 shadow-sm hover:border-emerald-100 transition">
                <img src={item.product.image} alt={item.product.name} className="w-20 h-20 object-cover rounded-lg bg-gray-50" />
                <div className="flex-grow">
                  <h4 className="font-bold text-gray-800 leading-tight">{item.product.name}</h4>
                  <p className="text-xs text-gray-400 mt-1">প্রতি {item.product.unit} ৳ {item.product.price}</p>
                  
                  <div className="flex items-center justify-between mt-3">
                    <div className="flex items-center gap-2 bg-gray-50 px-2 py-1 rounded-lg border">
                      <button onClick={() => updateQuantity(item.product.id, -1)} className="p-1 hover:bg-emerald-100 rounded transition"><Minus size={14} /></button>
                      <span className="w-6 text-center font-bold text-emerald-800">{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.product.id, 1)} className="p-1 hover:bg-emerald-100 rounded transition"><Plus size={14} /></button>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="font-bold text-emerald-700">৳ {item.product.price * item.quantity}</span>
                      <button onClick={() => removeFromCart(item.product.id)} className="text-red-400 hover:text-red-600 transition">
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {cart.length > 0 && (
          <div className="p-6 border-t bg-gray-50 shadow-inner">
            <div className="flex justify-between items-center mb-4">
              <span className="text-gray-500 font-medium">মোট বিল:</span>
              <span className="text-2xl font-black text-emerald-800">৳ {total}</span>
            </div>
            <button 
              onClick={onCheckout}
              className="w-full bg-emerald-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-emerald-700 transition flex items-center justify-center gap-3 shadow-lg shadow-emerald-200"
            >
              চেকআউট করুন <ArrowRight size={20} />
            </button>
            <p className="text-center text-[10px] text-gray-400 mt-4">
              * ক্যাশ অন ডেলিভারি (পণ্য হাতে পেয়ে পেমেন্ট করবেন)
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CartSidebar;
