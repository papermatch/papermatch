import { assert } from "https://deno.land/std@0.201.0/assert/mod.ts";

import "https://deno.land/x/dotenv@v3.2.2/load.ts";

Deno.test("Options Preflight Test", async () => {
  const res = await fetch(
    `${Deno.env.get("SUPABASE_API_URL")}/functions/v1/stripe-checkout`,
    { method: "OPTIONS" }
  );

  assert(res.status === 204, "Should return 204 status code");
  assert(
    res.headers.has("Access-Control-Allow-Origin"),
    "Should have CORS header"
  );
});

Deno.test("Checkout URL Test", async () => {
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
});

Deno.test("Missing ID Test", async () => {
  const res = await fetch(
    `${Deno.env.get("SUPABASE_API_URL")}/functions/v1/stripe-checkout`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        quantity: 1,
        origin: "http://localhost",
      }),
    }
  );

  assert(res.status === 400, "Should return 400 status code");
  const responseBody = await res.json();
  assert(responseBody.error, "Should have an error message");
});

Deno.test("Missing Quantity Test", async () => {
  const res = await fetch(
    `${Deno.env.get("SUPABASE_API_URL")}/functions/v1/stripe-checkout`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: "11111111-1111-1111-1111-111111111111",
        origin: "http://localhost",
      }),
    }
  );

  assert(res.status === 400, "Should return 400 status code");
  const responseBody = await res.json();
  assert(responseBody.error, "Should have an error message");
});

Deno.test("String Quantity Test", async () => {
  const res = await fetch(
    `${Deno.env.get("SUPABASE_API_URL")}/functions/v1/stripe-checkout`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: "11111111-1111-1111-1111-111111111111",
        quantity: "1",
        origin: "http://localhost",
      }),
    }
  );

  assert(res.status === 400, "Should return 400 status code");
  const responseBody = await res.json();
  assert(responseBody.error, "Should have an error message");
});

Deno.test("Negative Quantity Test", async () => {
  const res = await fetch(
    `${Deno.env.get("SUPABASE_API_URL")}/functions/v1/stripe-checkout`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: "11111111-1111-1111-1111-111111111111",
        quantity: -1,
        origin: "http://localhost",
      }),
    }
  );

  assert(res.status === 400, "Should return 400 status code");
  const responseBody = await res.json();
  assert(responseBody.error, "Should have an error message");
});

Deno.test("Invalid Origin Test", async () => {
  const res = await fetch(
    `${Deno.env.get("SUPABASE_API_URL")}/functions/v1/stripe-checkout`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: "11111111-1111-1111-1111-111111111111",
        quantity: 1,
        origin: "invalid-url",
      }),
    }
  );

  assert(res.status === 400, "Should return 400 status code");
  const responseBody = await res.json();
  assert(responseBody.error, "Should have an error message");
});
