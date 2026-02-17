
import { Category, Product, Slide } from './types';

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: '1',
    name: 'মিনিকেট চাল (১ কেজি)',
    price: 68,
    unit: 'কেজি',
    category: Category.RICE,
    image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&q=80&w=400',
    description: 'উন্নত মানের পরিষ্কার ও ঝকঝকে মিনিকেট চাল।',
    stock: 100
  },
  {
    id: '2',
    name: 'রূপচাঁদা সয়াবিন তেল (২ লিটার)',
    price: 380,
    unit: 'বোতল',
    category: Category.OIL,
    image: 'https://images.unsplash.com/photo-1620706859477-e4abc8a7b2a7?auto=format&fit=crop&q=80&w=400',
    description: 'ভিটামিন এ সমৃদ্ধ খাঁটি সয়াবিন তেল।',
    stock: 50
  },
  {
    id: '3',
    name: 'দেশি লাল আলু',
    price: 55,
    unit: 'কেজি',
    category: Category.VEGETABLES,
    image: 'https://images.unsplash.com/photo-1508313880080-c4bef0730395?auto=format&fit=crop&q=80&w=400',
    description: 'ক্ষেত থেকে তোলা একদম তাজা ও পুষ্টিকর লাল আলু।',
    stock: 200
  },
  {
    id: '4',
    name: 'সবরি কলা (১ ডজন)',
    price: 120,
    unit: 'ডজন',
    category: Category.FRUITS,
    image: 'https://images.unsplash.com/photo-1528825871115-3581a5387919?auto=format&fit=crop&q=80&w=400',
    description: 'মিষ্টি ও সুস্বাদু সবরি কলা।',
    stock: 30
  },
  {
    id: '5',
    name: 'প্রাণ চানাচুর (১৫০ গ্রাম)',
    price: 45,
    unit: 'প্যাকেট',
    category: Category.SNACKS,
    image: 'https://images.unsplash.com/photo-1601050690597-df056fb46b45?auto=format&fit=crop&q=80&w=400',
    description: 'মচমচে এবং ঝাল চানাচুর।',
    stock: 100
  },
  {
    id: '6',
    name: 'কোকা-কোলা (৫০০ মিলি)',
    price: 40,
    unit: 'বোতল',
    category: Category.BEVERAGES,
    image: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?auto=format&fit=crop&q=80&w=400',
    description: 'ঠান্ডা রিফ্রেশিং পানীয়।',
    stock: 80
  }
];

export const INITIAL_SLIDES: Slide[] = [
  {
    id: 's1',
    image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=1200',
    title: 'টাটকা ও সতেজ বাজার একদম ঘরের দরজায়!',
    subtitle: 'বদলগাছীর সবচেয়ে বিশ্বস্ত অনলাইন গ্রোসরি শপ। ১ ঘণ্টার মধ্যে ডেলিভারি নিশ্চিত।',
    buttonText: 'বাজার শুরু করুন'
  },
  {
    id: 's2',
    image: 'https://images.unsplash.com/photo-1543083477-4f77cdaae6d2?auto=format&fit=crop&q=80&w=1200',
    title: 'সাপ্তাহিক ধামাকা অফার!',
    subtitle: 'চাল, ডাল এবং তেলের ওপর পান বিশেষ মূল্যছাড়। অফার সীমিত সময়ের জন্য।',
    buttonText: 'অফার দেখুন'
  },
  {
    id: 's3',
    image: 'https://images.unsplash.com/photo-1488459716781-31db52582fe9?auto=format&fit=crop&q=80&w=1200',
    title: 'সুস্থ থাকুন, নিরাপদ পণ্য কিনুন',
    subtitle: 'আমরা দিচ্ছি ১০০% ভেজালমুক্ত পণ্যের নিশ্চয়তা। আপনার পরিবারের স্বাস্থ্য আমাদের অগ্রাধিকার।',
    buttonText: 'আমাদের সম্পর্কে'
  }
];
