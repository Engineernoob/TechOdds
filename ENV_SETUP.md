# Environment Variables Setup

## Overview

TechOdds uses centralized environment variable management through `/lib/env.ts` for better organization and validation.

## Files Updated for Environment Variable Support

### 1. `/lib/env.ts` (NEW)
- Centralized environment variable access
- Validation on import
- Type-safe configuration objects
- Helpful error messages

### 2. `/lib/supabase.ts` (UPDATED)
- Now uses `supabaseConfig` from `/lib/env.ts`
- Properly loads from `.env.local`
- Better error messages

### 3. `/lib/db.ts` (UPDATED)
- Uses `databaseConfig` from `/lib/env.ts`
- Graceful handling during build-time
- Clear error messages when database is not configured

### 4. `/drizzle.config.ts` (UPDATED)
- Uses centralized env config
- Validates DATABASE_URL before use

### 5. `.env.local.example` (UPDATED)
- Complete template with all variables
- Clear comments and examples
- Optional variables documented

## Required Environment Variables

### Supabase Configuration
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Database Connection
```env
DATABASE_URL=postgresql://postgres:password@db.project-ref.supabase.co:5432/postgres
```

## Optional Environment Variables

```env
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
RESEND_API_KEY=re_xxxxxxxxxxxxx  # For email notifications
OPENAI_API_KEY=sk-xxxxxxxxxxxxx  # For LLM features
```

## How It Works

1. **Centralized Access**: All env vars accessed through `/lib/env.ts`
2. **Validation**: Required vars validated on import (non-blocking in production)
3. **Type Safety**: TypeScript ensures correct usage
4. **Error Messages**: Clear errors if variables are missing

## Usage in Code

### Before (scattered):
```typescript
const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
```

### After (centralized):
```typescript
import { supabaseConfig } from "@/lib/env";

const url = supabaseConfig.url;
const key = supabaseConfig.anonKey;
```

## Build-Time Behavior

- Database connection gracefully handles missing/invalid DATABASE_URL during build
- Supabase config validates but doesn't block builds
- Runtime errors provide clear guidance on what's missing

## Troubleshooting

### "Missing required environment variables"
1. Check `.env.local` exists in project root
2. Verify variable names match exactly (case-sensitive)
3. Ensure no quotes around values
4. Restart dev server after changes

### Database connection errors
- Verify DATABASE_URL format is correct
- Check Supabase project is active
- Ensure password is correct in connection string

### Build succeeds but runtime fails
- Check that `.env.local` has actual values (not placeholders)
- Verify Supabase project is not paused
- Check network connectivity

## Security Notes

- ⚠️ `.env.local` is in `.gitignore` - never commit it
- ⚠️ Use different projects for dev/prod
- ⚠️ Rotate keys if exposed
- ⚠️ Keep `SUPABASE_SERVICE_ROLE_KEY` secret

