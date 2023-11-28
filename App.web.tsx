import "react-native-url-polyfill/auto";
import { useState, useEffect } from "react";
import { View } from "react-native";
import { ActivityIndicator, PaperProvider } from "react-native-paper";
import { supabase } from "./lib/supabase";
import Router from "./components/Router";
import { Session } from "@supabase/supabase-js";
import {
  useFonts,
  EduNSWACTFoundation_400Regular,
  EduNSWACTFoundation_500Medium,
} from "@expo-google-fonts/edu-nsw-act-foundation";
import { useStyles } from "./lib/styles";
import theme from "./lib/theme";

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
  }, []);

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
        <Router session={session} />
      </View>
    </PaperProvider>
  );
}
