export interface Book {
  id: number;
  title: string;
  author: string;
  description: string;
  price: string;
  condition: string;
  category: string;
  imageUrl?: string;
  sellerId: number;
  isAvailable: boolean;
  createdAt: Date;
}

export interface CartItem {
  id: number;
  buyerId: number;
  bookId: number;
  addedAt: Date;
  book?: Book;
}

export interface Order {
  id: number;
  buyerId: number;
  total: string;
  status: string;
  createdAt: Date;
  items?: OrderItem[];
}

export interface OrderItem {
  id: number;
  orderId: number;
  bookId: number;
  price: string;
  book?: Book;
}

export interface Message {
  id: number;
  senderId: number;
  receiverId: number;
  bookId?: number;
  content: string;
  createdAt: Date;
}

export const BOOK_CONDITIONS = [
  { value: 'like_new', label: 'Like New' },
  { value: 'very_good', label: 'Very Good' },
  { value: 'good', label: 'Good' },
  { value: 'acceptable', label: 'Acceptable' },
];

export const BOOK_CATEGORIES = [
  { value: 'fiction', label: 'Fiction' },
  { value: 'non_fiction', label: 'Non-Fiction' },
  { value: 'academic', label: 'Academic' },
  { value: 'children', label: 'Children\'s Books' },
  { value: 'history', label: 'History' },
  { value: 'science', label: 'Science' },
  { value: 'self_help', label: 'Self-Help' },
  { value: 'biography', label: 'Biography' },
  { value: 'mystery', label: 'Mystery' },
  { value: 'romance', label: 'Romance' },
];
