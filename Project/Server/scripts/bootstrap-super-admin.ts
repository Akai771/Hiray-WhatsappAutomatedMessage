// One-off/reusable bootstrap: creates the first (or another) Super Admin.
// There is no signup API by design — this is the only way to create one.
//
// Usage: bun run scripts/bootstrap-super-admin.ts <name> <email> <password>

import { createAuthUser, deleteAuthUser } from "../src/integrations/auth";
import { supabaseAdmin } from "../src/config/supabase";
import { ROLES } from "../src/shared/constants";

const [name, email, password] = process.argv.slice(2);

if (!name || !email || !password) {
  console.error("Usage: bun run scripts/bootstrap-super-admin.ts <name> <email> <password>");
  process.exit(1);
}

const authUser = await createAuthUser(email, password);

const { error } = await supabaseAdmin.from("faculty").insert({
  id: authUser.id,
  name,
  email,
  role: ROLES.SUPER_ADMIN,
  branch_id: null,
});

if (error) {
  console.error("Failed to insert faculty row, rolling back auth user:", error.message);
  await deleteAuthUser(authUser.id);
  process.exit(1);
}

console.log(`Super Admin created: ${email} (id: ${authUser.id})`);
