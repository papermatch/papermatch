import { assert } from "https://deno.land/std@0.201.0/assert/mod.ts";

import "https://deno.land/x/dotenv@v3.2.2/load.ts";

const testOptionsPreflight = async () => {
  const res = await fetch(
    `${Deno.env.get("SUPABASE_API_URL")}/functions/v1/stripe-checkout`,
    { method: "OPTIONS" }
  );

  assert(res.status === 204, "Should return 204 status code");
};

const testCheckoutUrl = async () => {
  const res = await fetch(
    `${Deno.env.get("SUPABASE_API_URL")}/functions/v1/stripe-checkout`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: "11111111-1111-1111-1111-111111111111",
        quantity: 1,
        origin: "http://localhost",
      }),
    }
  );

  assert(res.status === 200, "Should return 200 status code");

  const responseBody = await res.json();
  assert(responseBody.url, "Response body should have a 'url' property");
  assert(new URL(responseBody.url), "The 'url' property should be a valid URL");
};

Deno.test("Options Preflight Test", testOptionsPreflight);
Deno.test("Test Checkout URL", testCheckoutUrl);
