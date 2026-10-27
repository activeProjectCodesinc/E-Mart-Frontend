import storeBannerImg from '@/assets/images/storeBanner.jpg';
import storeLogoImg from '@/assets/images/storeLogo.jpg';

export const INITIAL_STORE_INFO = {
  id: '',
  name: '',
  status: 'active',
  isOpen: true,
  category: 'Supermarket',
  categoryId: '',
  description: '',
  deliveryTime: '30-45 mins',
  deliveryFee: '150',
  addressLine: '',
  city: 'Lahore',
  cityId: '',
  area: 'Gulberg',
  areaId: '',
  latitude: '31.5204',
  longitude: '74.3587',
  bannerUrl: null,
  logoUrl: null,
  banner: storeBannerImg,
  logo: storeLogoImg,
};

export const STORE_CATEGORIES = [
  'Supermarket',
  'Grocery & Food',
  'Fruits & Vegetables',
  'Dairy & Eggs',
  'Bakery & Pastries',
  'Beverages & Drinks',
  'Meat & Seafood',
  'Household & Cleaning',
  'Organic & Specialty',
];

