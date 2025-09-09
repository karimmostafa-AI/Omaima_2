# Omaima_2 - Custom Tailoring E-commerce Platform

A modern, full-stack e-commerce platform specialized for custom tailoring services with comprehensive admin panel and order management system.

## 🚀 Features

### Customer Features
- **Custom Garment Designer**: Interactive customization tool for tailored clothing
- **Product Catalog**: Browse ready-to-wear and customizable products
- **User Authentication**: Secure login and registration system
- **Order Management**: Track orders from placement to delivery
- **Responsive Design**: Optimized for desktop, tablet, and mobile devices

### Admin Panel Features
- **Comprehensive Orders Management**: 
  - Advanced order filtering by status with tabbed navigation
  - Detailed order views with complete product information
  - Invoice and payment slip generation with download functionality
  - Real-time order status management and tracking
  - Customer information and shipping address management
- **Product Management**: Add, edit, and manage products and categories
- **Customer Management**: View and manage customer information
- **Dashboard Analytics**: Overview of sales, orders, and business metrics
- **Role-based Access Control**: Secure admin authentication and permissions

## 🛠 Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS, shadcn/ui components
- **Backend**: Next.js API routes, Prisma ORM
- **Database**: SQLite (development), PostgreSQL (production ready)
- **Authentication**: Supabase Auth with enhanced security
- **State Management**: Zustand
- **Form Handling**: React Hook Form with Zod validation

## 📦 Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/karimmostafa-AI/omaima_2.git
   cd omaima_2
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```
   Fill in your environment variables in `.env.local`

4. **Set up the database**
   ```bash
   npm run db:push
   npm run seed:orders  # Optional: Add sample data
   ```

5. **Run the development server**
   ```bash
   npm run dev
   ```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## 🎨 Key Features Implemented

### 📋 Orders Management System
- **Orders List Page**: 
  - Tabbed navigation for status filtering (All, Pending, Confirmed, Processing, Shipped, Delivered, Cancelled)
  - Comprehensive order table with customer info, payment status, and actions
  - Advanced pagination with page numbers and navigation
  - Status badges with color coding and icons
  - Download functionality for invoices
  - Empty state handling with contextual messages

- **Order Details Page**:
  - Header with order ID and download buttons (Invoice, Payment Slip)
  - Detailed order information with status badges
  - Product table with thumbnails, size, color, pricing
  - Comprehensive order summary (subtotal, discount, delivery, tax, grand total)
  - Customer information and shipping address
  - Interactive status management controls (dropdown, payment toggle)
  - Two-column responsive layout

### 🏗 Project Structure

```
src/
├── app/                    # Next.js 13+ app router
│   ├── admin/             # Admin panel pages
│   │   └── orders/        # Orders management
│   ├── api/               # API routes
│   │   └── admin/orders/  # Orders API endpoints
│   └── (public)/          # Public pages
├── components/            # Reusable React components
│   ├── admin/             # Admin-specific components
│   │   ├── orders-list.tsx      # Orders list component
│   │   ├── order-details.tsx    # Order details component
│   │   └── assign-rider-modal.tsx
│   ├── ui/                # UI components (shadcn/ui)
│   └── layout/            # Layout components
├── lib/                   # Utility functions and services
│   └── services/          # Business logic services
│       └── order-service.ts     # Order management service
├── store/                 # State management (Zustand)
├── types/                 # TypeScript type definitions
└── scripts/               # Database seeders
    └── seed-orders.ts     # Sample orders data
```

## 🧪 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run db:generate` - Generate Prisma client
- `npm run db:push` - Push database schema
- `npm run db:studio` - Open Prisma Studio
- `npm run seed:orders` - Seed sample orders data (25 orders with various statuses)

## 🔧 Configuration

### Environment Variables
Create a `.env.local` file with the following variables:

```env
# Database
DATABASE_URL="file:./dev.db"

# Supabase (for authentication)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# NextJS
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_nextauth_secret
```

### Database Setup
The project uses Prisma with SQLite for development:

```bash
# Generate Prisma client
npm run db:generate

# Push schema to database
npm run db:push

# Seed with sample data (optional)
npm run seed:orders
```

## 📱 Admin Panel Access

### Orders Management
1. **Orders List**: Navigate to `/admin/orders`
   - Filter orders by status using tabs
   - View order details by clicking "View" button
   - Download invoices using "Invoice" button
   - Paginate through orders using page controls

2. **Order Details**: Navigate to `/admin/orders/[id]`
   - View complete order information
   - Download payment slips and invoices
   - Update order status and payment status
   - Assign riders to orders

### Sample Data
Run `npm run seed:orders` to populate the database with:
- 25 sample orders with various statuses
- 4 sample customers
- 4 sample products (suits, blazers, shirts, pants)
- Realistic order data with proper relationships

## 🚀 Deployment

The application is ready for deployment on Vercel, Netlify, or any Node.js hosting platform.

### Vercel Deployment
1. Push code to GitHub
2. Connect repository to Vercel
3. Set environment variables
4. Deploy

### Environment Setup for Production
- Switch to PostgreSQL for production database
- Set up proper authentication providers
- Configure file storage for product images
- Set up email service for notifications

## 📈 Recent Updates

### Orders Management System (Latest)
- ✅ **Complete Orders List Page** with tabbed filtering and pagination
- ✅ **Enhanced Order Details Page** with comprehensive information display
- ✅ **Download Functionality** for invoices and payment slips
- ✅ **Interactive Status Management** with real-time updates
- ✅ **Professional UI/UX** with modern card-based design
- ✅ **Mobile Responsive** design that works on all devices
- ✅ **Sample Data Seeder** for immediate testing

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) - React framework
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS framework
- [shadcn/ui](https://ui.shadcn.com/) - Re-usable UI components
- [Prisma](https://prisma.io/) - Next-generation ORM
- [Supabase](https://supabase.io/) - Authentication and backend services

---

**Built with ❤️ for the custom tailoring industry**
