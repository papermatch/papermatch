import "react-native-url-polyfill/auto";
import { useState, useEffect } from "react";
import { Platform, View } from "react-native";
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
import Constants from "expo-constants";
import Purchases, { LOG_LEVEL } from "react-native-purchases";
import { REVENUECAT_ANDROID_SDK_KEY, REVENUECAT_IOS_SDK_KEY } from "@env";
import { en, registerTranslation } from "react-native-paper-dates";

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
    });

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

    Purchases.setLogLevel(LOG_LEVEL.VERBOSE);
    if (Platform.OS === "android") {
      Purchases.configure({ apiKey: REVENUECAT_ANDROID_SDK_KEY });
    } else if (Platform.OS === "ios") {
      Purchases.configure({ apiKey: REVENUECAT_IOS_SDK_KEY });
    }

    registerTranslation("en-CA", en);
  }, []);

  useEffect(() => {
    if (session?.user.id) {
      OneSignal.login(session.user.id);
      OneSignal.Notifications.requestPermission(true);
    } else {
      OneSignal.logout();
    }

    (async () => {
      const isConfigured = await Purchases.isConfigured();
      if (isConfigured) {
        if (session?.user.id) {
          await Purchases.logIn(session.user.id);
        } else {
          await Purchases.logOut();
        }
      }
    })();
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
