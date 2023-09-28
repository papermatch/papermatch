import "react-native-url-polyfill/auto";
import { useState, useEffect } from "react";
import { supabase } from "./lib/supabase";
import Auth from "./components/Auth";
import Account from "./components/Account";
import Checkout from "./components/Checkout";
import Match from "./components/Match";
import Matches from "./components/Matches";
import Otp from "./components/Otp";
import Profile from "./components/Profile";
import Profiles from "./components/Profiles";
import { Session } from "@supabase/supabase-js";
import { Routes } from "react-router-dom";
import { ROUTES, Router, Route, Navigate } from "./lib/routing";
import { useFonts, Caveat_400Regular } from "@expo-google-fonts/caveat";
import { PaperProvider } from 'react-native-paper';

export default function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  let [fontsLoaded, fontError] = useFonts({ Caveat_400Regular });

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      session && setSession(session);
      setLoading(false);
    });

    supabase.auth.onAuthStateChange((event, session) => {
      switch (event) {
        case "SIGNED_IN":
          setSession((prevSession) => {
            if (!prevSession) {
              return session;
            } else {
              return prevSession;
            }
          });
          break;
        default:
          setSession(session);
          break;
      }
    });
  }, []);

  if (loading || (!fontsLoaded && !fontError)) {
    return null;
  }

  return (
    <PaperProvider>
      <Router>
        <Routes>
          <Route
            path={ROUTES.ROOT}
            element={
              session?.user ? (
                <Navigate to={ROUTES.ACCOUNT} replace />
              ) : (
                <Navigate to={ROUTES.AUTH} replace />
              )
            }
          />
          <Route
            path={ROUTES.ACCOUNT}
            element={
              session?.user ? (
                <Account key={session.user.id} session={session} />
              ) : (
                <Navigate to={ROUTES.AUTH} replace />
              )
            }
          />
          <Route
            path={ROUTES.AUTH}
            element={
              session?.user ? (
                <Navigate to={ROUTES.ACCOUNT} replace />
              ) : (
                <Auth />
              )
            }
          />
          <Route
            path={ROUTES.CHECKOUT}
            element={
              session?.user ? (
                <Checkout key={session.user.id} session={session} />
              ) : (
                <Navigate to={ROUTES.AUTH} replace />
              )
            }
          />
          <Route
            path={`${ROUTES.CHECKOUT}/:result`}
            element={
              session?.user ? (
                <Navigate to={ROUTES.ACCOUNT} replace />
              ) : (
                <Navigate to={ROUTES.AUTH} replace />
              )
            }
          />
          <Route
            path={`${ROUTES.MATCH}/:id`}
            element={
              session?.user ? (
                <Match key={session.user.id} session={session} />
              ) : (
                <Navigate to={ROUTES.AUTH} replace />
              )
            }
          />
          <Route
            path={ROUTES.MATCHES}
            element={
              session?.user ? (
                <Matches key={session.user.id} session={session} />
              ) : (
                <Navigate to={ROUTES.AUTH} replace />
              )
            }
          />
          <Route
            path={ROUTES.OTP}
            element={
              session?.user ? <Navigate to={ROUTES.ACCOUNT} replace /> : <Otp />
            }
          />
          <Route
            path={`${ROUTES.PROFILE}/:id`}
            element={
              session?.user ? (
                <Profile key={session.user.id} session={session} />
              ) : (
                <Navigate to={ROUTES.AUTH} replace />
              )
            }
          />
          <Route
            path={ROUTES.PROFILES}
            element={
              session?.user ? (
                <Profiles key={session.user.id} session={session} />
              ) : (
                <Navigate to={ROUTES.AUTH} replace />
              )
            }
          />
        </Routes>
      </Router>
    </PaperProvider>
  );
}
