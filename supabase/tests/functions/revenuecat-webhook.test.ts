import { assert } from "https://deno.land/std@0.201.0/assert/mod.ts";
import "https://deno.land/x/dotenv@v3.2.2/load.ts";

async function createRevenueCatRequest(payload: Record<string, unknown>) {
  const payloadString = JSON.stringify(payload);

  const res = await fetch(
    `${Deno.env.get("SUPABASE_API_URL")}/functions/v1/revenuecat-webhook`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: payloadString,
    }
  );

  return res;
}

Deno.test("Valid Non-Renewing Purchase Test", async () => {
  const payload = {
    event: {
      transaction_id: "123456789012345",
      app_user_id: "11111111-1111-1111-1111-111111111111",
      product_id: "ch.papermat.papermatch.credit",
      type: "NON_RENEWING_PURCHASE",
    },
  };

  const res = await createRevenueCatRequest(payload);

  assert(res.status === 200, "Should return 200 status code");
  const responseBody = await res.json();
  // This will have an error because the user is not in the database
  assert(responseBody.error, "Should have an error message");
});

Deno.test("No App User ID Test", async () => {
  const payload = {
    event: {
      transaction_id: "123456789012345",
      product_id: "ch.papermat.papermatch.credit",
      type: "INITIAL_PURCHASE",
    },
  };

  const res = await createRevenueCatRequest(payload);

  assert(res.status === 200, "Should return 200 status code");
  const responseBody = await res.json();
  assert(responseBody.error, "Should have an error message");
});

Deno.test("Unknown Product ID Test", async () => {
  const payload = {
    event: {
      transaction_id: "123456789012345",
      app_user_id: "11111111-1111-1111-1111-111111111111",
      product_id: "unknown_product_id",
      type: "NON_RENEWING_PURCHASE",
    },
  };

  const res = await createRevenueCatRequest(payload);

  assert(res.status === 200, "Should return 200 status code");
  const responseBody = await res.json();
  assert(responseBody.error, "Should have an error message");
});

Deno.test("Unhandled Event Type Test", async () => {
  const payload = {
    event: {
      transaction_id: "123456789012345",
      app_user_id: "11111111-1111-1111-1111-111111111111",
      product_id: "ch.papermat.papermatch.credit",
      type: "unhandled.event.type",
    },
  };

  const res = await createRevenueCatRequest(payload);

  assert(res.status === 200, "Should return 200 status code");
  const responseBody = await res.json();
  assert(responseBody.error, "Should have an error message");
});
