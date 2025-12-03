# TechOdds - Tech Job Prediction Market Platform

A comprehensive Polymarket-style prediction market platform focused on tech job outcomes, hiring trends, and applicant predictions. Built with Next.js 15, Supabase, and modern web technologies.

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [Project Structure](#project-structure)
- [Database Schema](#database-schema)
- [API Documentation](#api-documentation)
- [Architecture](#architecture)
- [Development Guide](#development-guide)
- [Deployment](#deployment)
- [Troubleshooting](#troubleshooting)
- [Contributing](#contributing)
- [License](#license)

## 🎯 Overview

TechOdds is a prediction market platform that allows users to:

- **Bet on tech job market outcomes** - Predict hiring trends, company changes, and industry shifts
- **Create Applicant Futures** - Mint prediction markets about career outcomes
- **Analyze Resume Odds** - Get AI-powered hire probability assessments
- **Track Market Sentiment** - View aggregate optimism and volatility metrics
- **Discover Related Markets** - Find similar markets using embedding-based similarity

The platform uses an Automated Market Maker (AMM) system to provide liquidity and dynamic pricing for all prediction markets.

## ✨ Features

### Phase 1: Core Prediction Markets

- ✅ **Prediction Markets** - Create and trade on tech job market outcomes
- ✅ **AMM Pricing Engine** - Constant-product formula for dynamic pricing
- ✅ **Real-time Price Charts** - Visualize market price history
- ✅ **Market Management** - Admin panel for creating and resolving markets
- ✅ **Trade Execution** - Buy YES/NO positions with instant price updates
- ✅ **User Profiles** - Track balance, trades, and market activity
- ✅ **Category Filtering** - Filter markets by macro, company, applicant, industry

### Phase 2: Extended Features

- ✅ **Applicant Futures** - Mint prediction markets about yourself or others
- ✅ **Resume Odds Engine** - AI-powered resume analysis with hire probability
- ✅ **Embeddings System** - pgvector-powered similarity search
- ✅ **Sentiment Dashboard** - Market-wide analytics and trends
- ✅ **Notifications System** - Real-time alerts for market events
- ✅ **AI Trade Recommendations** - LLM-powered trading strategy suggestions
- ✅ **Enhanced Profiles** - Career odds visualization and portfolio tracking

## 🛠 Tech Stack

### Frontend
- **Next.js 15** - React framework with App Router
- **TypeScript** - Type-safe development
- **TailwindCSS** - Utility-first CSS framework
- **Radix UI** - Accessible component primitives
- **ShadCN UI** - Pre-built component library
- **Recharts** - Data visualization library
- **Zustand** - Lightweight state management

### Backend
- **Next.js API Routes** - Serverless API endpoints
- **Supabase** - Authentication and database hosting
- **PostgreSQL** - Relational database
- **Drizzle ORM** - Type-safe database queries
- **pgvector** - Vector similarity search

### Development Tools
- **Vitest** - Unit testing framework
- **ESLint** - Code linting
- **Prettier** - Code formatting
- **Drizzle Kit** - Database migrations

## 🚀 Getting Started

### Prerequisites

- **Node.js** 20+ and npm
- **PostgreSQL** database (via Supabase recommended)
- **Git** for version control

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd TechOdds
   ```

2. **Install dependencies**
   ```bash
   npm install --legacy-peer-deps
   ```

3. **Set up environment variables**
   
   Copy the example file and edit it:
   ```bash
   cp .env.local.example .env.local
   ```
   
   Edit `.env.local` with your actual Supabase credentials. See `SETUP.md` for detailed step-by-step instructions.
   
   **Required variables:**
   - `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase project URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Your Supabase anon/public key  
   - `DATABASE_URL` - PostgreSQL connection string
   
   **Optional variables:**
   - `SUPABASE_SERVICE_ROLE_KEY` - For admin operations
   
   > **Note**: The app uses centralized environment variable management via `/lib/env.ts`. All env vars are validated on startup.

4. **Set up the database**

   **Option A: Using Drizzle (Recommended)**
   ```bash
   # Generate migrations from schema
   npm run db:generate
   
   # Apply migrations
   npm run db:migrate
   ```

   **Option B: Manual SQL**
   
   Run the SQL files in order:
   ```bash
   # In Supabase SQL Editor or psql
   psql $DATABASE_URL < db/migrations/001_initial_schema.sql
   psql $DATABASE_URL < db/migrations/002_phase2_schema.sql
   ```

5. **Enable pgvector extension**
   
   In Supabase SQL Editor:
   ```sql
   CREATE EXTENSION IF NOT EXISTS vector;
   ```

6. **Run the development server**
   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000) in your browser.

### First Steps

1. **Create a test user** (or integrate Supabase Auth)
   - Navigate to `/admin` to create markets
   - Use the admin panel to create your first market

2. **Explore markets**
   - Browse markets on the home page
   - Click a market to see details and trade

3. **Create an Applicant Future**
   - Go to `/futures/create`
   - Fill in details and mint your first future

4. **Analyze a resume**
   - Visit `/resume`
   - Paste resume text to get hire probability

## 📁 Project Structure

```
TechOdds/
├── app/                          # Next.js App Router
│   ├── api/                      # API routes
│   │   ├── market/              # Market operations
│   │   │   ├── create/          # Create market
│   │   │   ├── buy/              # Execute trade
│   │   │   ├── resolve/          # Resolve market
│   │   │   └── [id]/             # Get market details
│   │   ├── futures/              # Applicant futures
│   │   │   ├── create/           # Create future
│   │   │   └── [id]/             # Get future details
│   │   ├── ai/                   # AI endpoints
│   │   │   ├── resume-analyze/   # Resume analysis
│   │   │   ├── suggest-market/   # Market suggestions
│   │   │   ├── analyze-market/   # Market analysis
│   │   │   └── suggest-trade/    # Trade recommendations
│   │   ├── sentiment/            # Sentiment analytics
│   │   ├── notifications/        # Notification system
│   │   └── user/                 # User endpoints
│   ├── markets/                  # Market pages
│   │   └── [id]/                 # Market detail page
│   ├── futures/                  # Applicant futures pages
│   │   ├── create/               # Create future page
│   │   └── [id]/                 # Future detail page
│   ├── resume/                   # Resume analyzer page
│   ├── sentiment/                # Sentiment dashboard
│   ├── profile/                  # User profile page
│   ├── admin/                    # Admin panel
│   ├── layout.tsx                # Root layout
│   ├── page.tsx                  # Home page
│   └── globals.css               # Global styles
├── components/                   # React components
│   ├── ui/                       # ShadCN UI components
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── dialog.tsx
│   │   └── ...
│   ├── MarketCard.tsx            # Market preview card
│   ├── MarketDetail.tsx          # Market detail view
│   ├── TradeModal.tsx            # Trade execution modal
│   ├── PriceChart.tsx            # Price history chart
│   ├── FutureCard.tsx             # Future preview card
│   ├── NotificationBell.tsx      # Notification dropdown
│   ├── Sidebar.tsx               # Navigation sidebar
│   └── UserSidebar.tsx           # User info sidebar
├── lib/                          # Utility libraries
│   ├── amm.ts                    # AMM pricing engine
│   ├── db.ts                     # Database client
│   ├── supabase.ts               # Supabase client
│   ├── embeddings.ts             # Embedding utilities
│   ├── sentiment.ts              # Sentiment calculations
│   └── utils.ts                  # General utilities
├── db/                           # Database schema
│   ├── schema.ts                 # Drizzle schema definitions
│   └── migrations/               # SQL migration files
│       ├── 001_initial_schema.sql
│       └── 002_phase2_schema.sql
├── stores/                       # Zustand state stores
│   ├── marketStore.ts
│   ├── userStore.ts
│   └── tradeStore.ts
├── package.json                  # Dependencies
├── tsconfig.json                 # TypeScript config
├── tailwind.config.ts            # Tailwind config
├── next.config.ts                # Next.js config
└── README.md                     # This file
```

## 🗄 Database Schema

### Phase 1 Tables

#### Users
Stores user account information.

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `email` | TEXT | Unique email address |
| `username` | TEXT | Unique username |
| `balance` | NUMERIC(10,2) | Account balance (default: 1000.00) |
| `created_at` | TIMESTAMP | Account creation timestamp |

#### Markets
Prediction markets for tech job outcomes.

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `title` | TEXT | Market title |
| `description` | TEXT | Market description |
| `category` | ENUM | Market category (macro, company, applicant, industry) |
| `resolution_date` | TIMESTAMP | When market resolves |
| `status` | ENUM | Market status (open, closed, resolved) |
| `yes_price` | NUMERIC(5,4) | Current YES price (0.0000-1.0000) |
| `no_price` | NUMERIC(5,4) | Current NO price (0.0000-1.0000) |
| `liquidity` | NUMERIC(10,2) | Total liquidity |
| `liquidity_yes` | NUMERIC(10,2) | YES side liquidity |
| `liquidity_no` | NUMERIC(10,2) | NO side liquidity |
| `created_at` | TIMESTAMP | Market creation timestamp |

#### Trades
Individual trade records.

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `user_id` | UUID | Foreign key to users |
| `market_id` | UUID | Foreign key to markets |
| `side` | ENUM | Trade side (yes, no) |
| `amount` | NUMERIC(10,2) | Trade amount |
| `price` | NUMERIC(5,4) | Price at time of trade |
| `created_at` | TIMESTAMP | Trade timestamp |

#### Market Price History
Historical price data for charts.

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `market_id` | UUID | Foreign key to markets |
| `yes_price` | NUMERIC(5,4) | YES price snapshot |
| `no_price` | NUMERIC(5,4) | NO price snapshot |
| `timestamp` | TIMESTAMP | Snapshot timestamp |

### Phase 2 Tables

#### Applicant Futures
User-created prediction markets about career outcomes.

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `user_id` | UUID | Foreign key to users |
| `market_id` | UUID | Foreign key to markets (auto-created) |
| `title` | TEXT | Future title |
| `description` | TEXT | Future description |
| `anon` | BOOLEAN | Anonymous mode flag |
| `target_date` | TIMESTAMP | Target resolution date |
| `metrics` | JSONB | Success criteria (e.g., `{"offer_count": {">=": 1}}`) |
| `created_at` | TIMESTAMP | Creation timestamp |

#### Embeddings
Vector embeddings for similarity search.

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `entity_type` | TEXT | Entity type (market, future, resume_section) |
| `entity_id` | UUID | Foreign key to entity |
| `vector` | VECTOR(1536) | Embedding vector (OpenAI dimension) |
| `created_at` | TIMESTAMP | Creation timestamp |

#### Notifications
User notification records.

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `user_id` | UUID | Foreign key to users |
| `type` | ENUM | Notification type (future_bet, price_spike, resolution_soon, market_resolved, resume_analyzed) |
| `message` | TEXT | Notification message |
| `read` | BOOLEAN | Read status |
| `related_entity_id` | UUID | Optional reference to market/future |
| `created_at` | TIMESTAMP | Creation timestamp |

## 📡 API Documentation

### Markets

#### Create Market
```http
POST /api/market/create
Content-Type: application/json

{
  "title": "Will FAANG increase hiring in Q2 2026?",
  "description": "Prediction market for FAANG hiring trends",
  "category": "macro",
  "resolutionDate": "2026-06-30T00:00:00Z"
}
```

**Response:**
```json
{
  "id": "uuid",
  "title": "...",
  "yesPrice": "0.5000",
  "noPrice": "0.5000",
  ...
}
```

#### Execute Trade
```http
POST /api/market/buy
Content-Type: application/json

{
  "marketId": "uuid",
  "side": "yes",
  "amount": 100.00,
  "userId": "uuid"
}
```

**Response:**
```json
{
  "success": true,
  "trade": {
    "sharesReceived": 95.23,
    "cost": 100.00,
    "newYesPrice": 0.5100,
    "newNoPrice": 0.4900
  }
}
```

#### Get Market Details
```http
GET /api/market/[id]
```

**Response:**
```json
{
  "market": { ... },
  "priceHistory": [ ... ]
}
```

### Applicant Futures

#### Create Future
```http
POST /api/futures/create
Content-Type: application/json

{
  "userId": "uuid",
  "title": "Will I get an offer by Q2 2026?",
  "description": "Personal career outcome prediction",
  "anon": false,
  "targetDate": "2026-06-30T00:00:00Z",
  "metrics": {
    "offer_count": { ">=": 1 }
  }
}
```

**Response:**
```json
{
  "future": { ... },
  "market": { ... }
}
```

#### List Futures
```http
GET /api/futures?filter=active&userId=uuid
```

**Query Parameters:**
- `filter`: `all` | `active` | `anonymous` | `ending_soon`
- `userId`: Filter by user ID

### AI Endpoints

#### Analyze Resume
```http
POST /api/ai/resume-analyze
Content-Type: application/json

{
  "text": "Resume text here..."
}
```

**Response:**
```json
{
  "probability": 0.42,
  "strengths": ["Strong technical skills", ...],
  "risks": ["Limited experience", ...],
  "companyFit": {
    "faang": 0.25,
    "unicorn": 0.35,
    "startup_seed": 0.68
  },
  "recommendations": ["Add metrics", ...]
}
```

#### Get Trade Suggestion
```http
POST /api/ai/suggest-trade
Content-Type: application/json

{
  "marketId": "uuid"
}
```

**Response:**
```json
{
  "strategy": "YES looks underpriced...",
  "confidence": 0.72,
  "recommendedSide": "yes",
  "reasoning": ["Analysis of trends", ...]
}
```

### Sentiment

#### Get Sentiment Metrics
```http
GET /api/sentiment?days=7
```

**Response:**
```json
{
  "overallOptimism": 0.65,
  "volatility": 0.12,
  "categoryMetrics": {
    "macro": { "optimism": 0.70, "volume": 5000, "markets": 10 },
    ...
  },
  "trendingMarkets": [ ... ]
}
```

### Notifications

#### Get Notifications
```http
GET /api/notifications?userId=uuid&unreadOnly=true
```

#### Mark as Read
```http
PATCH /api/notifications
Content-Type: application/json

{
  "notificationId": "uuid",
  "read": true
}
```

## 🏗 Architecture

### AMM Pricing Engine

The platform uses a constant-product Automated Market Maker (AMM) formula:

```
Constant: liquidity_yes × liquidity_no = k
YES Price: liquidity_no / (liquidity_yes + liquidity_no)
NO Price: liquidity_yes / (liquidity_yes + liquidity_no)
```

**Initial State:**
- Initial liquidity: 1000 (500 YES + 500 NO)
- Initial prices: 0.50 YES, 0.50 NO

**Trade Execution:**
1. User buys YES shares with amount `A`
2. YES liquidity increases: `liquidity_yes_new = liquidity_yes + A`
3. Shares received: `shares = liquidity_no - k / liquidity_yes_new`
4. NO liquidity decreases: `liquidity_no_new = liquidity_no - shares`
5. Prices recalculate based on new liquidity pools

### Embeddings System

The embeddings system enables semantic similarity search:

1. **Generation**: Text is converted to 1536-dimensional vectors (OpenAI format)
2. **Storage**: Vectors stored in PostgreSQL using pgvector extension
3. **Query**: Cosine similarity search finds related markets/futures
4. **Use Cases**:
   - Related markets sidebar
   - Similar futures recommendations
   - Semantic search across markets

### Sentiment Calculation

Sentiment metrics are computed from market data:

- **Overall Optimism**: Weighted average of YES prices (weighted by liquidity)
- **Volatility**: Standard deviation of price changes over time
- **Category Metrics**: Aggregated by market category
- **Trending Markets**: Markets with largest recent price movements

## 💻 Development Guide

### Running Tests

```bash
# Run all tests
npm test

# Run tests with UI
npm run test:ui

# Run tests in watch mode
npm test -- --watch
```

### Database Migrations

```bash
# Generate migrations from schema changes
npm run db:generate

# Apply migrations
npm run db:migrate

# Open Drizzle Studio (database GUI)
npm run db:studio
```

### Code Style

The project uses:
- **ESLint** for linting
- **Prettier** for formatting (via ESLint)
- **TypeScript** strict mode

Run linting:
```bash
npm run lint
```

### Adding New Features

1. **Database Changes**
   - Update `db/schema.ts`
   - Generate migration: `npm run db:generate`
   - Review and apply: `npm run db:migrate`

2. **API Routes**
   - Create route in `app/api/[feature]/route.ts`
   - Add TypeScript types
   - Implement error handling

3. **UI Components**
   - Create component in `components/`
   - Use ShadCN UI primitives
   - Follow dark mode styling

4. **State Management**
   - Add Zustand store if needed
   - Keep stores focused and small

## 🚢 Deployment

### Vercel Deployment (Recommended)

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Initial commit"
   git push origin main
   ```

2. **Import to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Import your GitHub repository
   - Add environment variables:
     - `NEXT_PUBLIC_SUPABASE_URL`
     - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
     - `SUPABASE_SERVICE_ROLE_KEY`
     - `DATABASE_URL`

3. **Deploy**
   - Vercel will automatically build and deploy
   - Check build logs for any issues

### Environment Variables

Required for production:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
DATABASE_URL=postgresql://...
```

### Database Setup

1. **Supabase Production**
   - Create production database
   - Run migrations
   - Enable pgvector extension
   - Set up RLS policies

2. **Backup Strategy**
   - Enable Supabase daily backups
   - Export schema regularly
   - Keep migration files versioned

## 🐛 Troubleshooting

### Environment Variables

**Error: Missing required environment variables**
- Ensure `.env.local` exists in the project root
- Check that variable names match exactly (case-sensitive)
- Verify values don't contain quotes or extra spaces
- Restart dev server after changing `.env.local`
- See `SETUP.md` for detailed setup instructions

**Error: DATABASE_URL is not set**
- Ensure `.env.local` exists with all required variables
- Check that `DATABASE_URL` is properly formatted
- Verify Supabase project is active (not paused)
- The app will work without DATABASE_URL during build, but API routes will fail at runtime

### Build Errors

**Error: Module not found**
- Run `npm install --legacy-peer-deps`
- Clear `.next` folder: `rm -rf .next`
- Delete `node_modules` and reinstall: `rm -rf node_modules && npm install --legacy-peer-deps`

**Error: pgvector extension not found**
- Run in Supabase SQL Editor: `CREATE EXTENSION IF NOT EXISTS vector;`

### Runtime Errors

**Database connection errors**
- Verify `DATABASE_URL` format
- Check Supabase project status
- Verify network connectivity

**Auth errors**
- Ensure Supabase keys are correct
- Check RLS policies are enabled
- Verify user permissions

### Performance Issues

**Slow queries**
- Add indexes for frequently queried columns
- Use database connection pooling
- Optimize N+1 queries

**Large bundle size**
- Use dynamic imports for heavy components
- Enable Next.js code splitting
- Optimize images and assets

## 🤝 Contributing

1. **Fork the repository**
2. **Create a feature branch**
   ```bash
   git checkout -b feature/amazing-feature
   ```
3. **Make your changes**
   - Follow code style guidelines
   - Add tests for new features
   - Update documentation
4. **Commit your changes**
   ```bash
   git commit -m "Add amazing feature"
   ```
5. **Push to the branch**
   ```bash
   git push origin feature/amazing-feature
   ```
6. **Open a Pull Request**

### Code Standards

- Use TypeScript for all new code
- Write tests for critical logic
- Document complex functions
- Follow existing code patterns
- Keep components small and focused

## 📝 License

MIT License - see LICENSE file for details

## 🙏 Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- Database powered by [Supabase](https://supabase.com/)
- UI components from [ShadCN UI](https://ui.shadcn.com/)
- Charts by [Recharts](https://recharts.org/)

## 📞 Support

For issues, questions, or contributions:
- Open an issue on GitHub
- Check existing documentation
- Review code comments for implementation details

---

**Built with ❤️ for the tech job market**
