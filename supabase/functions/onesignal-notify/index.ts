import { serve } from "https://deno.land/std@0.201.0/http/server.ts";

import * as OneSignal from "https://esm.sh/@onesignal/node-onesignal@1.0.0-beta7";

const onesignalAppId = Deno.env.get("ONESIGNAL_APP_ID")!;
const onesignalUserAuthKey = Deno.env.get("ONESIGNAL_USER_AUTH_KEY")!;
const onesignalRestApiKey = Deno.env.get("ONESIGNAL_REST_API_KEY")!;
const configuration = OneSignal.createConfiguration({
  userKey: onesignalUserAuthKey,
  appKey: onesignalRestApiKey,
});

const onesignal = new OneSignal.DefaultApi(configuration);

console.log("Hello from OneSignal Notify!");

Deno.serve(async (req) => {
  try {
    const { user_id, contents } = await req.json();

    // Check for valid user_id
    if (!user_id) {
      return new Response(
        JSON.stringify({ error: "Missing parameter: user_id" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Check for valid contents
    if (!contents) {
      return new Response(
        JSON.stringify({ error: "Missing parameter: contents" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const notification = new OneSignal.Notification();
    notification.app_id = onesignalAppId;
    notification.include_external_user_ids = [user_id];
    notification.contents = {
      en: contents,
    };
    const res = await onesignal.createNotification(notification);

    return new Response(JSON.stringify({ onesignalResponse: res }), {
      headers: { "Content-Type": "application/json" },
      status: 200,
    });
  } catch (err) {
    console.error("Failed to create OneSignal notification", err);
    return new Response("Server error.", {
      headers: { "Content-Type": "application/json" },
      status: 400,
    });
  }
});
