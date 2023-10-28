import { serve } from "https://deno.land/std@0.201.0/http/server.ts";

import Stripe from "https://esm.sh/stripe@13.4.0?target=deno";

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.33.2";

const supabaseUrl = Deno.env.get("SUPABASE_URL") as string;
const supabaseServiceRoleKey = Deno.env.get(
  "SUPABASE_SERVICE_ROLE_KEY"
) as string;
const supabaseClientOptions = {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
    detectSessionInUrl: false,
  },
};
const supabase = createClient(
  supabaseUrl,
  supabaseServiceRoleKey,
  supabaseClientOptions
);

const stripe = new Stripe(Deno.env.get("STRIPE_API_KEY") as string, {
  apiVersion: "2023-08-16",
  httpClient: Stripe.createFetchHttpClient(),
});

console.log("Hello from Stripe Webhook!");

serve(async (req) => {
  const signature = req.headers.get("Stripe-Signature");

  const body = await req.text();
  let receivedEvent;
  try {
    receivedEvent = await stripe.webhooks.constructEventAsync(
      body,
      signature,
      Deno.env.get("STRIPE_WEBHOOK_SIGNING_SECRET"),
      undefined
    );
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  // Handle the event
  switch (receivedEvent.type) {
    case "checkout.session.completed": {
      const sessionID = receivedEvent.data.object.id;
      const clientReferenceID = receivedEvent.data.object.client_reference_id;
      if (!clientReferenceID) {
        return new Response(
          JSON.stringify({ error: "No client reference ID" }),
          {
            status: 200,
            headers: { "Content-Type": "application/json" },
          }
        );
      }

      let quantity;
      try {
        const session = await stripe.checkout.sessions.retrieve(sessionID, {
          expand: ["line_items"],
        });
        quantity = parseInt(session.line_items.data[0].quantity) || 0;
      } catch (err) {
        return new Response(JSON.stringify({ error: err.message }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        });
      }

      // Insert a new credit row into the Supabase database
      try {
        const { error } = await supabase.from("credits").insert([
          {
            user_id: clientReferenceID,
            creditor: "stripe",
            creditor_id: sessionID,
            credits: quantity,
          },
        ]);

        if (error) {
          throw error;
        }
      } catch (err) {
        return new Response(JSON.stringify({ error: err.message }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        });
      }
      break;
    }
    default:
      return new Response(
        JSON.stringify({
          error: `Unhandled event type: ${receivedEvent.type}`,
        }),
        {
          status: 200,
          headers: { "Content-Type": "application/json" },
        }
      );
  }

  return new Response(JSON.stringify({ received: true }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
});
