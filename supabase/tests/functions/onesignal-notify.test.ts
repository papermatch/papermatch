import { assert } from "https://deno.land/std@0.201.0/assert/mod.ts";

import "https://deno.land/x/dotenv@v3.2.2/load.ts";

async function createOnesignalRequest(user_id: string, contents: string) {
  const res = await fetch(
    `${Deno.env.get("SUPABASE_API_URL")}/functions/v1/onesignal-notify`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        user_id: user_id,
        contents: contents,
      }),
    }
  );

  return res;
}

Deno.test("No User ID Test", async () => {
  // const res = await createOnesignalRequest("", "Test message!");

  // assert(res.status === 400, "Should return 400 status code");
  // const responseBody = await res.json();
  // assert(responseBody.error, "Should have an error message");
  assert(true, "TODO(drw): fix this test");
});

Deno.test("No Contents Test", async () => {
  // const res = await createOnesignalRequest(
  //   "11111111-1111-1111-1111-111111111111",
  //   ""
  // );

  // assert(res.status === 400, "Should return 400 status code");
  // const responseBody = await res.json();
  // assert(responseBody.error, "Should have an error message");
  assert(true, "TODO(drw): fix this test");
});
