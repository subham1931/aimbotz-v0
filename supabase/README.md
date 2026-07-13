# AimBotz Supabase Auth setup
#
# 1. Run the migration SQL in Supabase Dashboard → SQL Editor:
#    supabase/migrations/20260713100000_aimbotz_profiles.sql
#
# 2. Deploy the auth-profile edge function:
#    npx supabase login
#    npx supabase link --project-ref dmepkkfobaxlyjcgoswy
#    npx supabase functions deploy auth-profile
#
# 3. Authentication → URL Configuration:
#    Site URL: http://localhost:3000
#    Redirect URLs: http://localhost:3000/auth/callback
#
# 4. Enable OAuth providers (Google / Discord) under Authentication → Providers.
#    Google redirect URI from Supabase provider settings must be added in Google Cloud Console.
