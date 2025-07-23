# BookBazaar - Used Book Marketplace

A full-stack web application for buying and selling used books, built with React, Node.js, Express, and PostgreSQL.

## 🚀 Features

### For Buyers
- Browse and search books by title, author, category, and condition
- Filter books by price, condition, and category
- Add books to shopping cart
- Secure checkout with simulated payment processing
- View order history and track purchases
- Message sellers directly about book listings

### For Sellers
- Create and manage book listings with photos and descriptions
- Dashboard to track sales and inventory
- Edit or delete book listings
- Communicate with potential buyers through messaging system
- View sales analytics and earnings

### User Management
- JWT-based authentication system
- Role-based access control (Buyer/Seller accounts)
- Secure password hashing with bcrypt
- User profiles and account management

## 🛠️ Tech Stack

### Frontend
- **React** with TypeScript
- **Vite** for fast development and builds
- **Wouter** for lightweight routing
- **TanStack Query** for server state management
- **Tailwind CSS** + **shadcn/ui** for styling
- **React Hook Form** with Zod validation
- **Lucide React** for icons

### Backend
- **Node.js** with **Express.js**
- **TypeScript** for type safety
- **PostgreSQL** with **Drizzle ORM**
- **JWT** for authentication
- **bcrypt** for password hashing
- **Multer** for file uploads
- **Zod** for schema validation

### Database
- **PostgreSQL** (Neon Database compatible)
- **Drizzle ORM** for type-safe database operations
- **Drizzle Kit** for migrations

## 📦 Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/bookbazaar.git
   cd bookbazaar
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env` file in the root directory:
   ```env
   DATABASE_URL=your_postgresql_connection_string
   JWT_SECRET=your_jwt_secret_key
   NODE_ENV=development
   ```

4. **Set up the database**
   ```bash
   npm run db:push
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

The application will be available at `http://localhost:5000`

## 🗄️ Database Schema

The application uses the following main tables:

- **users** - User accounts with buyer/seller roles
- **books** - Book listings with details and seller information
- **orders** - Purchase orders with status tracking
- **orderItems** - Individual items within orders
- **messages** - Communication between buyers and sellers
- **cartItems** - Shopping cart functionality

## 🚀 Deployment

### Prerequisites
- Node.js 18+ 
- PostgreSQL database
- Environment variables configured

### Build for Production
```bash
npm run build
```

### Deploy to Platforms
The application is ready to deploy to:
- **Render** - Full-stack deployment
- **Railway** - Database and backend hosting
- **Vercel/Netlify** - Frontend hosting
- **Heroku** - Complete application hosting

## 📱 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login

### Books
- `GET /api/books` - Get all books with filtering
- `GET /api/books/:id` - Get single book
- `POST /api/books` - Create book listing (sellers only)
- `PUT /api/books/:id` - Update book listing
- `DELETE /api/books/:id` - Delete book listing

### Cart & Orders
- `GET /api/cart` - Get user's cart items
- `POST /api/cart` - Add item to cart
- `DELETE /api/cart/:bookId` - Remove item from cart
- `POST /api/orders` - Create order from cart
- `GET /api/orders` - Get user's order history

### Messaging
- `GET /api/messages/:userId` - Get messages with user
- `POST /api/messages` - Send message

## 🎨 Design System

The application uses a modern design system with:
- **Primary Color**: Blue (#4F46E5)
- **Secondary Color**: Purple (#7C3AED)
- **Accent Color**: Green (#059669)
- **Typography**: Clean, readable fonts
- **Responsive Design**: Mobile-first approach
- **Dark Mode**: Support for light and dark themes

## 🔒 Security Features

- JWT token-based authentication
- Password hashing with bcrypt
- Input validation with Zod schemas
- SQL injection prevention with Drizzle ORM
- XSS protection
- CORS configuration
- Rate limiting (recommended for production)

## 🛡️ Testing

```bash
# Run tests (when implemented)
npm test

# Run type checking
npm run type-check

# Run linting
npm run lint
```

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📞 Support

For support and questions:
- Create an issue on GitHub
- Contact the development team
- Check the documentation

---

**Built with ❤️ using modern web technologies**