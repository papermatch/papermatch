# papermatch

A pay-per-match dating app, using React Native and Supabase.

## Supabase Setup

1. Create a new [Supabase project](https://supabase.com/dashboard/projects) (e.g. papermatch) in your preferred organization (e.g. papermatch)
2. Create a .env.local file in the root directory as follows (with information from the Project Settings/API page)
   ```
   GOOGLE_MAPS_API_KEY=***
   SUPABASE_ANON_KEY=***
   SUPABASE_URL=***
   TEST_USER_ID=***
   ```
3. Create another .env.local file in the supabase/ directory as follows
   ```
   ONESIGNAL_APP_ID=***
   ONESIGNAL_REST_API_KEY=***
   ONESIGNAL_USER_AUTH_KEY=***
   STRIPE_API_KEY=***
   STRIPE_CREDIT_PRICE_ID=***
   STRIPE_WEBHOOK_SIGNING_SECRET=***
   ```
4. Also create a new Encryption Key (e.g. papermatch) on your Project Settings/Vault page, then insert your `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_URL`, and `TEST_USER_ID` as new "secrets"

## Local Development

1. Clone this repository and cd into the directory
   ```
   git clone https://github.com/papermatch/papermatch.git
   cd papermatch
   ```
2. Install dependencies
   ```
   npm install
   ```
3. Start the Supabase containers locally
   ```
   npx supabase start:test -- --clear
   ```
4. Use the output from the previous command to create an .env.test.local file as described [above](#supabase-setup)
5. In the local [Supabase Studio](http://localhost:54323/project/default/sql/1) add the `SUPABASE_SERVICE_ROLE_KEY` and `SUPABASE_URL` secrets to the Vault

   ```sql
   select vault.create_secret(
     'http://supabase_kong_papermatch:8000',
     'SUPABASE_URL'
   );

   select vault.create_secret(
     '***',
     'SUPABASE_SERVICE_ROLE_KEY'
    );

   select vault.create_secret(
     '***',
     'TEST_USER_ID'
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
9. Optionally update database types, e.g.
   ```
   npx supabase gen types typescript --local --schema public > lib/database.ts
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
   npx supabase db push
   ```
5. Deploy your functions
   ```
   npx supabase functions deploy
   ```
6. Set Secrets
   ```
   npx supabase secrets set --env-file supabase/.env.local
   ```

### Stripe Local Setup

1. [Install Stripe CLI](https://stripe.com/docs/stripe-cli#install)
2. Start listening (and note the webhook signing secret for next step)
   ```
   stripe listen --forward-to localhost:54321/functions/v1/stripe-webhook
   ```
3. Update supabase/.env.test.local file with webhook signing secret
   ```
   ...
   STRIPE_WEBHOOK_SIGNING_SECRET=***
   ...
   ```
4. Serve functions
   ```
   npx supabase functions serve --no-verify-jwt --env-file ./supabase/.env.test.local
   ```
5. Trigger payment
   ```
   stripe trigger payment_intent.succeeded
   ```
6. Optionally update cache, e.g.
   ```
   deno cache --reload supabase/functions/stripe-webhook/index.ts
   ```

## Production deployment

1. [Configure Vercel](https://vercel.com/docs/cli)
2. Add Environment Variables (`SUPABASE_ANON_KEY`, `SUPABASE_URL`) to project settings
3. Deploy for production
   ```
   vercel --prod
   ```
4. [Configure Resend](https://resend.com/blog/how-to-configure-supabase-to-send-emails-from-your-domain) as [custom SMTP](https://supabase.com/docs/guides/auth/auth-smtp)

## Expo Application Services

1. Configure EAS build
   ```
   eas build:configure
   eas secret:push --scope project --env-file .env.local
   ``
   ```
2. Build with desired profile
   ```
   eas build --platform android --profile development
   ```
3. Run locally on device or emulator
   ```
   eas build:run -p android --latest
   ```
4. [Configure OneSignal](https://documentation.onesignal.com/docs/react-native-expo-sdk-setup) for notifications
5. [Configure Google Play](https://docs.expo.dev/submit/android/) for submission

## Push Notifications

### Android

Google Android (FCM)

### iOS

Derived from: https://www.andrewhoefling.com/Blog/Post/how-to-develop-ios-without-a-mac

1. `openssl genrsa -out mykey.key 2048`
2. `openssl req -new -sha256 -key mykey.key -out ios_development.csr -subj "/emailAddress=drwahl@gmail.com, CN=Daniel Wahl, C=US"`
3. Upload the .csr file to and download the .cer file from [Apple Developer Certificates](https://developer.apple.com/account/resources/certificates)
4. `openssl x509 -inform DER -outform PEM -in aps.cer -out ios_development.pem`
5. `openssl pkcs12 -inkey mykey.key -in ios_development.pem -export -out ios_development.p12 -name "Daniel Wahl"`
6. Upload to [OneSignal](https://onesignal.com) Apple iOS (APNs) settings

## VSCode Setup

```json
{
  "Prettier-SQL.SQLFlavourOverride": "postgresql",
  "Prettier-SQL.logicalOperatorNewline": "after",
  "Prettier-SQL.keywordCase": "lower",
  "files.insertFinalNewline": true,
  "deno.enablePaths": ["./supabase/functions"]
}
```

## Unit Testing

Add the following (test!) secrets to [GitHub settings](/settings/secrets/actions):

- `ONESIGNAL_APP_ID`
- `ONESIGNAL_REST_API_KEY`
- `ONESIGNAL_USER_AUTH_KEY`
- `STRIPE_API_KEY`
- `STRIPE_CREDIT_PRICE_ID`
- `STRIPE_WEBHOOK_SIGNING_SECRET`

Or use [act](https://github.com/nektos/act) to run locally: `act --secret-file supabase/.env.test.local`
