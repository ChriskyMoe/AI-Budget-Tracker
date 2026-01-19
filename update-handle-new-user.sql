-- Update handle_new_user() function to use THB as default currency
-- Run this in Supabase SQL Editor

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, base_currency)
  VALUES (NEW.id, NEW.email, 'THB');
  
  -- Insert default categories
  INSERT INTO public.categories (user_id, name, type, is_default)
  VALUES
    (NEW.id, 'Food', 'expense', true),
    (NEW.id, 'Transport', 'expense', true),
    (NEW.id, 'Rent', 'expense', true),
    (NEW.id, 'Utilities', 'expense', true),
    (NEW.id, 'Entertainment', 'expense', true),
    (NEW.id, 'Shopping', 'expense', true),
    (NEW.id, 'Healthcare', 'expense', true),
    (NEW.id, 'Education', 'expense', true),
    (NEW.id, 'Salary', 'income', true),
    (NEW.id, 'Freelance', 'income', true),
    (NEW.id, 'Investment', 'income', true),
    (NEW.id, 'Other Income', 'income', true);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
