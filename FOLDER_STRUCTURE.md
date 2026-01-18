# AI-Powered Budget Tracker - Folder Structure

This document outlines the complete folder structure for the AI-Powered Budget Tracker application.

## Root Structure

```
my-app/
├── app/                          # Next.js App Router
│   ├── (auth)/                   # Auth route group (not in URL)
│   │   ├── login/
│   │   ├── register/
│   │   └── forgot-password/
│   ├── (dashboard)/               # Dashboard route group (not in URL)
│   │   ├── transactions/
│   │   ├── budgets/
│   │   ├── categories/
│   │   ├── reports/
│   │   ├── settings/
│   │   └── ai-insights/
│   ├── api/                      # API Routes
│   │   ├── auth/
│   │   ├── transactions/
│   │   ├── budgets/
│   │   ├── categories/
│   │   ├── reports/
│   │   └── ai/
│   ├── layout.tsx               # Root layout
│   ├── page.tsx                 # Home page
│   └── globals.css              # Global styles
│
├── components/                   # React Components
│   ├── ui/                      # Reusable UI components
│   │   ├── button/
│   │   ├── input/
│   │   ├── card/
│   │   ├── modal/
│   │   ├── chart/
│   │   └── table/
│   ├── layout/                  # Layout components (Header, Sidebar, Footer)
│   ├── dashboard/               # Dashboard-specific components
│   ├── transactions/            # Transaction-related components
│   ├── budgets/                 # Budget-related components
│   ├── categories/              # Category-related components
│   ├── reports/                 # Report-related components
│   └── ai/                      # AI-related components
│
├── lib/                         # Library/Utility code
│   ├── utils/                  # Utility functions
│   ├── api/                    # API utilities
│   │   ├── client/             # Client-side API calls
│   │   └── server/             # Server-side API utilities
│   ├── db/                     # Database utilities
│   │   ├── models/             # Database models/schemas
│   │   └── migrations/         # Database migrations
│   └── ai/                     # AI-related utilities
│       ├── services/           # AI service integrations
│       ├── prompts/            # AI prompt templates
│       └── utils/              # AI utility functions
│
├── hooks/                       # Custom React hooks
├── types/                       # TypeScript type definitions
│   ├── api/                    # API-related types
│   ├── db/                     # Database-related types
│   └── components/             # Component prop types
├── constants/                   # Application constants
├── public/                      # Static assets
├── node_modules/               # Dependencies
├── package.json
├── tsconfig.json
├── next.config.ts
└── README.md
```

## Detailed Folder Descriptions

### `/app` - Next.js App Router
- **`(auth)/`**: Authentication pages (login, register, password reset)
- **`(dashboard)/`**: Main application pages (protected routes)
  - `transactions/`: Transaction management page
  - `budgets/`: Budget planning and management
  - `categories/`: Category management
  - `reports/`: Financial reports and analytics
  - `settings/`: User settings
  - `ai-insights/`: AI-powered insights and recommendations
- **`api/`**: API route handlers for backend operations

### `/components` - React Components
- **`ui/`**: Reusable UI components (buttons, inputs, cards, modals, charts, tables)
- **`layout/`**: Layout components (navigation, header, sidebar, footer)
- Feature-specific component folders for organized code

### `/lib` - Library Code
- **`utils/`**: General utility functions (formatters, validators, helpers)
- **`api/`**: API client and server utilities
- **`db/`**: Database models, schemas, and migrations
- **`ai/`**: AI service integrations, prompts, and utilities

### `/hooks` - Custom React Hooks
- Reusable hooks for data fetching, state management, etc.

### `/types` - TypeScript Types
- Type definitions organized by domain (API, database, components)

### `/constants` - Application Constants
- Configuration values, enums, and constants used throughout the app

## File Naming Conventions

- **Components**: PascalCase (e.g., `TransactionForm.tsx`)
- **Hooks**: camelCase with `use` prefix (e.g., `useTransactions.ts`)
- **Utils**: camelCase (e.g., `formatCurrency.ts`)
- **Types**: PascalCase (e.g., `Transaction.ts`)
- **Constants**: UPPER_SNAKE_CASE (e.g., `API_ENDPOINTS.ts`)

## Next Steps

1. Set up database models in `lib/db/models/`
2. Create API route handlers in `app/api/`
3. Build UI components in `components/ui/`
4. Implement AI services in `lib/ai/services/`
5. Create type definitions in `types/`
6. Add custom hooks in `hooks/`
