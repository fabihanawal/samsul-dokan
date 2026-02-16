
import React from 'react';
import { Plus, ShoppingBag } from 'lucide-react';
import { Product } from '../types';

interface ProductCardProps {
  product: Product;
  onAddToCart: (p: Product) => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, onAddToCart }) => {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition duration-300 flex flex-col group">
      <div className="relative aspect-square overflow-hidden bg-gray-50">
        <img 
          src={product.image} 
          alt={product.name} 
          className="w-full h-full object-cover transform group-hover:scale-110 transition duration-500"
        />
        {product.stock < 10 && (
          <div className="absolute top-2 left-2 bg-red-100 text-red-600 text-[10px] font-bold px-2 py-1 rounded">
            স্টক কম
          </div>
        )}
      </div>
      <div className="p-4 flex flex-col flex-grow">
        <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider mb-1">
          {product.category}
        </span>
        <h4 className="font-bold text-gray-800 text-sm md:text-base mb-1 line-clamp-1 group-hover:text-emerald-700 transition">
          {product.name}
        </h4>
        <p className="text-gray-500 text-xs mb-3 line-clamp-1">{product.description}</p>
        
        <div className="mt-auto flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-lg font-extrabold text-emerald-800 leading-none">
              ৳ {product.price}
            </span>
            <span className="text-[10px] text-gray-400">প্রতি {product.unit}</span>
          </div>
          <button 
            onClick={() => onAddToCart(product)}
            className="bg-emerald-600 text-white p-2 rounded-xl hover:bg-emerald-700 active:scale-95 transition shadow-sm shadow-emerald-200"
          >
            <Plus size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
