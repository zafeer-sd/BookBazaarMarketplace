import { 
  users, books, orders, orderItems, messages, cartItems,
  type User, type InsertUser, type Book, type InsertBook, 
  type Order, type InsertOrder, type OrderItem, type InsertOrderItem,
  type Message, type InsertMessage, type CartItem, type InsertCartItem
} from "@shared/schema";
import { db } from "./db";
import { eq, and } from "drizzle-orm";

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

export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async getBooks(filters?: { category?: string; condition?: string; search?: string }): Promise<Book[]> {
    let query = db.select().from(books).where(eq(books.isAvailable, true));
    
    // For now, return all available books and filter in memory
    // In production, you'd want to add proper WHERE clauses
    const allBooks = await query;
    
    let filteredBooks = allBooks;
    
    if (filters?.category) {
      filteredBooks = filteredBooks.filter(book => book.category === filters.category);
    }
    
    if (filters?.condition) {
      filteredBooks = filteredBooks.filter(book => book.condition === filters.condition);
    }
    
    if (filters?.search) {
      const searchTerm = filters.search.toLowerCase();
      filteredBooks = filteredBooks.filter(book => 
        book.title.toLowerCase().includes(searchTerm) ||
        book.author.toLowerCase().includes(searchTerm) ||
        book.description.toLowerCase().includes(searchTerm)
      );
    }
    
    return filteredBooks;
  }

  async getBook(id: number): Promise<Book | undefined> {
    const [book] = await db.select().from(books).where(eq(books.id, id));
    return book || undefined;
  }

  async getBooksBySeller(sellerId: number): Promise<Book[]> {
    return await db.select().from(books).where(eq(books.sellerId, sellerId));
  }

  async createBook(insertBook: InsertBook, sellerId: number): Promise<Book> {
    const [book] = await db
      .insert(books)
      .values({
        ...insertBook,
        sellerId,
      })
      .returning();
    return book;
  }

  async updateBook(id: number, updateData: Partial<InsertBook>): Promise<Book | undefined> {
    const [book] = await db
      .update(books)
      .set(updateData)
      .where(eq(books.id, id))
      .returning();
    return book || undefined;
  }

  async deleteBook(id: number): Promise<boolean> {
    const result = await db.delete(books).where(eq(books.id, id));
    return (result.rowCount || 0) > 0;
  }

  async getOrdersByBuyer(buyerId: number): Promise<Order[]> {
    return await db.select().from(orders).where(eq(orders.buyerId, buyerId));
  }

  async createOrder(insertOrder: InsertOrder): Promise<Order> {
    const [order] = await db
      .insert(orders)
      .values(insertOrder)
      .returning();
    return order;
  }

  async getOrderItems(orderId: number): Promise<OrderItem[]> {
    return await db.select().from(orderItems).where(eq(orderItems.orderId, orderId));
  }

  async createOrderItem(insertOrderItem: InsertOrderItem): Promise<OrderItem> {
    const [orderItem] = await db
      .insert(orderItems)
      .values(insertOrderItem)
      .returning();
    return orderItem;
  }

  async getMessagesBetweenUsers(user1Id: number, user2Id: number): Promise<Message[]> {
    const result = await db.select().from(messages);
    return result
      .filter(message => 
        (message.senderId === user1Id && message.receiverId === user2Id) ||
        (message.senderId === user2Id && message.receiverId === user1Id)
      )
      .sort((a, b) => a.createdAt!.getTime() - b.createdAt!.getTime());
  }

  async createMessage(insertMessage: InsertMessage): Promise<Message> {
    const [message] = await db
      .insert(messages)
      .values(insertMessage)
      .returning();
    return message;
  }

  async getCartItems(buyerId: number): Promise<CartItem[]> {
    return await db.select().from(cartItems).where(eq(cartItems.buyerId, buyerId));
  }

  async addToCart(insertCartItem: InsertCartItem): Promise<CartItem> {
    const [cartItem] = await db
      .insert(cartItems)
      .values(insertCartItem)
      .returning();
    return cartItem;
  }

  async removeFromCart(buyerId: number, bookId: number): Promise<boolean> {
    const result = await db
      .delete(cartItems)
      .where(and(eq(cartItems.buyerId, buyerId), eq(cartItems.bookId, bookId)));
    return (result.rowCount || 0) > 0;
  }

  async clearCart(buyerId: number): Promise<boolean> {
    const result = await db.delete(cartItems).where(eq(cartItems.buyerId, buyerId));
    return (result.rowCount || 0) >= 0;
  }
}

export const storage = new DatabaseStorage();
