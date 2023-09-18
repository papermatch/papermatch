import { assert } from "https://deno.land/std@0.201.0/assert/mod.ts";

import "https://deno.land/x/dotenv@v3.2.2/load.ts";

// Using node target for createNodeCryptoProvider(), needed for generateTestHeaderString()
import Stripe from "https://esm.sh/stripe@13.4.0?target=node";

const stripe = new Stripe(Deno.env.get("STRIPE_API_KEY") as string, {
  apiVersion: "2023-08-16",
  httpClient: Stripe.createFetchHttpClient(),
});
const cryptoProvider = Stripe.createNodeCryptoProvider();

async function createStripeRequest(
  payload: Record<string, unknown>,
  secret: string = Deno.env.get("STRIPE_WEBHOOK_SIGNING_SECRET")!
) {
  const payloadString = JSON.stringify(payload, null, 2);

  const header = stripe.webhooks.generateTestHeaderString({
    payload: payloadString,
    secret: secret,
    cryptoProvider: cryptoProvider,
  });

  const res = await fetch(
    `${Deno.env.get("SUPABASE_API_URL")}/functions/v1/stripe-webhook`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Stripe-Signature": header,
      },
      body: payloadString,
    }
  );

  return res;
}

Deno.test("Invalid Secret Test", async () => {
  const payload = {
    id: "evt_invalid_secret",
    object: "event",
    api_version: "2023-08-16",
    created: 1694932837,
    data: {
      object: {
        id: "cs_test_invalid_secret",
        client_reference_id: "11111111-1111-1111-1111-111111111111",
      },
    },
    type: "checkout.session.completed",
  };

  const res = await createStripeRequest(payload, "invalid_secret");

  assert(res.status === 400, "Should return 400 status code");
  const responseBody = await res.json();
  assert(responseBody.error, "Should have an error message");
});

Deno.test("No Client Reference ID Test", async () => {
  const payload = {
    id: "evt_no_client_reference_id",
    object: "event",
    api_version: "2023-08-16",
    created: 1694932837,
    data: {
      object: {
        id: "cs_test_no_client_reference_id",
      },
    },
    type: "checkout.session.completed",
  };

  const res = await createStripeRequest(payload);

  assert(res.status === 200, "Should return 200 status code");
  const responseBody = await res.json();
  assert(responseBody.error, "Should have an error message");
});

Deno.test("Valid Checkout Session ID Test", async () => {
  const payload = {
    id: "evt_valid_checkout_session_id",
    object: "event",
    api_version: "2023-08-16",
    created: 1694932837,
    data: {
      object: {
        // Valid checkout session ID from test purchase for 1 credit
        id: "cs_test_a1PzaJlOR0YOsgSxoj1ovOZxXq8ygylKc89XxZpQwEuqw8ggDWdlnxTgsi",
        client_reference_id: "11111111-1111-1111-1111-111111111111",
      },
    },
    type: "checkout.session.completed",
  };

  const res = await createStripeRequest(payload);

  assert(res.status === 200, "Should return 200 status code");
  const responseBody = await res.json();
  // This will have an error because the user is not in the database
  assert(responseBody.error, "Should have an error message");
});

Deno.test("Invalid Checkout Session ID Test", async () => {
  const payload = {
    id: "evt_invalid_checkout_session_id",
    object: "event",
    api_version: "2023-08-16",
    created: 1694932837,
    data: {
      object: {
        id: "cs_test_invalid_checkout_session_id",
        client_reference_id: "11111111-1111-1111-1111-111111111111",
      },
    },
    type: "checkout.session.completed",
  };

  const res = await createStripeRequest(payload);

  assert(res.status === 200, "Should return 200 status code");
  const responseBody = await res.json();
  assert(responseBody.error, "Should have an error message");
});

Deno.test("Unhandled Event Type Test", async () => {
  const payload = {
    id: "evt_unhandled_event_type",
    object: "event",
    api_version: "2023-08-16",
    created: 1694932837,
    data: {
      object: {
        id: "cs_test_unhandled_event_type",
        client_reference_id: "11111111-1111-1111-1111-111111111111",
      },
    },
    type: "unhandled.event.type",
  };

  const res = await createStripeRequest(payload);

  assert(res.status === 200, "Should return 200 status code");
  const responseBody = await res.json();
  assert(responseBody.error, "Should have an error message");
});
