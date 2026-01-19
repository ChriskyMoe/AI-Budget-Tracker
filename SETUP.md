# Setup Guide

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Supabase

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Wait for the project to be fully initialized
3. Go to **Project Settings** > **API**
4. Copy the following:
   - **Project URL** (e.g., `https://xxxxx.supabase.co`)
   - **anon/public key** (starts with `eyJ...`)

### 3. Create Environment File

Create a file named `.env.local` in the root directory:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

### 4. Set Up Database Schema

1. In your Supabase dashboard, go to **SQL Editor**
2. Click **New Query**
3. Open the file `supabase-schema.sql` from this project
4. Copy the entire contents
5. Paste into the SQL Editor
6. Click **Run** (or press Ctrl+Enter)

This will create:
- All necessary tables (profiles, categories, transactions, budgets)
- Row Level Security (RLS) policies
- Triggers for automatic profile creation
- Default categories for new users

### 5. Run the Application

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 6. Create Your First Account

1. Click "Create a new account" or navigate to `/register`
2. Enter your email and password (minimum 6 characters)
3. You'll be automatically logged in and redirected to the dashboard
4. Default categories will be created automatically

## Troubleshooting

### Database Connection Issues

- Verify your `.env.local` file has the correct values
- Make sure there are no extra spaces or quotes around the values
- Restart your development server after changing environment variables

### Authentication Not Working

- Check that the `handle_new_user` trigger was created successfully
- Verify RLS policies are enabled on all tables
- Check the Supabase logs for any errors

### Default Categories Not Appearing

- The trigger `on_auth_user_created` should fire automatically on signup
- Check Supabase logs if categories aren't being created
- You can manually run the category insert statements if needed

## Next Steps

1. **Set Your Base Currency**: Go to Settings and choose your preferred currency
2. **Add Transactions**: Start tracking your income and expenses
3. **Create Budgets**: Set monthly or category-level budgets
4. **View Dashboard**: See your financial overview and spending breakdown

## Production Deployment

Before deploying to production:

1. Set environment variables in your hosting platform (Vercel, Netlify, etc.)
2. Ensure your Supabase project is in production mode
3. Update any CORS settings if needed
4. Run `npm run build` to test the production build locally
