import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertUserSchema, insertBookSchema, insertMessageSchema, insertCartItemSchema } from "@shared/schema";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import multer from "multer";
import path from "path";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

// Configure multer for file uploads
const upload = multer({
  dest: 'uploads/',
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

// Middleware to verify JWT token
const authenticateToken = (req: any, res: any, next: any) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
    if (err) {
      return res.status(403).json({ message: 'Invalid token' });
    }
    req.user = user;
    next();
  });
};

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth routes
  app.post('/api/auth/register', async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      
      // Check if user already exists
      const existingUser = await storage.getUserByEmail(userData.email);
      if (existingUser) {
        return res.status(400).json({ message: 'User already exists' });
      }
      
      // Hash password
      const hashedPassword = await bcrypt.hash(userData.password, 10);
      
      const user = await storage.createUser({
        ...userData,
        password: hashedPassword,
      });
      
      // Generate JWT token
      const token = jwt.sign(
        { userId: user.id, email: user.email, role: user.role },
        JWT_SECRET,
        { expiresIn: '24h' }
      );
      
      res.status(201).json({
        user: { id: user.id, email: user.email, name: user.name, role: user.role },
        token,
      });
    } catch (error) {
      res.status(400).json({ message: 'Invalid input', error });
    }
  });

  app.post('/api/auth/login', async (req, res) => {
    try {
      const { email, password } = req.body;
      
      const user = await storage.getUserByEmail(email);
      if (!user) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }
      
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }
      
      const token = jwt.sign(
        { userId: user.id, email: user.email, role: user.role },
        JWT_SECRET,
        { expiresIn: '24h' }
      );
      
      res.json({
        user: { id: user.id, email: user.email, name: user.name, role: user.role },
        token,
      });
    } catch (error) {
      res.status(400).json({ message: 'Login failed', error });
    }
  });

  // Book routes
  app.get('/api/books', async (req, res) => {
    try {
      const { category, condition, search } = req.query;
      const books = await storage.getBooks({
        category: category as string,
        condition: condition as string,
        search: search as string,
      });
      res.json(books);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch books', error });
    }
  });

  app.get('/api/books/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const book = await storage.getBook(id);
      if (!book) {
        return res.status(404).json({ message: 'Book not found' });
      }
      res.json(book);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch book', error });
    }
  });

  app.post('/api/books', authenticateToken, upload.single('image'), async (req: any, res) => {
    try {
      if (req.user.role !== 'seller') {
        return res.status(403).json({ message: 'Only sellers can create books' });
      }
      
      const bookData = insertBookSchema.parse(req.body);
      const book = await storage.createBook(bookData, req.user.userId);
      res.status(201).json(book);
    } catch (error) {
      res.status(400).json({ message: 'Failed to create book', error });
    }
  });

  app.put('/api/books/:id', authenticateToken, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      const book = await storage.getBook(id);
      
      if (!book) {
        return res.status(404).json({ message: 'Book not found' });
      }
      
      if (book.sellerId !== req.user.userId) {
        return res.status(403).json({ message: 'You can only edit your own books' });
      }
      
      const bookData = insertBookSchema.partial().parse(req.body);
      const updatedBook = await storage.updateBook(id, bookData);
      res.json(updatedBook);
    } catch (error) {
      res.status(400).json({ message: 'Failed to update book', error });
    }
  });

  app.delete('/api/books/:id', authenticateToken, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      const book = await storage.getBook(id);
      
      if (!book) {
        return res.status(404).json({ message: 'Book not found' });
      }
      
      if (book.sellerId !== req.user.userId) {
        return res.status(403).json({ message: 'You can only delete your own books' });
      }
      
      await storage.deleteBook(id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: 'Failed to delete book', error });
    }
  });

  app.get('/api/seller/books', authenticateToken, async (req: any, res) => {
    try {
      if (req.user.role !== 'seller') {
        return res.status(403).json({ message: 'Only sellers can access this endpoint' });
      }
      
      const books = await storage.getBooksBySeller(req.user.userId);
      res.json(books);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch seller books', error });
    }
  });

  // Cart routes
  app.get('/api/cart', authenticateToken, async (req: any, res) => {
    try {
      const cartItems = await storage.getCartItems(req.user.userId);
      const cartWithBooks = await Promise.all(
        cartItems.map(async (item) => {
          const book = await storage.getBook(item.bookId);
          return { ...item, book };
        })
      );
      res.json(cartWithBooks);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch cart', error });
    }
  });

  app.post('/api/cart', authenticateToken, async (req: any, res) => {
    try {
      const { bookId } = req.body;
      const cartItem = await storage.addToCart({
        buyerId: req.user.userId,
        bookId: parseInt(bookId),
      });
      res.status(201).json(cartItem);
    } catch (error) {
      res.status(400).json({ message: 'Failed to add to cart', error });
    }
  });

  app.delete('/api/cart/:bookId', authenticateToken, async (req: any, res) => {
    try {
      const bookId = parseInt(req.params.bookId);
      await storage.removeFromCart(req.user.userId, bookId);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: 'Failed to remove from cart', error });
    }
  });

  // Order routes
  app.post('/api/orders', authenticateToken, async (req: any, res) => {
    try {
      const { total } = req.body;
      const cartItems = await storage.getCartItems(req.user.userId);
      
      if (cartItems.length === 0) {
        return res.status(400).json({ message: 'Cart is empty' });
      }
      
      const order = await storage.createOrder({
        buyerId: req.user.userId,
        total: total.toString(),
        status: 'completed',
      });
      
      // Create order items
      for (const cartItem of cartItems) {
        const book = await storage.getBook(cartItem.bookId);
        if (book) {
          await storage.createOrderItem({
            orderId: order.id,
            bookId: cartItem.bookId,
            price: book.price,
          });
          
          // Mark book as unavailable
          await storage.updateBook(cartItem.bookId, { isAvailable: false });
        }
      }
      
      // Clear cart
      await storage.clearCart(req.user.userId);
      
      res.status(201).json(order);
    } catch (error) {
      res.status(400).json({ message: 'Failed to create order', error });
    }
  });

  app.get('/api/orders', authenticateToken, async (req: any, res) => {
    try {
      const orders = await storage.getOrdersByBuyer(req.user.userId);
      const ordersWithItems = await Promise.all(
        orders.map(async (order) => {
          const items = await storage.getOrderItems(order.id);
          const itemsWithBooks = await Promise.all(
            items.map(async (item) => {
              const book = await storage.getBook(item.bookId);
              return { ...item, book };
            })
          );
          return { ...order, items: itemsWithBooks };
        })
      );
      res.json(ordersWithItems);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch orders', error });
    }
  });

  // Message routes
  app.get('/api/messages/:userId', authenticateToken, async (req: any, res) => {
    try {
      const otherUserId = parseInt(req.params.userId);
      const messages = await storage.getMessagesBetweenUsers(req.user.userId, otherUserId);
      res.json(messages);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch messages', error });
    }
  });

  app.post('/api/messages', authenticateToken, async (req: any, res) => {
    try {
      const messageData = insertMessageSchema.parse({
        ...req.body,
        senderId: req.user.userId,
      });
      const message = await storage.createMessage(messageData);
      res.status(201).json(message);
    } catch (error) {
      res.status(400).json({ message: 'Failed to send message', error });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
