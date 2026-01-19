# User Journey, User Workflow & App Workflow Documentation

## 📋 Table of Contents
1. [User Journey Overview](#user-journey-overview)
2. [Detailed User Workflow](#detailed-user-workflow)
3. [App Workflow (Technical Flow)](#app-workflow-technical-flow)
4. [Feature-Specific Workflows](#feature-specific-workflows)
5. [Navigation Flow](#navigation-flow)

---

## 🎯 User Journey Overview

### High-Level Journey Map

```
┌─────────────┐
│   Landing   │
│    Page     │
└──────┬──────┘
       │
       ├─── Not Authenticated ────┐
       │                          │
       ▼                          ▼
┌─────────────┐          ┌─────────────┐
│   Login     │          │  Register   │
│    Page     │◄────────►│    Page     │
└──────┬──────┘          └──────┬──────┘
       │                        │
       │   Authentication       │
       │   Success              │
       │                        │
       └──────────┬─────────────┘
                  │
                  ▼
         ┌────────────────┐
         │   Dashboard     │
         │   (Home)        │
         └────────┬────────┘
                  │
        ┌─────────┼─────────┐
        │         │         │
        ▼         ▼         ▼
   ┌────────┐ ┌────────┐ ┌────────┐
   │Transact│ │Budgets │ │Categori│
   │  ions  │ │        │ │   es   │
   └────────┘ └────────┘ └────────┘
        │         │         │
        └─────────┼─────────┘
                  │
                  ▼
            ┌──────────┐
            │ Settings │
            └──────────┘
```

---

## 👤 Detailed User Workflow

This section provides an in-depth, step-by-step breakdown of every user interaction, including what happens behind the scenes, error handling, and real-world examples.

---

### Phase 1: Onboarding & Setup

#### Step 1: Initial Access - Landing Page Behavior

**User Action**: User types URL or clicks link to visit the application

**What User Sees**:
- Brief loading state (usually imperceptible)
- Immediate redirect (no visible landing page content)

**Behind the Scenes**:
```
User Request → Next.js Server
              ↓
         app/page.tsx executes
              ↓
    createClient() creates Supabase server client
              ↓
    supabase.auth.getUser() checks session
              ↓
    ┌─────────────────┬─────────────────┐
    │                 │                 │
    ▼                 ▼                 ▼
User Found      No User Found    Error Occurred
    │                 │                 │
    ▼                 ▼                 ▼
Redirect to    Redirect to      Redirect to
/dashboard     /login           /login
```

**Technical Details**:
- The root page (`app/page.tsx`) is a Server Component
- It runs on the server before rendering
- Uses `createClient()` from `@/lib/supabase/server` to access server-side Supabase client
- Checks authentication status synchronously
- Uses Next.js `redirect()` function for navigation

**Possible Outcomes**:
1. **Authenticated User**: 
   - Redirected to `/dashboard`
   - Session cookie is valid
   - User sees dashboard immediately

2. **Unauthenticated User**:
   - Redirected to `/login`
   - No session cookie found
   - User sees login form

3. **Session Expired**:
   - Redirected to `/login`
   - Cookie exists but is invalid
   - User must log in again

**Edge Cases**:
- If Supabase is unreachable: User sees error or timeout
- If environment variables missing: Middleware handles gracefully (allows login/register)

---

#### Step 2: Registration - New User Account Creation

**Path**: `/register`

**User Journey**:

**2.1. Accessing Registration Page**

**User Action**: 
- Clicks "Create a new account" link from login page, OR
- Navigates directly to `/register` URL

**What User Sees**:
```
┌─────────────────────────────────────┐
│         [Wallet Icon]                │
│                                     │
│    Create your account              │
│                                     │
│  Or sign in to your existing account│
│                                     │
│  ┌───────────────────────────────┐ │
│  │ Email address                 │ │
│  │ [________________________]     │ │
│  └───────────────────────────────┘ │
│                                     │
│  ┌───────────────────────────────┐ │
│  │ Password                      │ │
│  │ [________________________]     │ │
│  └───────────────────────────────┘ │
│                                     │
│  ┌───────────────────────────────┐ │
│  │ Confirm Password              │ │
│  │ [________________________]     │ │
│  └───────────────────────────────┘ │
│                                     │
│        [Create account]             │
└─────────────────────────────────────┘
```

**Behind the Scenes**:
- Middleware checks authentication
- If authenticated → redirects to `/dashboard`
- If not authenticated → allows access to registration page
- Page loads as Client Component (`'use client'`)

**2.2. Filling Registration Form**

**User Actions** (step-by-step):

1. **Enter Email**:
   - Types email address (e.g., `user@example.com`)
   - Input field validates format in real-time (HTML5 validation)
   - User sees: Normal input field

2. **Enter Password**:
   - Types password (minimum 6 characters required)
   - Input field shows password as dots/asterisks
   - User sees: Password field with hidden characters

3. **Confirm Password**:
   - Re-types password to confirm
   - User sees: Another password field

**Form Validation** (Client-Side):
```javascript
// Happens BEFORE submission
if (password !== confirmPassword) {
  setError('Passwords do not match')
  return // Stops submission
}

if (password.length < 6) {
  setError('Password must be at least 6 characters')
  return // Stops submission
}
```

**What User Sees During Validation**:
- If passwords don't match: Red error message appears below form
- If password too short: Red error message appears
- If email invalid: Browser shows HTML5 validation error

**2.3. Submitting Registration Form**

**User Action**: Clicks "Create account" button

**What User Sees**:
- Button text changes to "Creating account..."
- Button becomes disabled (can't click again)
- Loading spinner may appear
- Form fields become disabled

**Behind the Scenes - Detailed Flow**:

```
User Clicks Submit
       ↓
Form Validation (Client-Side)
       ↓
setLoading(true) - UI shows loading state
       ↓
supabase.auth.signUp({
  email: 'user@example.com',
  password: 'password123'
})
       ↓
┌─────────────────────────────────────┐
│   Supabase Auth Service             │
│   - Validates email format         │
│   - Checks if email already exists  │
│   - Hashes password securely        │
│   - Creates auth.users record       │
└─────────────────────────────────────┘
       ↓
┌─────────────────────────────────────┐
│   Database Trigger Fires             │
│   (on_auth_user_created)            │
│                                      │
│   1. Creates profile record:        │
│      - id: user UUID                │
│      - email: user@example.com      │
│      - base_currency: 'USD'        │
│                                      │
│   2. Creates 12 default categories:  │
│      Expense Categories (8):         │
│      - Food                          │
│      - Transport                     │
│      - Rent                          │
│      - Utilities                     │
│      - Entertainment                 │
│      - Shopping                      │
│      - Healthcare                    │
│      - Education                     │
│                                      │
│      Income Categories (4):          │
│      - Salary                        │
│      - Freelance                     │
│      - Investment                    │
│      - Other Income                  │
└─────────────────────────────────────┘
       ↓
Success Response
       ↓
router.push('/dashboard')
router.refresh()
       ↓
User redirected to Dashboard
```

**Success Scenario**:
- User sees: Brief loading, then redirect to dashboard
- User is automatically logged in
- Session cookie is set
- All default categories are ready to use

**Error Scenarios**:

1. **Email Already Exists**:
   ```
   Error: "User already registered"
   User sees: Red error message
   Action: User can click "sign in" link
   ```

2. **Invalid Email Format**:
   ```
   Error: "Invalid email"
   User sees: Browser validation error OR red error message
   Action: User corrects email format
   ```

3. **Network Error**:
   ```
   Error: "Network request failed"
   User sees: Red error message
   Action: User can retry
   ```

4. **Weak Password** (if Supabase has password policy):
   ```
   Error: "Password does not meet requirements"
   User sees: Red error message with requirements
   Action: User creates stronger password
   ```

**Database Operations** (Automatic via Trigger):

The trigger function `handle_new_user()` executes automatically:

```sql
-- This happens AUTOMATICALLY in the database
INSERT INTO profiles (id, email, base_currency)
VALUES (NEW.id, NEW.email, 'USD');

INSERT INTO categories (user_id, name, type, is_default)
VALUES
  (NEW.id, 'Food', 'expense', true),
  (NEW.id, 'Transport', 'expense', true),
  -- ... 10 more categories
```

**Timing**:
- Form submission: ~100-500ms
- Supabase Auth: ~200-1000ms
- Database trigger: ~50-200ms
- Total: ~350-1700ms (usually under 1 second)

**Outcome**:
- ✅ User account created
- ✅ User profile created with USD as default currency
- ✅ 12 default categories created
- ✅ User is authenticated
- ✅ Session established
- ✅ Redirected to dashboard

---

#### Step 3: Login - Returning User Authentication

**Path**: `/login`

**3.1. Accessing Login Page**

**User Action**: 
- Navigates to `/login` URL, OR
- Clicks "Sign in" link from register page, OR
- Gets redirected from protected route

**What User Sees**:
```
┌─────────────────────────────────────┐
│         [Wallet Icon]               │
│                                     │
│    Sign in to your account          │
│                                     │
│  Or create a new account            │
│                                     │
│  ┌───────────────────────────────┐  │
│  │ Email address                 │  │
│  │ [________________________]     │  │
│  └───────────────────────────────┘  │
│                                     │
│  ┌───────────────────────────────┐  │
│  │ Password                      │  │
│  │ [________________________]     │  │
│  └───────────────────────────────┘  │
│                                     │
│        [Sign in]                    │
└─────────────────────────────────────┘
```

**Behind the Scenes**:
- Middleware checks: If authenticated → redirects to `/dashboard`
- If not authenticated → shows login page
- Page is Client Component

**3.2. Entering Credentials**

**User Actions**:
1. Types email address
2. Types password
3. Clicks "Sign in" button

**Form Validation**:
- Email: HTML5 validation (must be valid email format)
- Password: Required field (no minimum length check on login)

**3.3. Submitting Login**

**User Action**: Clicks "Sign in"

**What User Sees**:
- Button text: "Signing in..."
- Button disabled
- Form fields disabled

**Behind the Scenes - Detailed Flow**:

```
User Clicks Sign In
       ↓
setLoading(true)
       ↓
supabase.auth.signInWithPassword({
  email: 'user@example.com',
  password: 'password123'
})
       ↓
┌─────────────────────────────────────┐
│   Supabase Auth Service             │
│   - Looks up user by email          │
│   - Verifies password hash          │
│   - Creates session token           │
│   - Returns session data            │
└─────────────────────────────────────┘
       ↓
Session Cookie Set (HTTP-only, Secure)
       ↓
router.push('/dashboard')
router.refresh()
       ↓
Dashboard loads with user data
```

**Success Scenario**:
- ✅ Credentials verified
- ✅ Session created
- ✅ Cookie set (HTTP-only, secure)
- ✅ Redirected to dashboard
- ✅ User sees their financial data

**Error Scenarios**:

1. **Invalid Email**:
   ```
   Error: "Invalid login credentials"
   User sees: Red error message
   Action: User checks email spelling
   ```

2. **Wrong Password**:
   ```
   Error: "Invalid login credentials"
   User sees: Red error message
   Action: User re-enters password or clicks "Forgot password" (if implemented)
   ```

3. **User Not Found**:
   ```
   Error: "Invalid login credentials"
   User sees: Red error message
   Action: User can register new account
   ```

4. **Account Disabled** (if implemented):
   ```
   Error: "Account disabled"
   User sees: Red error message
   Action: Contact support
   ```

**Security Features**:
- Password is never sent in plain text (handled by Supabase)
- Session stored in HTTP-only cookie (prevents XSS)
- CSRF protection via Next.js
- Rate limiting (handled by Supabase)

**Timing**:
- Form submission: ~100-500ms
- Authentication: ~200-1000ms
- Total: ~300-1500ms

---

### Phase 2: Initial Configuration

#### Step 4: Set Base Currency - User Preferences

**Path**: `/settings`

**4.1. Accessing Settings**

**User Actions**:
- Option 1: Clicks Settings icon (⚙️) in header (top right)
- Option 2: Navigates directly to `/settings` URL

**What User Sees**:
```
┌─────────────────────────────────────┐
│  [Header with Navigation]          │
│                                     │
│  Settings                           │
│  Manage your account settings...   │
│                                     │
│  ┌───────────────────────────────┐  │
│  │ Profile Settings              │  │
│  │                               │  │
│  │ Email                         │  │
│  │ [user@example.com] (disabled) │  │
│  │ Email cannot be changed       │  │
│  │                               │  │
│  │ Base Currency                │  │
│  │ [USD ▼]                      │  │
│  │ This currency will be used... │  │
│  │                               │  │
│  │        [Save Changes]         │  │
│  └───────────────────────────────┘  │
└─────────────────────────────────────┘
```

**Behind the Scenes**:
- Server Component fetches user profile
- Checks authentication (redirects if not authenticated)
- Loads current `base_currency` from database
- Displays form with current values

**4.2. Selecting Base Currency**

**User Action**: Clicks dropdown and selects currency

**Available Options**:
- USD - US Dollar (default)
- EUR - Euro
- GBP - British Pound
- JPY - Japanese Yen
- CAD - Canadian Dollar
- AUD - Australian Dollar

**What Happens**:
- Dropdown shows selected currency
- Helper text explains: "This currency will be used as the default for your transactions and budgets"

**4.3. Saving Settings**

**User Action**: Clicks "Save Changes" button

**What User Sees**:
- Button text: "Saving..."
- Button disabled
- Form fields disabled

**Behind the Scenes**:

```
User Clicks Save
       ↓
setLoading(true)
       ↓
supabase.auth.getUser() - Verify authentication
       ↓
supabase
  .from('profiles')
  .update({ base_currency: 'EUR' })
  .eq('id', user.id)
       ↓
┌─────────────────────────────────────┐
│   Database Update                    │
│   - RLS Policy checks user_id       │
│   - Updates base_currency field     │
│   - Updates updated_at timestamp    │
└─────────────────────────────────────┘
       ↓
Success Response
       ↓
setSuccess('Settings updated successfully!')
router.refresh()
       ↓
Page refreshes with new currency
```

**Success Scenario**:
- ✅ Profile updated in database
- ✅ Green success message appears: "Settings updated successfully!"
- ✅ Page refreshes
- ✅ All future transactions/budgets default to new currency
- ✅ Dashboard displays amounts in new currency

**Error Scenarios**:

1. **Not Authenticated**:
   ```
   Error: "Not authenticated"
   User sees: Red error message
   Action: User redirected to login
   ```

2. **Database Error**:
   ```
   Error: "Failed to update settings"
   User sees: Red error message
   Action: User can retry
   ```

3. **Network Error**:
   ```
   Error: "Network request failed"
   User sees: Red error message
   Action: User can retry
   ```

**Impact of Currency Change**:
- ✅ New transactions default to selected currency
- ✅ New budgets default to selected currency
- ✅ Dashboard displays in selected currency
- ⚠️ Existing transactions keep their original currency
- ⚠️ Existing budgets keep their original currency

**Timing**:
- Form submission: ~100-300ms
- Database update: ~50-200ms
- Total: ~150-500ms

---

### Phase 3: Core Usage Workflow

#### Step 5: Add Transactions - Primary Activity

**Path**: `/transactions`

**5.1. Accessing Transactions Page**

**User Action**: Clicks "Transactions" in header navigation

**What User Sees**:
```
┌─────────────────────────────────────┐
│  [Header with Navigation]          │
│                                     │
│  Transactions        [+ Add Trans.] │
│  Manage your income and expenses   │
│                                     │
│  ┌───────────────────────────────┐  │
│  │ [List of transactions]        │  │
│  │                               │  │
│  │ Dec 15, 2024                  │  │
│  │ 💰 Salary          +$5,000    │  │
│  │                               │  │
│  │ Dec 14, 2024                  │  │
│  │ 🍔 Food            -$45.50   │  │
│  │ 🚗 Transport       -$12.00   │  │
│  │                               │  │
│  │ [More transactions...]        │  │
│  └───────────────────────────────┘  │
└─────────────────────────────────────┘
```

**Behind the Scenes**:
- Server Component fetches:
  1. User profile (for base currency)
  2. All user transactions (sorted by date, newest first)
  3. All user categories (for dropdown)
- Data is filtered by RLS (only user's own data)
- Transactions include category names via JOIN

**5.2. Opening Add Transaction Form**

**User Action**: Clicks "+ Add Transaction" button

**What User Sees**:
```
┌─────────────────────────────────────┐
│  Add Transaction            [X]     │
│                                     │
│  Type                               │
│  [Expense ▼]                        │
│                                     │
│  Category                           │
│  [Select a category ▼]              │
│                                     │
│  Amount                             │
│  [0.00]                             │
│                                     │
│  Date                               │
│  [2024-12-15] (today's date)       │
│                                     │
│  Note (optional)                    │
│  [________________]                 │
│                                     │
│  Currency                           │
│  [USD ▼]                            │
│                                     │
│  [Cancel]  [Add]                   │
└─────────────────────────────────────┘
```

**Form Defaults**:
- Type: "Expense"
- Category: Empty (must select)
- Amount: 0.00
- Date: Today's date (auto-filled)
- Note: Empty
- Currency: User's base currency (from settings)

**5.3. Filling Transaction Form - Detailed Steps**

**Step 5.3.1: Select Transaction Type**

**User Action**: Clicks Type dropdown

**Options**:
- Expense (default)
- Income

**What Happens When Type Changes**:
- Category dropdown **automatically filters** to show only categories of selected type
- If user had selected a category, it's cleared (since category type might not match)
- Example: Switch from "Expense" to "Income" → Only income categories shown

**Step 5.3.2: Select Category**

**User Action**: Clicks Category dropdown

**What User Sees**:
- If Type = Expense: Shows expense categories (Food, Transport, Rent, etc.)
- If Type = Income: Shows income categories (Salary, Freelance, etc.)
- Categories are sorted alphabetically
- Default categories appear first (if sorted)

**Example Categories Shown** (if Expense selected):
```
Select a category
Food
Healthcare
Rent
Shopping
Transport
Utilities
[Custom categories user created]
```

**Step 5.3.3: Enter Amount**

**User Action**: Types numeric value

**Validation**:
- Must be greater than 0
- Accepts decimals (e.g., 45.50)
- Step: 0.01 (allows cents)
- Format: User types "45.5" → stored as 45.50

**Step 5.3.4: Select Date**

**User Action**: Clicks date picker

**Default**: Today's date (auto-filled)
**Options**: Can select any past or future date
**Format**: YYYY-MM-DD

**Use Cases**:
- Recording past transaction: Select date in past
- Recording future transaction: Select future date
- Recording today's transaction: Use default

**Step 5.3.5: Add Note (Optional)**

**User Action**: Types text description

**Purpose**: Add context/details about transaction
**Examples**:
- "Grocery shopping at Walmart"
- "Monthly salary deposit"
- "Dinner with friends"

**Step 5.3.6: Select Currency**

**User Action**: Clicks Currency dropdown

**Options**: USD, EUR, GBP, JPY, CAD, AUD
**Default**: User's base currency (from settings)

**5.4. Submitting Transaction**

**User Action**: Clicks "Add" button

**What User Sees**:
- Button text: "Saving..."
- Button disabled
- Form fields disabled
- Modal stays open during save

**Behind the Scenes - Detailed Flow**:

```
User Clicks Add
       ↓
Form Validation (Client-Side)
  - Type: Required
  - Category: Required (must be selected)
  - Amount: Required, must be > 0
  - Date: Required
  - Currency: Required
  - Note: Optional
       ↓
setLoading(true)
       ↓
supabase.auth.getUser() - Verify authentication
       ↓
supabase
  .from('transactions')
  .insert({
    user_id: user.id,
    amount: 45.50,
    category_id: 'category-uuid',
    type: 'expense',
    date: '2024-12-15',
    note: 'Grocery shopping',
    currency: 'USD'
  })
       ↓
┌─────────────────────────────────────┐
│   Database Insert                    │
│   - RLS Policy checks user_id       │
│   - Validates foreign key (category) │
│   - Validates amount > 0            │
│   - Sets created_at timestamp       │
│   - Returns new transaction record  │
└─────────────────────────────────────┘
       ↓
Success Response
       ↓
router.refresh() - Refreshes page data
onClose() - Closes modal
       ↓
Transaction appears in list (top, newest first)
```

**Success Scenario**:
- ✅ Transaction saved to database
- ✅ Modal closes automatically
- ✅ Transaction list refreshes
- ✅ New transaction appears at top of list
- ✅ Dashboard updates (if viewing current month)

**Error Scenarios**:

1. **Validation Errors** (Client-Side):
   ```
   Error: Field validation failed
   User sees: Browser shows required field errors
   Action: User fills missing fields
   ```

2. **Invalid Category**:
   ```
   Error: "Foreign key constraint violation"
   User sees: Red error message in modal
   Action: User selects valid category
   ```

3. **Not Authenticated**:
   ```
   Error: "Not authenticated"
   User sees: Red error message
   Action: User redirected to login
   ```

4. **Database Error**:
   ```
   Error: "Failed to create transaction"
   User sees: Red error message in modal
   Action: User can retry
   ```

**5.5. Editing Existing Transaction**

**User Action**: Clicks "Edit" button next to a transaction

**What User Sees**:
- Modal opens with form pre-filled
- Title: "Edit Transaction" (instead of "Add Transaction")
- All fields populated with current values
- Button text: "Update" (instead of "Add")

**Behind the Scenes**:
- Form loads transaction data
- Pre-fills all fields
- User can modify any field
- On submit: Uses `UPDATE` instead of `INSERT`

**Update Flow**:
```
User Modifies Fields
       ↓
Clicks "Update"
       ↓
supabase
  .from('transactions')
  .update({ ...modifiedFields })
  .eq('id', transaction.id)
  .eq('user_id', user.id)  // Security: ensures user owns transaction
       ↓
Success → Refresh → Close Modal
```

**5.6. Deleting Transaction**

**User Action**: Clicks "Delete" button next to a transaction

**What User Sees**:
- Confirmation dialog appears:
  ```
  ┌──────────────────────────────┐
  │ Delete Transaction?          │
  │                              │
  │ Are you sure you want to     │
  │ delete this transaction?     │
  │                              │
  │ This action cannot be undone.│
  │                              │
  │  [Cancel]  [Delete]          │
  └──────────────────────────────┘
  ```

**User Action**: Clicks "Delete" in confirmation

**Behind the Scenes**:
```
User Confirms Delete
       ↓
supabase
  .from('transactions')
  .delete()
  .eq('id', transaction.id)
  .eq('user_id', user.id)  // Security check
       ↓
Success → Refresh → Transaction removed from list
```

**Safety Features**:
- Confirmation dialog prevents accidental deletion
- RLS ensures user can only delete own transactions
- Foreign key constraints prevent orphaned records

**Transaction List Behavior**:
- Sorted by date (newest first)
- Grouped by date (if multiple transactions same day)
- Shows: Date, Category icon/name, Amount (color-coded: green for income, red for expense)
- Each transaction has Edit and Delete buttons

**Timing**:
- Form open: Instant (modal)
- Form submission: ~200-800ms
- List refresh: ~100-500ms
- Total: ~300-1300ms

---

#### Step 6: Manage Categories - Customization

**Path**: `/categories`

**6.1. Accessing Categories Page**

**User Action**: Clicks "Categories" in header navigation

**What User Sees**:
```
┌─────────────────────────────────────┐
│  Categories        [+ Add Category] │
│  Manage your income and expense...  │
│                                     │
│  Expense Categories                 │
│  ┌───────────────────────────────┐  │
│  │ 🍔 Food              [Edit]   │  │
│  │ 🚗 Transport         [Edit]   │  │
│  │ 🏠 Rent              [Edit]   │  │
│  │ [Default categories...]       │  │
│  └───────────────────────────────┘  │
│                                     │
│  Income Categories                  │
│  ┌───────────────────────────────┐  │
│  │ 💰 Salary            [Edit]   │  │
│  │ [Default categories...]       │  │
│  └───────────────────────────────┘  │
│                                     │
│  Custom Categories                  │
│  ┌───────────────────────────────┐  │
│  │ 🎮 Gaming            [Edit][X] │  │
│  │ [User-created categories]     │  │
│  └───────────────────────────────┘  │
└─────────────────────────────────────┘
```

**Behind the Scenes**:
- Server Component fetches all user categories
- Categories sorted by:
  1. `is_default` (defaults first)
  2. `type` (expense, then income)
  3. `name` (alphabetically)
- Default categories marked visually (cannot be deleted)

**6.2. Adding Custom Category**

**User Action**: Clicks "+ Add Category" button

**What User Sees**:
```
┌─────────────────────────────────────┐
│  Add Category              [X]     │
│                                     │
│  Name                               │
│  [________________]                 │
│                                     │
│  Type                               │
│  [Expense ▼]                        │
│                                     │
│  [Cancel]  [Add]                   │
└─────────────────────────────────────┘
```

**Form Fields**:
- **Name**: Text input (required, unique per user+type)
- **Type**: Dropdown - Expense or Income (required)

**User Fills Form**:
- Example: Name = "Gaming", Type = "Expense"
- Clicks "Add"

**Behind the Scenes**:
```
User Clicks Add
       ↓
Validation:
  - Name: Required, not empty
  - Type: Required
  - Check: Name + Type unique for user
       ↓
supabase
  .from('categories')
  .insert({
    user_id: user.id,
    name: 'Gaming',
    type: 'expense',
    is_default: false
  })
       ↓
Database checks UNIQUE constraint:
  UNIQUE(user_id, name, type)
       ↓
Success → Refresh → Category appears in list
```

**Success Scenario**:
- ✅ Category created
- ✅ Immediately available in transaction forms
- ✅ Appears in categories list
- ✅ Can be used for transactions and budgets

**Error Scenarios**:

1. **Duplicate Category**:
   ```
   Error: "Category already exists"
   User sees: Red error message
   Action: User chooses different name
   ```

2. **Empty Name**:
   ```
   Error: Browser validation or "Name required"
   User sees: Field highlighted or error message
   Action: User enters name
   ```

**6.3. Editing Custom Category**

**User Action**: Clicks "Edit" button next to custom category

**What User Sees**:
- Modal opens with form pre-filled
- Name and Type fields editable
- Button: "Update"

**Limitations**:
- Default categories: Can edit name, but `is_default` stays true
- Custom categories: Can edit name and type

**Update Flow**:
- User modifies name/type
- Clicks "Update"
- Database updates category
- All transactions using this category remain linked
- Category list refreshes

**6.4. Deleting Custom Category**

**User Action**: Clicks "Delete" (X) button next to custom category

**What User Sees**:
- Confirmation dialog (if implemented)
- OR immediate deletion

**Restrictions**:
- **Cannot delete default categories** (protected by `is_default = true`)
- **Cannot delete category if used by transactions** (foreign key constraint)
- Can only delete own custom categories

**Delete Flow**:
```
User Clicks Delete
       ↓
Check: is_default = false? (Client-side check)
       ↓
supabase
  .from('categories')
  .delete()
  .eq('id', category.id)
  .eq('user_id', user.id)
       ↓
Database checks:
  - RLS: User owns category?
  - Foreign Key: Any transactions use this category?
       ↓
If transactions exist:
  Error: "Cannot delete category in use"
Else:
  Success → Category deleted → Refresh
```

**Error if Category in Use**:
```
Error: "Cannot delete category that has transactions"
User sees: Red error message
Action: User must delete/change transactions first
```

**Category Usage**:
- Categories are immediately available after creation
- Used in:
  1. Transaction forms (filtered by type)
  2. Budget forms (for category budgets)
  3. Dashboard charts (expense breakdown)

**Timing**:
- Form open: Instant
- Category creation: ~150-500ms
- Category update: ~150-500ms
- Category delete: ~150-500ms

---

#### Step 7: Set Budgets - Financial Planning

**Path**: `/budgets`

**7.1. Accessing Budgets Page**

**User Action**: Clicks "Budgets" in header navigation

**What User Sees**:
```
┌─────────────────────────────────────┐
│  Budgets          [+ Add Budget]    │
│  Manage your monthly and category...│
│                                     │
│  December 2024                      │
│                                     │
│  ┌───────────────────────────────┐  │
│  │ Total Monthly Budget          │  │
│  │ $2,000.00                     │  │
│  │ Spent: $1,450.00              │  │
│  │ Remaining: $550.00            │  │
│  │ [████████░░] 72.5%            │  │
│  │ [Edit] [Delete]               │  │
│  └───────────────────────────────┘  │
│                                     │
│  ┌───────────────────────────────┐  │
│  │ Food Budget                    │  │
│  │ $500.00                        │  │
│  │ Spent: $420.00                 │  │
│  │ Remaining: $80.00              │  │
│  │ [████████░░] 84% (Yellow)      │  │
│  │ [Edit] [Delete]               │  │
│  └───────────────────────────────┘  │
└─────────────────────────────────────┘
```

**Behind the Scenes**:
- Server Component fetches:
  1. Current month budgets (filtered by month/year)
  2. Current month expenses (for spending calculation)
  3. Expense categories (for category budget dropdown)
- Calculates spending vs budget for each budget
- Displays progress bars with color coding

**7.2. Adding Budget**

**User Action**: Clicks "+ Add Budget" button

**What User Sees**:
```
┌─────────────────────────────────────┐
│  Add Budget                 [X]     │
│                                     │
│  Budget Type                        │
│  [Total Monthly Budget ▼]          │
│                                     │
│  Category (if Category Budget)      │
│  [Select a category ▼]             │
│                                     │
│  Amount                             │
│  [0.00]                             │
│                                     │
│  Month        Year                  │
│  [December ▼] [2024]                │
│                                     │
│  Currency                           │
│  [USD ▼]                            │
│                                     │
│  [Cancel]  [Add]                   │
└─────────────────────────────────────┘
```

**Budget Types**:

1. **Total Monthly Budget**:
   - Overall spending limit for the month
   - No category selected
   - Compares against all expenses

2. **Category Budget**:
   - Spending limit for specific category
   - Must select category
   - Compares against expenses in that category only

**Form Defaults**:
- Budget Type: "Total Monthly Budget"
- Category: Empty (shown only if Category Budget selected)
- Amount: 0.00
- Month: Current month
- Year: Current year
- Currency: User's base currency

**7.3. Filling Budget Form**

**Step 7.3.1: Select Budget Type**

**User Action**: Clicks Budget Type dropdown

**Options**:
- Total Monthly Budget
- Category Budget

**What Happens**:
- If "Category Budget" selected → Category dropdown appears
- If "Total Monthly Budget" selected → Category dropdown hidden

**Step 7.3.2: Select Category (if Category Budget)**

**User Action**: Clicks Category dropdown

**What User Sees**:
- Only expense categories shown (budgets are for expenses)
- Categories sorted alphabetically
- Example: Food, Healthcare, Rent, Transport, etc.

**Step 7.3.3: Enter Amount**

**User Action**: Types budget amount

**Validation**:
- Must be >= 0
- Accepts decimals
- Example: 2000.00

**Step 7.3.4: Select Month and Year**

**User Action**: Selects month and year

**Default**: Current month and year
**Options**: Can select any future month/year for planning

**Step 7.3.5: Select Currency**

**User Action**: Selects currency

**Default**: User's base currency
**Options**: USD, EUR, GBP, JPY, CAD, AUD

**7.4. Submitting Budget**

**User Action**: Clicks "Add" button

**Behind the Scenes**:
```
User Clicks Add
       ↓
Validation:
  - Amount: Required, >= 0
  - Month: Required, 1-12
  - Year: Required, >= 2000
  - Category: Required if Category Budget
  - Currency: Required
       ↓
supabase
  .from('budgets')
  .insert({
    user_id: user.id,
    category_id: null OR category-uuid,
    amount: 2000.00,
    month: 12,
    year: 2024,
    currency: 'USD'
  })
       ↓
Database checks UNIQUE constraint:
  UNIQUE(user_id, category_id, month, year)
  (Prevents duplicate budgets for same month/category)
       ↓
Success → Refresh → Budget appears in list
```

**Success Scenario**:
- ✅ Budget created
- ✅ Appears in budgets list
- ✅ Progress bar calculated automatically
- ✅ Spending vs budget comparison shown

**Error Scenarios**:

1. **Duplicate Budget**:
   ```
   Error: "Budget already exists for this month/category"
   User sees: Red error message
   Action: User edits existing budget instead
   ```

2. **Invalid Amount**:
   ```
   Error: "Amount must be >= 0"
   User sees: Browser validation or error message
   Action: User enters valid amount
   ```

**7.5. Budget Display and Calculations**

**What User Sees for Each Budget**:

1. **Budget Name**:
   - Total Monthly Budget: "Total Monthly Budget"
   - Category Budget: Category name (e.g., "Food Budget")

2. **Budget Amount**: $2,000.00

3. **Spent Amount**: Calculated from transactions
   - Total Budget: Sum of all expenses this month
   - Category Budget: Sum of expenses in this category this month

4. **Remaining Budget**: Budget - Spent

5. **Progress Bar**: Visual indicator
   - Percentage: (Spent / Budget) × 100
   - Color coding:
     - 🟢 Green: < 80% (safe)
     - 🟡 Yellow: 80-100% (warning)
     - 🔴 Red: > 100% (over budget)

6. **Actions**: Edit and Delete buttons

**Calculation Example**:
```
Budget: $2,000.00
Spent: $1,450.00
Remaining: $550.00
Percentage: 72.5%
Color: Yellow (between 80-100% would be yellow, but 72.5% is green)
```

**7.6. Editing Budget**

**User Action**: Clicks "Edit" button

**What User Sees**:
- Modal opens with form pre-filled
- All fields editable
- Button: "Update"

**Update Flow**:
- User modifies amount/month/year/currency
- Clicks "Update"
- Budget updated in database
- Progress recalculated automatically
- List refreshes

**7.7. Deleting Budget**

**User Action**: Clicks "Delete" button

**What User Sees**:
- Confirmation dialog (if implemented)
- OR immediate deletion

**Delete Flow**:
- User confirms deletion
- Budget removed from database
- List refreshes
- No impact on transactions (transactions remain)

**Budget Constraints**:
- One total monthly budget per month
- One category budget per category per month
- Can have multiple category budgets (different categories) in same month

**Timing**:
- Form open: Instant
- Budget creation: ~150-500ms
- Budget update: ~150-500ms
- Budget delete: ~150-500ms
- Progress calculation: Automatic on page load

---

#### Step 8: Monitor Financial Health - Dashboard

**Path**: `/dashboard`

**8.1. Accessing Dashboard**

**User Action**: 
- Clicks "Dashboard" in header, OR
- Lands on dashboard after login (default page)

**What User Sees**:
```
┌─────────────────────────────────────┐
│  Dashboard                          │
│  December 2024                      │
│                                     │
│  ┌──────┐ ┌──────┐ ┌──────┐ ┌────┐ │
│  │Income│ │Expen│ │Balanc│ │Rem. │ │
│  │$5,000│ │$1,45│ │$3,550│ │$550 │ │
│  └──────┘ └──────┘ └──────┘ └────┘ │
│                                     │
│  ┌───────────────────────────────┐ │
│  │ Expense Breakdown              │ │
│  │        [Pie Chart]             │ │
│  │                                │ │
│  │ Food: $420 (29%)              │ │
│  │ Transport: $300 (21%)          │ │
│  │ Rent: $500 (34%)              │ │
│  │ [Other categories...]          │ │
│  └───────────────────────────────┘ │
│                                     │
│  ┌───────────────────────────────┐ │
│  │ Recent Activity                │ │
│  │                                │ │
│  │ Dec 15, 2024                   │ │
│  │   💰 Salary        +$5,000     │ │
│  │                                │ │
│  │ Dec 14, 2024                   │ │
│  │   🍔 Food          -$45.50     │ │
│  │   🚗 Transport     -$12.00     │ │
│  │                                │ │
│  │ [More transactions...]          │ │
│  └───────────────────────────────┘ │
└─────────────────────────────────────┘
```

**Behind the Scenes - Data Loading**:

```
Page Loads
       ↓
Server Component Executes:
       ↓
1. Get User Profile
   supabase.from('profiles').select('base_currency')
       ↓
2. Get Current Month Transactions
   supabase.from('transactions')
     .eq('user_id', user.id)
     .gte('date', monthStart)
     .lte('date', monthEnd)
     .order('date', { ascending: false })
       ↓
3. Get Current Month Budgets
   supabase.from('budgets')
     .eq('user_id', user.id)
     .eq('month', currentMonth)
     .eq('year', currentYear)
       ↓
4. Calculate Statistics:
   - Income: Sum of income transactions
   - Expenses: Sum of expense transactions
   - Balance: Income - Expenses
   - Remaining Budget: Total Budget - Expenses
       ↓
5. Aggregate Expenses by Category
   - Group transactions by category
   - Sum amounts per category
   - Calculate percentages
       ↓
6. Get Recent Transactions (Last 10 Days)
   - Filter transactions by date range
   - Group by date
   - Sort chronologically
       ↓
Render Dashboard with All Data
```

**8.2. Dashboard Components**

**Component 1: Stats Cards**

**What User Sees**:
- 4 cards displaying key metrics:
  1. **Income**: Total income this month (green, positive)
  2. **Expenses**: Total expenses this month (red, negative)
  3. **Balance**: Income - Expenses (green if positive, red if negative)
  4. **Remaining Budget**: Budget - Expenses (if budget exists)

**Calculations**:
```javascript
income = transactions
  .filter(t => t.type === 'income')
  .reduce((sum, t) => sum + t.amount, 0)

expenses = transactions
  .filter(t => t.type === 'expense')
  .reduce((sum, t) => sum + t.amount, 0)

balance = income - expenses

remainingBudget = totalBudget - expenses
```

**Component 2: Expense Breakdown Chart**

**What User Sees**:
- Interactive pie chart (Recharts library)
- Each segment represents a category
- Shows:
  - Category name
  - Amount spent
  - Percentage of total expenses
- Colors: Different color per category

**Data Preparation**:
```javascript
// Group expenses by category
categoryTotals = {}
transactions
  .filter(t => t.type === 'expense')
  .forEach(t => {
    categoryTotals[t.category.name] = 
      (categoryTotals[t.category.name] || 0) + t.amount
  })

// Calculate percentages
totalExpenses = sum(categoryTotals.values())
categoryData = Object.entries(categoryTotals).map(([name, amount]) => ({
  name,
  amount,
  percentage: (amount / totalExpenses) * 100
}))
```

**Component 3: Timeline View**

**What User Sees**:
- Recent transactions (last 10 days)
- Grouped by date
- Shows:
  - Date header
  - Transaction list for that date
  - Each transaction: Category icon, name, amount, note

**Data Preparation**:
```javascript
// Get last 10 days
tenDaysAgo = new Date()
tenDaysAgo.setDate(tenDaysAgo.getDate() - 10)

// Filter and group
recentTransactions = transactions
  .filter(t => t.date >= tenDaysAgo)
  .sort((a, b) => new Date(b.date) - new Date(a.date))

// Group by date
groupedByDate = {}
recentTransactions.forEach(t => {
  date = t.date
  if (!groupedByDate[date]) {
    groupedByDate[date] = []
  }
  groupedByDate[date].push(t)
})
```

**8.3. Dashboard Updates**

**When Dashboard Updates**:
- ✅ On page load/refresh
- ✅ After adding transaction (if router.refresh() called)
- ✅ After editing transaction
- ✅ After deleting transaction
- ✅ After adding budget
- ✅ After editing budget

**Real-Time Updates**:
- Currently: Manual refresh required
- Future: Could use Supabase Realtime for instant updates

**8.4. Dashboard Interactions**

**User Can**:
- View financial overview at a glance
- See spending patterns via pie chart
- Review recent transaction history
- Click chart segments (if interactive) to see category details
- Navigate to Transactions/Budgets pages for detailed management

**Timing**:
- Page load: ~300-1500ms (depends on data volume)
- Data fetching: ~200-1000ms
- Calculations: ~10-100ms
- Rendering: ~50-200ms

---

### Phase 4: Ongoing Management

#### Step 9: Regular Maintenance - Daily/Weekly/Monthly Tasks

**Daily/Weekly Tasks**:

1. **Add Transactions**:
   - Frequency: Daily or as expenses occur
   - Time: 1-2 minutes per transaction
   - Purpose: Keep financial records up to date

2. **Review Dashboard**:
   - Frequency: Daily or weekly
   - Time: 30 seconds - 2 minutes
   - Purpose: Monitor spending, check budget status

**Monthly Tasks**:

1. **Set/Update Budgets**:
   - Frequency: Beginning of each month
   - Time: 5-10 minutes
   - Purpose: Plan spending for upcoming month
   - Steps:
     - Review previous month's spending
     - Set total monthly budget
     - Set category budgets (optional)
     - Adjust based on financial goals

2. **Review Financial Health**:
   - Frequency: End of month
   - Time: 10-15 minutes
   - Purpose: Analyze spending patterns, adjust strategy
   - Review:
     - Total income vs expenses
     - Budget adherence
     - Category spending patterns
     - Balance trends

**As-Needed Tasks**:

1. **Manage Categories**:
   - When: New expense/income type not covered by defaults
   - Time: 1 minute
   - Action: Add custom category

2. **Update Settings**:
   - When: Moving to different country/currency
   - Time: 1 minute
   - Action: Change base currency

#### Step 10: Sign Out - Session Termination

**User Action**: Clicks "Sign Out" button in header

**What User Sees**:
- Button in top right of header
- Text: "Sign Out" with logout icon

**Behind the Scenes**:
```
User Clicks Sign Out
       ↓
supabase.auth.signOut()
       ↓
┌─────────────────────────────────────┐
│   Supabase Auth Service             │
│   - Invalidates session token        │
│   - Clears session cookie           │
│   - Returns success                 │
└─────────────────────────────────────┘
       ↓
router.push('/login')
       ↓
User redirected to login page
```

**What Happens**:
- ✅ Session destroyed on server
- ✅ Cookie cleared from browser
- ✅ User redirected to login page
- ✅ All protected routes now require re-authentication

**Security**:
- Session completely terminated
- Cannot access user data without re-login
- Next login creates new session

**Timing**:
- Sign out: ~100-500ms
- Redirect: Instant

---

## 📊 Workflow Summary Tables

### Complete User Journey Timeline

| Phase | Step | Duration | Frequency |
|-------|------|----------|-----------|
| **Onboarding** | Registration | 1-2 min | Once |
| **Onboarding** | Login | 30 sec | Per session |
| **Configuration** | Set Currency | 30 sec | As needed |
| **Core Usage** | Add Transaction | 1-2 min | Daily/Weekly |
| **Core Usage** | Manage Categories | 1-5 min | As needed |
| **Core Usage** | Set Budgets | 5-10 min | Monthly |
| **Core Usage** | View Dashboard | 30 sec - 2 min | Daily/Weekly |
| **Maintenance** | Review & Adjust | 10-15 min | Monthly |

### Data Flow Summary

| Action | Database Operations | RLS Checks | Updates |
|--------|-------------------|------------|---------|
| Register | Insert user, profile, 12 categories | N/A (trigger) | Profile, Categories |
| Login | Read session | Auth check | Session cookie |
| Add Transaction | Insert transaction | User ID check | Transactions |
| Edit Transaction | Update transaction | User ID check | Transactions |
| Delete Transaction | Delete transaction | User ID check | Transactions |
| Add Category | Insert category | User ID check | Categories |
| Add Budget | Insert budget | User ID check | Budgets |
| Update Settings | Update profile | User ID check | Profile |

---

This detailed workflow documentation covers every aspect of user interaction with the application, from initial registration through daily usage patterns. Each step includes what the user sees, what happens behind the scenes, error handling, and timing information.

---

## ⚙️ App Workflow (Technical Flow)

### Authentication Flow

```
┌──────────────┐
│ User Request │
└──────┬───────┘
       │
       ▼
┌─────────────────┐
│   Middleware    │
│  (Every Route)  │
└──────┬──────────┘
       │
       ├─── Check Supabase Session
       │
       ├─── Authenticated?
       │    │
       │    ├─── YES ────► Allow Access
       │    │              └───► Load Page Data
       │    │
       │    └─── NO ─────► Check Route
       │                   │
       │                   ├─── Public Route? (/login, /register)
       │                   │    └───► Allow Access
       │                   │
       │                   └─── Protected Route?
       │                        └───► Redirect to /login
```

### Data Flow Architecture

```
┌─────────────┐
│   Browser   │
│  (Client)   │
└──────┬──────┘
       │
       │ HTTP Request
       ▼
┌─────────────────┐
│  Next.js Server │
│  (App Router)   │
└──────┬──────────┘
       │
       ├─── Server Component ────┐
       │                         │
       │                         ▼
       │                  ┌──────────────┐
       │                  │ Supabase     │
       │                  │ Server Client│
       │                  └──────┬───────┘
       │                         │
       │                         │ SQL Query
       │                         ▼
       │                  ┌──────────────┐
       │                  │  Supabase    │
       │                  │  Database    │
       │                  │  (PostgreSQL)│
       │                  └──────┬───────┘
       │                         │
       │                         │ RLS Check
       │                         │ (User-specific)
       │                         │
       │                         ▼
       │                  ┌──────────────┐
       │                  │  Return Data │
       │                  └──────┬───────┘
       │                         │
       │                         │
       └─── Client Component ────┘
              │
              │ User Interaction
              ▼
       ┌──────────────┐
       │ Supabase     │
       │ Client       │
       └──────┬───────┘
              │
              │ Real-time Updates
              ▼
       ┌──────────────┐
       │  Database    │
       └──────────────┘
```

### Route Protection Flow

```
Request → Middleware → Check Auth → Route Decision
                                    │
                    ┌───────────────┼───────────────┐
                    │               │               │
              Authenticated    Public Route    Protected Route
                    │               │               │
                    ▼               ▼               ▼
              Allow Access    Allow Access    Redirect /login
                    │               │
                    └───────┬───────┘
                            │
                            ▼
                    Load Page Data
```

---

## 🔄 Feature-Specific Workflows

### Transaction Management Workflow

```
┌──────────────────┐
│ Transactions Page│
└────────┬─────────┘
         │
         ├─── View List ────► Fetch from DB ────► Display (sorted by date)
         │
         ├─── Add Transaction ────► Open Modal ────► Fill Form ────► Submit
         │                                                              │
         │                                                              ▼
         │                                                      Validate & Save
         │                                                              │
         │                                                              ▼
         │                                                      Refresh List
         │
         ├─── Edit Transaction ────► Open Modal ────► Pre-fill Form ────► Update
         │                                                                   │
         │                                                                   ▼
         │                                                           Refresh List
         │
         └─── Delete Transaction ────► Confirm Dialog ────► Delete ────► Refresh
```

### Budget Management Workflow

```
┌──────────────┐
│ Budgets Page │
└──────┬───────┘
       │
       ├─── View Budgets ────► Fetch Current Month Budgets
       │                       Fetch Current Month Expenses
       │                       Calculate Spending vs Budget
       │                       Display with Progress Bars
       │
       ├─── Add Budget ────► Open Modal ────► Fill Form ────► Save
       │                                                         │
       │                                                         ▼
       │                                                 Refresh List
       │
       └─── Edit/Delete ────► Modify ────► Save ────► Refresh
```

### Dashboard Workflow

```
┌──────────────┐
│  Dashboard   │
└──────┬───────┘
       │
       ├─── Load Stats ────► Fetch Current Month Transactions
       │                     Calculate: Income, Expenses, Balance
       │                     Fetch Current Month Budgets
       │                     Calculate Remaining Budget
       │                     Display Stats Cards
       │
       ├─── Load Chart ────► Group Expenses by Category
       │                     Calculate Percentages
       │                     Render Pie Chart (Recharts)
       │
       └─── Load Timeline ────► Fetch Last 10 Days Transactions
                                Group by Date
                                Display Chronologically
```

### Category Management Workflow

```
┌──────────────┐
│ Categories   │
└──────┬───────┘
       │
       ├─── View Categories ────► Fetch All Categories
       │                          Separate Default vs Custom
       │                          Display List
       │
       ├─── Add Category ────► Open Modal ────► Fill Form ────► Save
       │                                                          │
       │                                                          ▼
       │                                                  Refresh List
       │                                                  (Available in Transactions)
       │
       └─── Edit/Delete ────► Validate (can't delete defaults) ────► Update/Delete
```

---

## 🧭 Navigation Flow

### Navigation Structure

```
                    ┌──────────────┐
                    │    Header    │
                    │  (Always     │
                    │   Visible)   │
                    └──────┬───────┘
                           │
        ┌──────────────────┼──────────────────┐
        │                  │                  │
        ▼                  ▼                  ▼
┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│  Dashboard   │  │ Transactions │  │   Budgets     │
│   (Home)     │  │              │  │              │
└──────────────┘  └──────────────┘  └──────────────┘
        │                  │                  │
        └──────────────────┼──────────────────┘
                           │
                           ▼
                  ┌──────────────┐
                  │  Categories   │
                  └──────────────┘
                           │
                           ▼
                  ┌──────────────┐
                  │   Settings   │
                  │  (Icon Only) │
                  └──────────────┘
```

### Navigation Rules

1. **Header Navigation** (Main Menu):
   - Dashboard
   - Transactions
   - Budgets
   - Categories
   - Settings (icon only)
   - Sign Out (button)

2. **Access Control**:
   - All pages except `/login` and `/register` require authentication
   - Unauthenticated users are redirected to `/login`
   - Authenticated users visiting `/login` or `/register` are redirected to `/dashboard`

3. **Page Relationships**:
   - **Dashboard** → Overview of all data
   - **Transactions** → Core data entry point
   - **Budgets** → Planning tool (uses transaction data)
   - **Categories** → Organization tool (used by transactions)
   - **Settings** → Configuration (affects all pages)

---

## 📊 Data Relationships

```
User (Profile)
    │
    ├─── Categories (Default + Custom)
    │         │
    │         ├─── Used by Transactions
    │         └─── Used by Budgets
    │
    ├─── Transactions
    │         │
    │         ├─── Linked to Category
    │         └─── Used by Dashboard (aggregation)
    │         └─── Used by Budgets (spending calculation)
    │
    └─── Budgets
              │
              ├─── Optional: Linked to Category
              └─── Uses Transactions (for spending comparison)
```

---

## 🔐 Security Flow

### Row Level Security (RLS)

Every database query is automatically filtered by user:

```
User Query → Supabase → RLS Policy → Filtered Results
                                    │
                                    ├─── Only user's own data
                                    └─── Automatic user_id filtering
```

**Protected Tables**:
- `profiles`: Users can only access their own profile
- `categories`: Users can only see their own categories
- `transactions`: Users can only see their own transactions
- `budgets`: Users can only see their own budgets

---

## 🎨 User Experience Flow

### First-Time User Journey

1. **Landing** → Redirected to `/login`
2. **Register** → Creates account → Auto-setup (categories) → `/dashboard`
3. **Settings** → Set base currency (recommended)
4. **Categories** → Review defaults, optionally add custom ones
5. **Transactions** → Start recording income/expenses
6. **Budgets** → Set monthly/category budgets
7. **Dashboard** → Monitor financial health

### Returning User Journey

1. **Landing** → Redirected to `/dashboard` (if authenticated)
2. **Dashboard** → Quick overview
3. **Transactions** → Add new transactions
4. **Dashboard** → Check progress
5. **Budgets** → Review/adjust budgets
6. **Settings** → Update preferences (if needed)

---

## 📝 Key Workflow Patterns

### Pattern 1: Add → View → Manage
- **Add**: Create new record (transaction, budget, category)
- **View**: See list/overview
- **Manage**: Edit or delete

### Pattern 2: Plan → Track → Analyze
- **Plan**: Set budgets
- **Track**: Record transactions
- **Analyze**: View dashboard

### Pattern 3: Configure → Use → Monitor
- **Configure**: Set currency, add categories
- **Use**: Regular transaction entry
- **Monitor**: Dashboard review

---

## 🚀 Quick Reference: Common User Tasks

| Task | Path | Steps |
|------|------|-------|
| Sign Up | `/register` | Email → Password → Confirm → Submit |
| Sign In | `/login` | Email → Password → Submit |
| Add Transaction | `/transactions` | Click "Add" → Fill form → Submit |
| Set Budget | `/budgets` | Click "Add" → Fill form → Submit |
| Add Category | `/categories` | Click "Add" → Fill form → Submit |
| View Dashboard | `/dashboard` | Automatic (default page) |
| Change Currency | `/settings` | Select currency → Save |
| Sign Out | Any page | Click "Sign Out" button |

---

This document provides a comprehensive overview of how users interact with the application and how the application processes those interactions. Use it as a reference for understanding the complete user journey and technical implementation flow.
