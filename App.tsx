import "react-native-url-polyfill/auto";
import { useState, useEffect } from "react";
import { View, Platform } from "react-native";
import { ActivityIndicator, PaperProvider } from "react-native-paper";
import { supabase } from "./lib/supabase";
import About from "./components/About";
import Account from "./components/Account";
import Auth from "./components/Auth";
import Blocked from "./components/Blocked";
import Credits from "./components/Credits";
import Edit from "./components/Edit";
import Home from "./components/Home";
import Match from "./components/Match";
import Matches from "./components/Matches";
import Otp from "./components/Otp";
import Preferences from "./components/Preferences";
import Privacy from "./components/Privacy";
import Profile from "./components/Profile";
import Profiles from "./components/Profiles";
import Report from "./components/Report";
import { Session } from "@supabase/supabase-js";
import { Routes } from "react-router-dom";
import { ROUTES, Router, Route, Navigate, BackHandler } from "./lib/routing";
import {
  useFonts,
  EduNSWACTFoundation_400Regular,
  EduNSWACTFoundation_500Medium,
} from "@expo-google-fonts/edu-nsw-act-foundation";
import { StatusBar } from "expo-status-bar";
import { useStyles } from "./lib/styles";
import theme from "./lib/theme";
import { LogLevel, OneSignal } from "react-native-onesignal";
import Constants from "expo-constants";
import * as Device from "expo-device";

export default function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [fontsLoaded, fontError] = useFonts({
    EduNSWACTFoundation_400Regular,
    EduNSWACTFoundation_500Medium,
  });
  const styles = useStyles();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    supabase.auth.onAuthStateChange((event, session) => {
      switch (event) {
        case "SIGNED_IN":
          setSession((prevSession) => {
            // Don't update if the user hasn't changed
            if (prevSession?.user.id === session?.user.id) {
              return prevSession;
            }
            return session;
          });
          break;
        default:
          setSession(session);
          break;
      }

      if (Platform.OS !== "web" && Device.isDevice) {
        OneSignal.Debug.setLogLevel(LogLevel.Verbose);
        OneSignal.initialize(Constants.expoConfig?.extra?.oneSignalAppId);
        // TODO(drw): use OneSignal.Notifications.addEventListener to handle notifications when app in focus
        // OneSignal.Notifications.addEventListener(
        //   "foregroundWillDisplay",
        //   (event) => {
        //     event.preventDefault();
        //     event.getNotification().display();
        //   }
        // );
      }
    });
  }, []);

  useEffect(() => {
    if (Platform.OS !== "web" && Device.isDevice) {
      if (session?.user.id) {
        OneSignal.login(session.user.id);
        OneSignal.Notifications.requestPermission(true);
      } else {
        OneSignal.logout();
      }
    }
  }, [session?.user.id]);

  if (loading || (!fontsLoaded && !fontError)) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator animating={true} size="large" />
      </View>
    );
  }

  return (
    <PaperProvider theme={theme}>
      <View style={styles.appView}>
        <StatusBar style="auto" />
        <Router>
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
              path={`${ROUTES.PROFILE}/:id/:index?`}
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
        </Router>
      </View>
    </PaperProvider>
  );
}
