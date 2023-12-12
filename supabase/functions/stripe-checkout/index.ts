import { serve } from "https://deno.land/std@0.201.0/http/server.ts";

import Stripe from "https://esm.sh/stripe@13.4.0?target=deno";

const stripe = new Stripe(Deno.env.get("STRIPE_API_KEY") as string, {
  apiVersion: "2023-08-16",
  httpClient: Stripe.createFetchHttpClient(),
});

console.log("Hello from Stripe Checkout!");

serve(async (req) => {
  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers":
      "authorization, x-client-info, apikey, content-type",
  };

  // Handling OPTIONS preflight request
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: corsHeaders,
    });
  }

  let sessionUrl;
  try {
    // Get client reference ID, credit quantity, and app origin from request body
    const { id, quantity, origin } = await req.json();

    // Check for valid ID
    if (!id) {
      return new Response(JSON.stringify({ error: "Missing parameter: id" }), {
        status: 400,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    // Check for valid quantity
    if (!quantity) {
      return new Response(
        JSON.stringify({ error: "Missing parameter: quantity" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    if (!Number.isInteger(quantity) || quantity <= 0) {
      return new Response(
        JSON.stringify({
          error: "Invalid parameter: quantity must be a positive integer",
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Check for valid origin
    if (!origin) {
      return new Response(
        JSON.stringify({ error: "Missing parameter: origin" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    try {
      new URL(origin);
    } catch {
      return new Response(
        JSON.stringify({
          error: "Invalid parameter: origin must be a valid URL",
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      expand: ["line_items"],
      client_reference_id: id,
      billing_address_collection: "auto",
      line_items: [
        {
          price: Deno.env.get("STRIPE_CREDIT_PRICE_ID") as string,
          quantity: quantity,
        },
      ],
      mode: "payment",
      success_url: `${origin}/credits/success`,
      cancel_url: `${origin}/credits/cancel`,
      automatic_tax: { enabled: true },
    });
    sessionUrl = session.url;
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 400,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }

  return new Response(JSON.stringify({ ok: true, url: sessionUrl }), {
    status: 200,
    headers: { "Content-Type": "application/json", ...corsHeaders },
  });
});
