
export enum Category {
  RICE = 'চাল',
  OIL = 'তেল',
  VEGETABLES = 'শাক-সবজি',
  FRUITS = 'ফল',
  SNACKS = 'নাস্তা',
  BEVERAGES = 'পানীয়',
  HOUSEHOLD = 'গৃহস্থালি',
  ALL = 'সব পণ্য'
}

export interface Product {
  id: string;
  name: string;
  price: number;
  unit: string;
  category: Category;
  image: string;
  description: string;
  stock: number;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface Order {
  id: string;
  customerName: string;
  phone: string;
  address: string;
  items: CartItem[];
  total: number;
  status: 'Pending' | 'Delivered' | 'Cancelled';
  date: string;
}

export type ViewType = 'STORE' | 'ADMIN' | 'CHECKOUT' | 'ABOUT';
