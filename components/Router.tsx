import { Platform } from "react-native";
import { Session } from "@supabase/supabase-js";
import About from "./About";
import Account from "./Account";
import Auth from "./Auth";
import Blocked from "./Blocked";
import Credits from "./Credits";
import Edit from "./Edit";
import Home from "./Home";
import Match from "./Match";
import Matches from "./Matches";
import Otp from "./Otp";
import Preferences from "./Preferences";
import Privacy from "./Privacy";
import Profile from "./Profile";
import Profiles from "./Profiles";
import Report from "./Report";
import {
  ROUTES,
  Router as RNRouter,
  Routes,
  Route,
  Navigate,
  BackHandler,
} from "../lib/routing";

export default function Router({ session }: { session: Session | null }) {
  return (
    <RNRouter>
      {Platform.OS !== "web" && <BackHandler />}
      <Routes>
        {Platform.OS === "web" ? (
          <Route path={ROUTES.ROOT} element={<Home />} />
        ) : (
          <Route
            path={ROUTES.ROOT}
            element={
              session?.user ? (
                <Navigate to={`../${ROUTES.PROFILES}`} replace />
              ) : (
                <Navigate to={`../${ROUTES.AUTH}`} replace />
              )
            }
          />
        )}
        <Route path={ROUTES.ABOUT} element={<About />} />
        <Route
          path={ROUTES.ACCOUNT}
          element={
            session?.user ? (
              <Account key={session.user.id} session={session} />
            ) : (
              <Navigate to={`../${ROUTES.AUTH}`} replace />
            )
          }
        />
        <Route
          path={ROUTES.APP}
          element={
            session?.user ? (
              <Navigate to={`../${ROUTES.PROFILES}`} replace />
            ) : (
              <Navigate to={`../${ROUTES.AUTH}`} replace />
            )
          }
        />
        <Route
          path={ROUTES.AUTH}
          element={
            session?.user ? (
              <Navigate to={`../${ROUTES.PROFILES}`} replace />
            ) : (
              <Auth />
            )
          }
        />
        <Route
          path={ROUTES.BLOCKED}
          element={
            session?.user ? (
              <Blocked key={session.user.id} session={session} />
            ) : (
              <Navigate to={`../${ROUTES.AUTH}`} replace />
            )
          }
        />
        <Route
          path={ROUTES.CREDITS}
          element={
            session?.user ? (
              <Credits key={session.user.id} session={session} />
            ) : (
              <Navigate to={`../${ROUTES.AUTH}`} replace />
            )
          }
        />
        <Route
          path={`${ROUTES.CREDITS}/:result`}
          element={
            session?.user ? (
              <Credits key={session.user.id} session={session} />
            ) : (
              <Navigate to={`../${ROUTES.AUTH}`} replace />
            )
          }
        />
        <Route
          path={ROUTES.EDIT}
          element={
            session?.user ? (
              <Edit key={session.user.id} session={session} />
            ) : (
              <Navigate to={`../${ROUTES.AUTH}`} replace />
            )
          }
        />
        <Route
          path={`${ROUTES.MATCH}/:id`}
          element={
            session?.user ? (
              <Match key={session.user.id} session={session} />
            ) : (
              <Navigate to={`../${ROUTES.AUTH}`} replace />
            )
          }
        />
        <Route
          path={ROUTES.MATCHES}
          element={
            session?.user ? (
              <Matches key={session.user.id} session={session} />
            ) : (
              <Navigate to={`../${ROUTES.AUTH}`} replace />
            )
          }
        />
        <Route
          path={ROUTES.OTP}
          element={
            session?.user ? (
              <Otp key={session.user.id} session={session} />
            ) : (
              <Otp />
            )
          }
        />
        <Route
          path={ROUTES.PREFERENCES}
          element={
            session?.user ? (
              <Preferences key={session.user.id} session={session} />
            ) : (
              <Navigate to={`../${ROUTES.AUTH}`} replace />
            )
          }
        />
        <Route path={ROUTES.PRIVACY} element={<Privacy />} />
        <Route
          path={`${ROUTES.PROFILE}/:id`}
          element={
            session?.user ? (
              <Profile key={session.user.id} session={session} />
            ) : (
              <Navigate to={`../${ROUTES.AUTH}`} replace />
            )
          }
        />
        <Route
          path={ROUTES.PROFILES}
          element={
            session?.user ? (
              <Profiles key={session.user.id} session={session} />
            ) : (
              <Navigate to={`../${ROUTES.AUTH}`} replace />
            )
          }
        />
        <Route
          path={`${ROUTES.REPORT}/:id`}
          element={
            session?.user ? (
              <Report key={session.user.id} session={session} />
            ) : (
              <Navigate to={`../${ROUTES.AUTH}`} replace />
            )
          }
        />
      </Routes>
    </RNRouter>
  );
}
