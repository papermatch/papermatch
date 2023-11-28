import "react-native-url-polyfill/auto";
import { useState, useEffect } from "react";
import { View } from "react-native";
import { ActivityIndicator, PaperProvider } from "react-native-paper";
import { supabase } from "./lib/supabase";
import { Session } from "@supabase/supabase-js";
import Router from "./components/Router";
import {
  useFonts,
  EduNSWACTFoundation_400Regular,
  EduNSWACTFoundation_500Medium,
} from "@expo-google-fonts/edu-nsw-act-foundation";
import { StatusBar } from "expo-status-bar";
import { useStyles } from "./lib/styles";
import theme from "./lib/theme";
import { LogLevel, OneSignal } from "react-native-onesignal";
import Constants, { ExecutionEnvironment } from "expo-constants";

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

      if (Constants.executionEnvironment === ExecutionEnvironment.Standalone) {
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
    if (Constants.executionEnvironment === ExecutionEnvironment.Standalone) {
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
        <Router session={session} />
      </View>
    </PaperProvider>
  );
}
