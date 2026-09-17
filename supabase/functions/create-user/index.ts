// Supabase Edge Function: create-user
// Deployed at: supabase/functions/create-user/index.ts
//
// Uses the SERVICE_ROLE key (server-side only) to create a confirmed Auth user
// and insert the matching profiles row — no email verification email is sent.
//
// Security:
//   1. Reads the caller's JWT from the Authorization header.
//   2. Verifies the caller's profile.role = 'superadmin' OR 'admin'
//      (admins can create staff; superadmins can create admin or staff).
//   3. Enforces role allowlist: only 'admin' and 'staff' can be created.
//   4. Rolls back the Auth user if profile insertion fails.

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // ── 1. Parse request body ──────────────────────────────────────────────
    const { username, email, password, role } = await req.json();

    // ── 2. Validate role allowlist (NEVER allow superadmin from frontend) ──
    if (!['admin', 'staff'].includes(role)) {
      return new Response(
        JSON.stringify({ error: 'Invalid role. Only "admin" or "staff" are permitted.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!username || !email || !password) {
      return new Response(
        JSON.stringify({ error: 'username, email, and password are required.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // ── 3. Build an ANON client to verify the CALLER'S identity ───────────
    //    We use the caller's JWT (from Authorization header) to look up their profile.
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Missing Authorization header.' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

    // Caller client — uses the user's own JWT to identify them
    const callerClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    // Get the authenticated caller
    const { data: { user: callerUser }, error: callerErr } = await callerClient.auth.getUser();
    if (callerErr || !callerUser) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized. Could not verify caller identity.' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // ── 4. Verify caller's role in profiles table ──────────────────────────
    const { data: callerProfile, error: profileCheckErr } = await callerClient
      .from('profiles')
      .select('role')
      .eq('id', callerUser.id)
      .single();

    if (profileCheckErr || !callerProfile) {
      return new Response(
        JSON.stringify({ error: 'Could not verify caller profile.' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const callerRole = callerProfile.role;

    // Role-based permission check:
    //   superadmin → can create 'admin' or 'staff'
    //   admin      → can only create 'staff'
    if (callerRole === 'admin' && role !== 'staff') {
      return new Response(
        JSON.stringify({ error: 'Admins can only create staff accounts.' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!['superadmin', 'admin'].includes(callerRole)) {
      return new Response(
        JSON.stringify({ error: 'Forbidden. Only superadmin or admin can create accounts.' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // ── 5. Use SERVICE ROLE client to create the Auth user ─────────────────
    //    email_confirm: true → no verification email sent, account is immediately usable.
    const adminClient = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    const { data: newUserData, error: createErr } = await adminClient.auth.admin.createUser({
      email,
      password,
      email_confirm: true,          // ← Key: skip email verification
      user_metadata: { username, role },
    });

    if (createErr || !newUserData?.user) {
      return new Response(
        JSON.stringify({ error: createErr?.message || 'Failed to create Auth user.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const newUserId = newUserData.user.id;

    // ── 6. Create the matching profiles row ────────────────────────────────
    const { error: insertProfileErr } = await adminClient
      .from('profiles')
      .insert({
        id: newUserId,
        username,
        email,
        role,
        is_active: true,
        created_by: callerUser.id,
      });

    if (insertProfileErr) {
      // ── 7. Rollback: delete the Auth user so we don't leave an orphan ────
      await adminClient.auth.admin.deleteUser(newUserId);
      return new Response(
        JSON.stringify({ error: `Profile creation failed: ${insertProfileErr.message}. Auth user has been rolled back.` }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // ── 8. Success — return the new user's profile info ────────────────────
    return new Response(
      JSON.stringify({
        user: {
          id: newUserId,
          username,
          email,
          role,
          is_active: true,
          created_by: callerUser.id,
        },
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (err) {
    return new Response(
      JSON.stringify({ error: err.message || 'Unexpected server error.' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
