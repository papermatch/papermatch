import "react-native-url-polyfill/auto";
import { useState, useEffect } from "react";
import { supabase } from "./lib/supabase";
import Auth from "./components/Auth";
import Account from "./components/Account";
import Otp from "./components/Otp";
import { Session } from "@supabase/supabase-js";
import { Routes } from "react-router-dom";
import { ROUTES, Router, Route, Navigate } from "./lib/routing";

export default function App() {
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      session && setSession(session);
    });

    supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });
  }, []);

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
      </Routes>
    </Router>
  );
}
