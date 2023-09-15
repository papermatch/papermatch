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
    "Access-Control-Allow-Headers": "Content-Type",
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
    // Get client reference id, credit quantity, and app origin from request body
    const { id, quantity, origin } = await req.json();
    if (!id) {
      return new Response(JSON.stringify({ error: "No id provided" }), {
        status: 400,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    console.log(
      `🔔 Creating checkout session for ${id} with quantity ${quantity} and origin ${origin}`
    );

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      expand: ["line_items"],
      client_reference_id: id,
      billing_address_collection: "auto",
      line_items: [
        {
          price: Deno.env.get("STRIPE_PRICE_ID") as string,
          quantity: parseInt(quantity) || 1,
        },
      ],
      mode: "payment",
      success_url: `${origin}/checkout/success`,
      cancel_url: `${origin}/checkout/cancel`,
      automatic_tax: { enabled: true },
    });
    sessionUrl = session.url;
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 400,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }

  console.log(`🔔 Checkout session created: ${sessionUrl}`);

  return new Response(JSON.stringify({ url: sessionUrl }), {
    status: 200,
    headers: { "Content-Type": "application/json", ...corsHeaders },
  });
});
