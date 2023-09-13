// deno-test.ts

// Import required libraries and modules
import {
  assert,
  assertEquals,
} from "https://deno.land/std@0.201.0/testing/asserts.ts";
import {
  createClient,
  SupabaseClient,
} from "https://esm.sh/@supabase/supabase-js@2.33.2";

import "https://deno.land/x/dotenv@v3.2.2/load.ts";

// Set up the configuration for the Supabase client
const supabaseUrl = Deno.env.get("SUPABASE_API_URL") ?? "";
const supabaseKey = Deno.env.get("SUPABASE_ANON_KEY") ?? "";
const options = {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
    detectSessionInUrl: false,
  },
};

// Test the creation and functionality of the Supabase client
const testClientCreation = async () => {
  const client: SupabaseClient = createClient(
    supabaseUrl,
    supabaseKey,
    options
  );

  // Verify if the Supabase URL and key are provided
  if (!supabaseUrl) throw new Error("supabaseUrl is required.");
  if (!supabaseKey) throw new Error("supabaseKey is required.");

  // Test a simple query to the database
  const { data: table_data, error: table_error } = await client
    .from("profiles")
    .select("*")
    .limit(1);
  if (table_error) {
    throw new Error("Invalid Supabase client: " + table_error.message);
  }
  assert(table_data, "Data should be returned from the query.");
};

// Test the 'get_active_profiles' function
const testGetActiveProfiles = async () => {
  const client: SupabaseClient = createClient(
    supabaseUrl,
    supabaseKey,
    options
  );

  // Invoke the 'get_active_profiles' function
  const { data: func_data, error: func_error } = await client.rpc(
    "get_active_profiles"
  );

  // Check for errors from the function invocation
  if (func_error) {
    throw new Error("Invalid response: " + func_error.message);
  }

  // Log the response from the function
  console.log(JSON.stringify(func_data, null, 2));

  // Assert that the function returned the expected result
  assertEquals(func_data.length, 4, "The function should return 4 rows.");
};

// Register and run the tests
Deno.test("Client Creation Test", testClientCreation);
Deno.test("Get Active Profiles Function Test", testGetActiveProfiles);
