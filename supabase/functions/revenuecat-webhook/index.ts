import { serve } from "https://deno.land/std@0.201.0/http/server.ts";

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

console.log("Hello from RevenueCat Webhook!");

serve(async (req) => {
  // Ensure that the request is a POST request
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  // TODO(drw): Add authentication?
  const body = await req.json();

  // Handle the event
  const event = body.event;
  switch (event.type) {
    case "NON_RENEWING_PURCHASE": {
      const transactionID = event.transaction_id;
      const appUserID = event.app_user_id;
      if (!appUserID) {
        return new Response(JSON.stringify({ error: "No app user ID" }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        });
      }

      const productID = event.product_id;
      let quantity;
      // TODO(drw): Add support for other products, make into env vars?
      switch (productID) {
        case "ch.papermat.papermatch.credit":
          quantity = 1;
          break;
        case "ch.papermat.papermatch.sixpack":
          quantity = 6;
          break;
        default:
          return new Response(JSON.stringify({ error: "Unknown product ID" }), {
            status: 200,
            headers: { "Content-Type": "application/json" },
          });
      }

      // Insert a new credit row into the Supabase database
      try {
        const { error } = await supabase.from("credits").insert([
          {
            user_id: appUserID,
            creditor: "revenuecat",
            creditor_id: transactionID,
            credits: quantity,
          },
        ]);

        if (error) {
          throw Error(error.message);
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
          error: `Unhandled event type: ${event}`,
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
