import { assert } from "https://deno.land/std@0.201.0/assert/mod.ts";

import "https://deno.land/x/dotenv@v3.2.2/load.ts";

const testOptionsPreflight = async () => {
  const res = await fetch(
    `${Deno.env.get("SUPABASE_API_URL")}/functions/v1/stripe-checkout`,
    { method: "OPTIONS" }
  );
  console.log(res);
  assert(res.status === 204, "Should return 204 status code");
};

Deno.test("Options Preflight Test", testOptionsPreflight);
