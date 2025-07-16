# BookBazaar - Used Book Marketplace

## Overview

BookBazaar is a full-stack web application for buying and selling used books. The application features a modern React frontend with a Node.js/Express backend, using PostgreSQL for data storage and Drizzle ORM for database management. The platform supports both buyers and sellers with comprehensive functionality for book listings, cart management, orders, and messaging.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript
- **Build Tool**: Vite for fast development and optimized builds
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: TanStack Query for server state management
- **Styling**: Tailwind CSS with shadcn/ui component library
- **Form Handling**: React Hook Form with Zod validation

### Backend Architecture
- **Runtime**: Node.js with Express framework
- **Language**: TypeScript with ES modules
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: JWT tokens with bcrypt for password hashing
- **File Uploads**: Multer for handling image uploads
- **API Design**: RESTful API with consistent error handling

### Database Layer
- **ORM**: Drizzle ORM for type-safe database operations
- **Database**: PostgreSQL (configured for Neon Database)
- **Migration**: Drizzle Kit for schema management
- **Connection**: @neondatabase/serverless for serverless PostgreSQL

## Key Components

### Database Schema
The application uses five main tables:
- **users**: Stores user accounts with role-based access (buyer/seller)
- **books**: Book listings with title, author, price, condition, and category
- **orders**: Purchase orders with status tracking
- **orderItems**: Individual items within orders
- **messages**: Communication between buyers and sellers
- **cartItems**: Shopping cart functionality

### Authentication System
- JWT-based authentication with localStorage persistence
- Role-based access control (buyer/seller roles)
- Password hashing with bcrypt
- Auth guard components for protected routes

### API Structure
- `/api/auth/*` - Authentication endpoints (login, register)
- `/api/books/*` - Book management (CRUD operations)
- `/api/cart/*` - Shopping cart operations
- `/api/orders/*` - Order management
- `/api/messages/*` - Messaging system
- `/api/seller/*` - Seller-specific endpoints

### Frontend Pages
- **Home**: Landing page with featured books and categories
- **Browse**: Book search and filtering
- **Book Detail**: Individual book pages with purchase options
- **Cart**: Shopping cart management
- **Checkout**: Order completion flow
- **Seller Dashboard**: Book management for sellers
- **Messages**: Communication between users
- **Orders**: Order history and tracking

## Data Flow

### User Registration/Login
1. User submits credentials via form
2. Backend validates and creates JWT token
3. Token stored in localStorage
4. User redirected to appropriate dashboard

### Book Listing (Sellers)
1. Seller creates book listing via dashboard
2. Form validation with Zod schemas
3. API call to create book record
4. Optional image upload handling
5. Book appears in marketplace

### Purchase Flow (Buyers)
1. User browses books and adds to cart
2. Cart items stored in database
3. Checkout process collects payment info
4. Order created with order items
5. Cart cleared after successful purchase

### Messaging System
1. Users can message about specific books
2. Real-time updates via polling
3. Messages stored with sender/receiver/book context

## External Dependencies

### Frontend Dependencies
- **UI Components**: Radix UI primitives with shadcn/ui
- **State Management**: TanStack Query for server state
- **Form Handling**: React Hook Form with Zod validation
- **Styling**: Tailwind CSS with class-variance-authority
- **Icons**: Lucide React icons
- **Routing**: Wouter for client-side routing

### Backend Dependencies
- **Database**: @neondatabase/serverless for PostgreSQL
- **ORM**: Drizzle ORM with PostgreSQL dialect
- **Authentication**: jsonwebtoken and bcrypt
- **File Upload**: Multer for image handling
- **Validation**: Zod for schema validation

### Development Tools
- **Build**: Vite for frontend, esbuild for backend
- **TypeScript**: Full TypeScript support across the stack
- **Database Migration**: Drizzle Kit for schema management
- **Development**: Hot module replacement with Vite

## Deployment Strategy

### Build Process
- Frontend built with Vite to `dist/public`
- Backend bundled with esbuild to `dist/index.js`
- Shared schema types used across frontend and backend

### Environment Configuration
- Database URL required for PostgreSQL connection
- JWT secret for authentication
- File upload directory configuration
- Production/development environment handling

### Production Deployment
- Static files served from Express in production
- Database migrations run via `db:push` command
- Environment variables for sensitive configuration
- Error handling and logging for production use

The architecture emphasizes type safety, code reuse, and maintainability while providing a smooth user experience for both buyers and sellers in the used book marketplace.