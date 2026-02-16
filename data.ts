
import { Category, Product } from './types';

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: '1',
    name: 'মিনিকেট চাল (১ কেজি)',
    price: 68,
    unit: 'কেজি',
    category: Category.RICE,
    image: 'https://picsum.photos/seed/rice/400/300',
    description: 'উন্নত মানের পরিষ্কার মিনিকেট চাল।',
    stock: 100
  },
  {
    id: '2',
    name: 'রূপচাঁদা সয়াবিন তেল (২ লিটার)',
    price: 380,
    unit: 'বোতল',
    category: Category.OIL,
    image: 'https://picsum.photos/seed/oil/400/300',
    description: 'ভিটামিন এ সমৃদ্ধ খাঁটি সয়াবিন তেল।',
    stock: 50
  },
  {
    id: '3',
    name: 'দেশি লাল আলু',
    price: 55,
    unit: 'কেজি',
    category: Category.VEGETABLES,
    image: 'https://picsum.photos/seed/potato/400/300',
    description: 'ক্ষেত থেকে তোলা টাটকা লাল আলু।',
    stock: 200
  },
  {
    id: '4',
    name: 'সবরি কলা (১ ডজন)',
    price: 120,
    unit: 'ডজন',
    category: Category.FRUITS,
    image: 'https://picsum.photos/seed/banana/400/300',
    description: 'মিষ্টি ও সুস্বাদু সবরি কলা।',
    stock: 30
  },
  {
    id: '5',
    name: 'প্রাণ চানাচুর (১৫০ গ্রাম)',
    price: 45,
    unit: 'প্যাকেট',
    category: Category.SNACKS,
    image: 'https://picsum.photos/seed/snacks/400/300',
    description: 'মচমচে এবং ঝাল চানাচুর।',
    stock: 100
  },
  {
    id: '6',
    name: 'কোকা-কোলা (৫০০ মিলি)',
    price: 40,
    unit: 'বোতল',
    category: Category.BEVERAGES,
    image: 'https://picsum.photos/seed/cola/400/300',
    description: 'ঠান্ডা রিফ্রেশিং পানীয়।',
    stock: 80
  }
];
