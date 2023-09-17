# papermatch

A pay-per-match dating app, using React Native and Supabase.

## Supabase Setup

1. Create a new [Supabase project](https://supabase.com/dashboard/projects) (e.g. papermatch) in your preferred organization (e.g. papermatch)
2. Create a .env file in the root directory as follows (with information from the Project Settings/API page)
    ```
    SUPABASE_ANON_KEY=***
    SUPABASE_API_URL=***
    ```
    Note: `SUPABASE_API_URL` should be set to 'http://localhost:54321' for local development
4. Create another .env file in the supabase/ directory as follow
    ```
    STRIPE_API_KEY=***
    STRIPE_PRICE_ID=***
    STRIPE_WEBHOOK_SIGNING_SECRET=***
    TWILIO_AUTH_TOKEN=***
    ```
5. Also create a new Encryption Key (e.g. papermatch) on your Project Settings/Vault page, then insert your `SUPABASE_SERVICE_ROLE_KEY` and `SUPABASE_API_URL` as new "secrets"

## Local Development

1. Clone this repository and cd into the directory
    ```
    git clone https://github.com/papermatch/papermatch.git
    cd papermatch
    ```
3. Install dependencies
    ```
    npm install
    ```
3. Start the Supabase containers locally
    ```
    set -a && . supabase/.env && set +a
    npx supabase start
    ```
4. Use the output from the previous command to update your .env files as described [above](#supabase-setup)
5. In the local [Supabase Studio](http://localhost:54323/project/default/sql/1) add the `SUPABASE_SERVICE_ROLE_KEY` and `SUPABASE_API_URL` secrets to the Vault
    ```sql
    select vault.create_secret(
      'http://supabase_kong_papermatch:8000',
      'SUPABASE_API_URL'
    );

    select vault.create_secret(
      '',
      'SUPABASE_SERVICE_ROLE_KEY'
     );
    ```
6. Run the React Native app
    ```
    npm run web
    ```
7. To update locally with changes (note: you'll need to re-add secrets to the Vault)
    ```
    npx supabase db reset
    ```
8. To stop the Supabase containers locally
    ```
    npx supabase stop
    ```

### Push Local Changes

1. Create an [Access Token](https://supabase.com/dashboard/account/tokens) (e.g. papermatch)
2. Login using the Supabase CLI with Access Token from previous step
    ```
    npx supabase login
    ```
3. Link your project (where `<project_id>` is the unique character string in your `SUPABASE_API_URL`)
    ```
    npx supabase link --project-ref <project-id>
    ```
4. Push your local changes to the remote project
   ```
   npx supabase push
   ```

### Stripe Local Setup

1. [Install Stripe CLI](https://stripe.com/docs/stripe-cli#install)
2. Start listening (and note the webhook signing secret for next step)
    ```
    stripe listen --forward-to localhost:54321/functions/v1/stripe-webhook
    ```
3. Serve functions
    ```
    npx supabase functions serve --no-verify-jwt --env-file ./supabase/.env
    ```
4. Trigger payment
    ```
    stripe trigger payment_intent.succeeded
    ```
5. Optionally update cache, e.g.
    ```
    deno cache --reload supabase/functions/stripe-webhook/index.ts
    ```

## VSCode Setup

```json
{
    "Prettier-SQL.SQLFlavourOverride": "postgresql",
    "Prettier-SQL.logicalOperatorNewline": "after",
    "Prettier-SQL.keywordCase": "lower",
    "files.insertFinalNewline": true,
    "deno.enablePaths": [
        "./supabase/functions"
    ]
}
```
## Unit Testing

Add the following (test!) secrets to [GitHub settings](/settings/secrets/actions):

- `STRIPE_API_KEY`
- `STRIPE_PRICE_ID`
- `SUPABASE_AUTH_SMS_TWILIO_AUTH_TOKEN`
