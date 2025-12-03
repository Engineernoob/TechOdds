# TechOdds Setup Guide

## Quick Start

### 1. Install Dependencies

```bash
npm install --legacy-peer-deps
```

### 2. Configure Environment Variables

Create a `.env.local` file in the root directory:

```bash
cp .env.local.example .env.local
```

### 3. Get Supabase Credentials

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Wait for the project to finish setting up
3. Go to **Project Settings** → **API**
4. Copy the following values:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role** key → `SUPABASE_SERVICE_ROLE_KEY` (keep this secret!)

### 4. Get Database Connection String

1. In Supabase dashboard, go to **Project Settings** → **Database**
2. Under **Connection string**, select **URI**
3. Copy the connection string → `DATABASE_URL`
4. Replace `[YOUR-PASSWORD]` with your database password

Example format:

```
postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres
```

### 5. Update `.env.local`

Edit `.env.local` and paste your values:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
DATABASE_URL=postgresql://postgres:yourpassword@db.xxxxx.supabase.co:5432/postgres
```

### 6. Set Up Database

**Option A: Using SQL (Recommended)**

1. Go to Supabase SQL Editor
2. Run the migrations in order:
   ```sql
   -- Run 001_initial_schema.sql
   -- Run 002_phase2_schema.sql
   -- Run 003_phase3_schema.sql
   ```

**Option B: Using Drizzle**

```bash
# Generate migrations from schema
npm run db:generate

# Apply migrations
npm run db:migrate
```

### 7. Enable pgvector Extension

In Supabase SQL Editor:

```sql
CREATE EXTENSION IF NOT EXISTS vector;
```

### 8. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Environment Variables Reference

### Required Variables

| Variable                        | Description                  | Where to Find                            |
| ------------------------------- | ---------------------------- | ---------------------------------------- |
| `NEXT_PUBLIC_SUPABASE_URL`      | Supabase project URL         | Supabase Dashboard → Settings → API      |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Public anon key              | Supabase Dashboard → Settings → API      |
| `DATABASE_URL`                  | PostgreSQL connection string | Supabase Dashboard → Settings → Database |

### Optional Variables

| Variable                    | Description      | When Needed                  |
| --------------------------- | ---------------- | ---------------------------- |
| `SUPABASE_SERVICE_ROLE_KEY` | Service role key | Admin operations, RLS bypass |
| `RESEND_API_KEY`            | Resend API key   | Email notifications (future) |
| `OPENAI_API_KEY`            | OpenAI API key   | LLM features (future)        |

## Troubleshooting

### "Missing required environment variables" Error

- Ensure `.env.local` exists in the project root
- Check that variable names match exactly (case-sensitive)
- Restart the dev server after changing `.env.local`

### Database Connection Errors

- Verify `DATABASE_URL` format is correct
- Check that your database password is correct
- Ensure Supabase project is active (not paused)
- Check network connectivity

### Build Errors Related to Environment Variables

- Environment variables are loaded at build time
- Ensure `.env.local` is properly formatted (no quotes around values)
- Check for typos in variable names

## Verification

After setup, verify everything works:

1. **Database Connection**: Check that migrations ran successfully
2. **Supabase Auth**: Try accessing auth endpoints (if implemented)
3. **API Routes**: Test creating a market via `/api/market/create`
4. **Pages**: Navigate through the app to ensure pages load

## Security Notes

- ⚠️ **Never commit `.env.local`** - It's in `.gitignore`
- ⚠️ **Keep `SUPABASE_SERVICE_ROLE_KEY` secret** - It bypasses RLS
- ⚠️ **Use different keys for development and production**
- ⚠️ **Rotate keys if they're exposed**

## Production Deployment

For production (Vercel, etc.):

1. Add environment variables in your hosting platform's dashboard
2. Use the same variable names as `.env.local`
3. Never commit production keys to the repository
4. Use environment-specific values (different Supabase project for prod)
