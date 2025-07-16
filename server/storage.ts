import { 
  users, books, orders, orderItems, messages, cartItems,
  type User, type InsertUser, type Book, type InsertBook, 
  type Order, type InsertOrder, type OrderItem, type InsertOrderItem,
  type Message, type InsertMessage, type CartItem, type InsertCartItem
} from "@shared/schema";

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Book operations
  getBooks(filters?: { category?: string; condition?: string; search?: string }): Promise<Book[]>;
  getBook(id: number): Promise<Book | undefined>;
  getBooksBySeller(sellerId: number): Promise<Book[]>;
  createBook(book: InsertBook, sellerId: number): Promise<Book>;
  updateBook(id: number, book: Partial<InsertBook>): Promise<Book | undefined>;
  deleteBook(id: number): Promise<boolean>;
  
  // Order operations
  getOrdersByBuyer(buyerId: number): Promise<Order[]>;
  createOrder(order: InsertOrder): Promise<Order>;
  getOrderItems(orderId: number): Promise<OrderItem[]>;
  createOrderItem(orderItem: InsertOrderItem): Promise<OrderItem>;
  
  // Message operations
  getMessagesBetweenUsers(user1Id: number, user2Id: number): Promise<Message[]>;
  createMessage(message: InsertMessage): Promise<Message>;
  
  // Cart operations
  getCartItems(buyerId: number): Promise<CartItem[]>;
  addToCart(cartItem: InsertCartItem): Promise<CartItem>;
  removeFromCart(buyerId: number, bookId: number): Promise<boolean>;
  clearCart(buyerId: number): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User> = new Map();
  private books: Map<number, Book> = new Map();
  private orders: Map<number, Order> = new Map();
  private orderItems: Map<number, OrderItem> = new Map();
  private messages: Map<number, Message> = new Map();
  private cartItems: Map<number, CartItem> = new Map();
  
  private currentUserId = 1;
  private currentBookId = 1;
  private currentOrderId = 1;
  private currentOrderItemId = 1;
  private currentMessageId = 1;
  private currentCartItemId = 1;

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.email === email);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = {
      ...insertUser,
      id,
      createdAt: new Date(),
    };
    this.users.set(id, user);
    return user;
  }

  async getBooks(filters?: { category?: string; condition?: string; search?: string }): Promise<Book[]> {
    let books = Array.from(this.books.values()).filter(book => book.isAvailable);
    
    if (filters?.category) {
      books = books.filter(book => book.category === filters.category);
    }
    
    if (filters?.condition) {
      books = books.filter(book => book.condition === filters.condition);
    }
    
    if (filters?.search) {
      const searchTerm = filters.search.toLowerCase();
      books = books.filter(book => 
        book.title.toLowerCase().includes(searchTerm) ||
        book.author.toLowerCase().includes(searchTerm) ||
        book.description.toLowerCase().includes(searchTerm)
      );
    }
    
    return books;
  }

  async getBook(id: number): Promise<Book | undefined> {
    return this.books.get(id);
  }

  async getBooksBySeller(sellerId: number): Promise<Book[]> {
    return Array.from(this.books.values()).filter(book => book.sellerId === sellerId);
  }

  async createBook(insertBook: InsertBook, sellerId: number): Promise<Book> {
    const id = this.currentBookId++;
    const book: Book = {
      ...insertBook,
      id,
      sellerId,
      isAvailable: true,
      createdAt: new Date(),
    };
    this.books.set(id, book);
    return book;
  }

  async updateBook(id: number, updateData: Partial<InsertBook>): Promise<Book | undefined> {
    const book = this.books.get(id);
    if (!book) return undefined;
    
    const updatedBook = { ...book, ...updateData };
    this.books.set(id, updatedBook);
    return updatedBook;
  }

  async deleteBook(id: number): Promise<boolean> {
    return this.books.delete(id);
  }

  async getOrdersByBuyer(buyerId: number): Promise<Order[]> {
    return Array.from(this.orders.values()).filter(order => order.buyerId === buyerId);
  }

  async createOrder(insertOrder: InsertOrder): Promise<Order> {
    const id = this.currentOrderId++;
    const order: Order = {
      ...insertOrder,
      id,
      createdAt: new Date(),
    };
    this.orders.set(id, order);
    return order;
  }

  async getOrderItems(orderId: number): Promise<OrderItem[]> {
    return Array.from(this.orderItems.values()).filter(item => item.orderId === orderId);
  }

  async createOrderItem(insertOrderItem: InsertOrderItem): Promise<OrderItem> {
    const id = this.currentOrderItemId++;
    const orderItem: OrderItem = {
      ...insertOrderItem,
      id,
    };
    this.orderItems.set(id, orderItem);
    return orderItem;
  }

  async getMessagesBetweenUsers(user1Id: number, user2Id: number): Promise<Message[]> {
    return Array.from(this.messages.values())
      .filter(message => 
        (message.senderId === user1Id && message.receiverId === user2Id) ||
        (message.senderId === user2Id && message.receiverId === user1Id)
      )
      .sort((a, b) => a.createdAt!.getTime() - b.createdAt!.getTime());
  }

  async createMessage(insertMessage: InsertMessage): Promise<Message> {
    const id = this.currentMessageId++;
    const message: Message = {
      ...insertMessage,
      id,
      createdAt: new Date(),
    };
    this.messages.set(id, message);
    return message;
  }

  async getCartItems(buyerId: number): Promise<CartItem[]> {
    return Array.from(this.cartItems.values()).filter(item => item.buyerId === buyerId);
  }

  async addToCart(insertCartItem: InsertCartItem): Promise<CartItem> {
    const id = this.currentCartItemId++;
    const cartItem: CartItem = {
      ...insertCartItem,
      id,
      addedAt: new Date(),
    };
    this.cartItems.set(id, cartItem);
    return cartItem;
  }

  async removeFromCart(buyerId: number, bookId: number): Promise<boolean> {
    const item = Array.from(this.cartItems.values())
      .find(item => item.buyerId === buyerId && item.bookId === bookId);
    
    if (item) {
      return this.cartItems.delete(item.id);
    }
    return false;
  }

  async clearCart(buyerId: number): Promise<boolean> {
    const items = Array.from(this.cartItems.values())
      .filter(item => item.buyerId === buyerId);
    
    items.forEach(item => this.cartItems.delete(item.id));
    return true;
  }
}

export const storage = new MemStorage();
