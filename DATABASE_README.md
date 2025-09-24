# UNICROSS Pay Management System

A comprehensive payment management system for University of Cross River State (UNICROSS) built with Next.js, MongoDB, and TypeScript.

## Features

- **Multi-Portal System**: Separate interfaces for Students, Bursary, and Administrators
- **Payment Management**: Handle student payments, receipts, and payment history
- **Expense Tracking**: Manage departmental expenses and approvals
- **Financial Reporting**: Generate various financial reports and analytics
- **User Authentication**: Secure login system with role-based access control
- **Real-time Dashboard**: Live updates of financial data and statistics

## Tech Stack

- **Frontend**: Next.js 14, React 18, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, MongoDB with Mongoose ODM
- **Authentication**: JWT tokens with bcrypt password hashing
- **Charts**: Recharts for financial data visualization
- **Icons**: React Icons

## Prerequisites

- Node.js 18+ and npm
- MongoDB 5+ (local installation or MongoDB Atlas)

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd unicross-paymen-system
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```

   Edit `.env.local` and configure:
   - `MONGODB_URI`: Your MongoDB connection string
   - `JWT_SECRET`: A secure random string for JWT signing
   - `NEXTAUTH_SECRET`: Secret for NextAuth.js (if needed)

4. **Start MongoDB**
   - Local: `mongod`
   - Or use MongoDB Atlas cloud database

5. **Run the development server**
   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000) in your browser.

## Database Setup

The system will automatically create the following collections:

- **Users**: Student, bursary, and admin user accounts
- **Payments**: Student payment records
- **Receipts**: Payment receipts and confirmations
- **Expenses**: Departmental expense tracking
- **Reports**: Generated financial reports

### Creating Initial Users

You can create initial users through the registration API or by inserting directly into MongoDB:

```javascript
// Example student user
{
  email: "student@unicross.edu.ng",
  password: "password123", // Will be hashed
  role: "student",
  firstName: "John",
  lastName: "Doe",
  matricNo: "UNC/21/5001",
  isActive: true
}
```

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration

### Payments
- `GET /api/payments` - Get payments (with filters)
- `POST /api/payments` - Create new payment

### Receipts
- `GET /api/receipts` - Get receipts
- `POST /api/receipts` - Create new receipt

### Expenses
- `GET /api/expenses` - Get expenses
- `POST /api/expenses` - Create expense
- `PATCH /api/expenses` - Update expense status

### Reports
- `GET /api/reports` - Get reports
- `POST /api/reports` - Generate new report

### Users
- `GET /api/users` - Get users (admin only)
- `PATCH /api/users` - Update user information

## Usage

### For Students
1. Navigate to the Student Portal
2. Login with your credentials
3. View payment history and receipts
4. Make new payments through the payment modal

### For Bursary Staff
1. Navigate to the Bursary Portal
2. Login with bursary credentials
3. Log departmental expenses
4. Track expense approvals and payments

### For Administrators
1. Navigate to the Admin Portal
2. Login with admin credentials
3. View comprehensive financial reports
4. Generate new financial reports
5. Manage user accounts and permissions

## Security Features

- **Password Hashing**: bcrypt with salt rounds
- **JWT Authentication**: Secure token-based authentication
- **Role-Based Access**: Different permissions for each user type
- **Input Validation**: Server-side validation for all inputs
- **CORS Protection**: Configured for production deployment

## Development

### Project Structure
```
app/
├── api/                 # API routes
├── components/          # Reusable UI components
├── libs/               # Database models and utilities
├── student/            # Student portal pages
├── bursary/            # Bursary portal pages
└── admin/              # Admin portal pages
```

### Adding New Features

1. **New API Route**: Create in `app/api/`
2. **New Component**: Add to `app/components/`
3. **New Page**: Add to appropriate portal directory
4. **Database Model**: Add to `app/libs/models/`

## Deployment

### Vercel (Recommended)
1. Push to GitHub
2. Connect repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy

### Other Platforms
- Ensure MongoDB connection is configured
- Set environment variables
- Build and start the application

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support or questions, please contact the development team or create an issue in the repository.
