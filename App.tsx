import "react-native-url-polyfill/auto";
import { useState, useEffect } from "react";
import { supabase } from "./lib/supabase";
import Auth from "./components/Auth";
import Account from "./components/Account";
import Otp from "./components/Otp";
import Profile from "./components/Profile";
import Profiles from "./components/Profiles";
import { Session } from "@supabase/supabase-js";
import { Routes } from "react-router-dom";
import { ROUTES, Router, Route, Navigate } from "./lib/routing";

export default function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      session && setSession(session);
      setLoading(false);
    });

    supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });
  }, []);

  if (loading) {
    return null;
  }

  return (
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
            session?.user ? <Navigate to={ROUTES.ACCOUNT} replace /> : <Auth />
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
  );
}
