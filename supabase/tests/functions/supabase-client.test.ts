import { assert } from "https://deno.land/std@0.201.0/assert/mod.ts";

import {
  createClient,
  SupabaseClient,
} from "https://esm.sh/@supabase/supabase-js@2.33.2";

import "https://deno.land/x/dotenv@v3.2.2/load.ts";

const supabaseUrl = Deno.env.get("SUPABASE_API_URL") ?? "";
const supabaseKey = Deno.env.get("SUPABASE_ANON_KEY") ?? "";
const supabaseClientOptions = {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
    detectSessionInUrl: false,
  },
};

const testClientCreation = async () => {
  assert(supabaseUrl, "Supabase URL is not provided");
  assert(supabaseKey, "Supabase key is not provided");

  const supabase: SupabaseClient = createClient(
    supabaseUrl,
    supabaseKey,
    supabaseClientOptions
  );

  const { error } = await supabase.from("profiles").select("*").limit(1);
  assert(!error, "Error should not be returned from the query");
};

Deno.test("Client Creation Test", testClientCreation);
