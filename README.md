# AI-Powered Budget Tracker

A comprehensive budget tracking application built with Next.js and Supabase, featuring income/expense management, category organization, budget planning, and financial insights.

## Features

### ✅ Core Features (MVP)

- **User Authentication**
  - Email/password sign-up and login
  - Secure session handling with Supabase Auth
  - User profile with base currency settings

- **Income & Expense Management**
  - Add, edit, and delete transactions
  - Fields: amount, category, date, note, currency
  - Income vs expense separation

- **Categories**
  - Default categories (Food, Transport, Rent, etc.)
  - Custom user-defined categories
  - Category type (income/expense) management

- **Budget Management**
  - Monthly total budget
  - Category-level budgets
  - Remaining budget calculation with visual indicators

- **Dashboard**
  - Monthly income, expenses, and balance overview
  - Expense breakdown by category (pie chart)
  - Timeline view (recent transactions)

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Database & Auth**: Supabase
- **Styling**: Tailwind CSS
- **Charts**: Recharts
- **Icons**: Lucide React
- **Date Handling**: date-fns
- **Language**: TypeScript

## Getting Started

### Prerequisites

- Node.js 18+ installed
- A Supabase account and project

### Setup Instructions

1. **Clone the repository** (if applicable) or navigate to the project directory:
   ```bash
   cd ai-budget-tracker
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Set up Supabase**:
   - Create a new project at [supabase.com](https://supabase.com)
   - Go to Project Settings > API
   - Copy your Project URL and anon/public key

4. **Configure environment variables**:
   - Create a `.env.local` file in the root directory
   - Add your Supabase credentials:
     ```
     NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
     NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
     ```

5. **Set up the database**:
   - In your Supabase dashboard, go to SQL Editor
   - Copy and paste the contents of `supabase-schema.sql`
   - Run the SQL script to create all necessary tables, triggers, and RLS policies

6. **Run the development server**:
   ```bash
   npm run dev
   ```

7. **Open your browser**:
   Navigate to [http://localhost:3000](http://localhost:3000)

## Project Structure

```
ai-budget-tracker/
├── app/                      # Next.js App Router pages
│   ├── dashboard/           # Dashboard page
│   ├── transactions/        # Transactions management
│   ├── budgets/             # Budget management
│   ├── categories/          # Category management
│   ├── settings/            # User settings
│   ├── login/               # Login page
│   └── register/            # Registration page
├── components/              # React components
│   ├── ui/                  # Reusable UI components
│   ├── layout/              # Layout components
│   ├── dashboard/           # Dashboard-specific components
│   ├── transactions/        # Transaction components
│   ├── budgets/             # Budget components
│   └── categories/         # Category components
├── lib/                     # Utility libraries
│   └── supabase/            # Supabase client utilities
├── types/                   # TypeScript type definitions
└── supabase-schema.sql      # Database schema

```

## Database Schema

The application uses the following main tables:

- **profiles**: User profiles with base currency
- **categories**: Income and expense categories (default + custom)
- **transactions**: Income and expense transactions
- **budgets**: Monthly and category-level budgets

All tables have Row Level Security (RLS) enabled to ensure users can only access their own data.

## Default Categories

When a user signs up, the following default categories are automatically created:

**Expense Categories:**
- Food
- Transport
- Rent
- Utilities
- Entertainment
- Shopping
- Healthcare
- Education

**Income Categories:**
- Salary
- Freelance
- Investment
- Other Income

## Usage

1. **Sign Up**: Create a new account with email and password
2. **Set Base Currency**: Go to Settings to set your preferred base currency
3. **Add Transactions**: Navigate to Transactions and add your income/expenses
4. **Manage Categories**: Add custom categories in the Categories page
5. **Set Budgets**: Create monthly or category-level budgets
6. **View Dashboard**: See your financial overview, spending breakdown, and recent activity

## Development

### Build for Production

```bash
npm run build
npm start
```

### Linting

```bash
npm run lint
```

## Environment Variables

Required environment variables:

- `NEXT_PUBLIC_SUPABASE_URL`: Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Your Supabase anon/public key

## Security

- All database operations use Row Level Security (RLS)
- Authentication is handled securely by Supabase
- User sessions are managed via HTTP-only cookies
- All API routes are protected by middleware

## License

This project is open source and available under the MIT License.

## Support

For issues or questions, please open an issue in the repository.
