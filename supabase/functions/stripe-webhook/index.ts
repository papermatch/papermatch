// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

import { serve } from "https://deno.land/std@0.201.0/http/server.ts";

import Stripe from "https://esm.sh/stripe@13.4.0?target=deno";

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.33.2";

const stripe = new Stripe(Deno.env.get("STRIPE_API_KEY") as string, {
  // This is needed to use the Fetch API rather than relying on the Node http
  // package.
  apiVersion: "2023-08-16",
  httpClient: Stripe.createFetchHttpClient(),
});

const supabaseUrl = Deno.env.get("SUPABASE_URL") as string;
const supabaseServiceRoleKey = Deno.env.get(
  "SUPABASE_SERVICE_ROLE_KEY"
) as string;
const supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
    detectSessionInUrl: false,
  },
});

console.log("Hello from Stripe Webhook!");

serve(async (req) => {
  const signature = req.headers.get("Stripe-Signature");

  // First step is to verify the event. The .text() method must be used as the
  // verification relies on the raw request body rather than the parsed JSON.
  const body = await req.text();
  let receivedEvent;
  try {
    receivedEvent = await stripe.webhooks.constructEventAsync(
      body,
      signature!,
      Deno.env.get("STRIPE_WEBHOOK_SIGNING_SECRET")!,
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
            status: 400,
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
          status: 400,
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

        if (error) throw error;
        console.log("Credit inserted successfully");
      } catch (err) {
        console.error("Error inserting credit:", err);
      }

      break;
    }
    default:
      console.warn(`🔔 Unhandled event type: ${receivedEvent.type}`);
      break;
  }

  return new Response(JSON.stringify({ ok: true }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
});

// To invoke:
// curl -i --location --request POST 'http://localhost:54321/functions/v1/' \
//   --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0' \
//   --header 'Content-Type: application/json' \
//   --data '{"name":"Functions"}'
