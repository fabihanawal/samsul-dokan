
import React from 'react';
import { Plus, Eye, ShoppingBag } from 'lucide-react';
import { Product } from '../types';

interface ProductCardProps {
  product: Product;
  onAddToCart: (p: Product) => void;
  onQuickView: () => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, onAddToCart, onQuickView }) => {
  return (
    <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300 flex flex-col group relative">
      <div className="relative aspect-square overflow-hidden bg-gray-50">
        <img 
          src={product.image} 
          alt={product.name} 
          className="w-full h-full object-cover transform group-hover:scale-110 transition duration-700"
        />
        
        {/* Hover Overlay */}
        <div className="absolute inset-0 bg-emerald-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
           <button 
             onClick={(e) => { e.stopPropagation(); onQuickView(); }}
             className="bg-white text-emerald-900 p-3 rounded-2xl shadow-xl hover:scale-110 transition-transform active:scale-90"
             title="বিস্তারিত দেখুন"
           >
             <Eye size={20} />
           </button>
           <button 
             onClick={(e) => { e.stopPropagation(); onAddToCart(product); }}
             className="bg-emerald-600 text-white p-3 rounded-2xl shadow-xl hover:scale-110 transition-transform active:scale-90"
             title="ব্যাগে যোগ করুন"
           >
             <Plus size={20} />
           </button>
        </div>

        {product.stock < 10 && (
          <div className="absolute top-4 left-4 bg-red-500 text-white text-[10px] font-black px-2 py-1 rounded-lg shadow-sm">
            স্টক সীমিত
          </div>
        )}
      </div>

      <div className="p-5 flex flex-col flex-grow cursor-pointer" onClick={onQuickView}>
        <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-1">
          {product.category}
        </span>
        <h4 className="font-bold text-gray-800 text-sm md:text-base mb-1 line-clamp-1 group-hover:text-emerald-700 transition">
          {product.name}
        </h4>
        
        <div className="mt-auto flex items-end justify-between pt-2">
          <div className="flex flex-col">
            <span className="text-xl font-black text-emerald-800 leading-none tracking-tight">
              ৳ {product.price}
            </span>
            <span className="text-[10px] text-gray-400 font-bold mt-1 uppercase">প্রতি {product.unit}</span>
          </div>
          <button 
            onClick={(e) => { e.stopPropagation(); onAddToCart(product); }}
            className="md:hidden bg-emerald-600 text-white p-2.5 rounded-xl active:scale-90 transition-all shadow-md shadow-emerald-100"
          >
            <Plus size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
