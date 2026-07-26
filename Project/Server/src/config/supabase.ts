import { createClient } from "@supabase/supabase-js";
import { env } from "./env";

// Service-role client — bypasses RLS. Used by every repository for
// privileged table access and by integrations/auth for admin operations
// (createUser, deleteUser, updateUserById, admin.signOut).
export const supabaseAdmin = createClient(env.SUPABASE_URL, env.SUPABASE_SECRET_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

// Publishable-key client — used only for user-context auth flows
// (signInWithPassword, refreshSession, getUser) where the caller's own
// credentials/token should apply, not the service role.
export const supabaseAnon = createClient(env.SUPABASE_URL, env.SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});
