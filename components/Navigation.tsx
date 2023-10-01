import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { Session } from "@supabase/supabase-js";
import { Alert, View } from "react-native";
import { Appbar, Badge } from "react-native-paper";
import { ROUTES, useNavigate, useLocation } from "../lib/routing";
import styles from "../lib/styles";

export default function Navigation({ session }: { session: Session }) {
  const [active, setActive] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (session) {
      getActive();
    }
  }, [session]);

  async function getActive() {
    try {
      let { data, error } = await supabase
        .from("active")
        .select("*")
        .eq("id", session.user.id)
        .maybeSingle();

      if (error) {
        throw error;
      }

      setActive(!!data);
    } catch (error) {
      if (error instanceof Error) {
        Alert.alert(error.message);
      }
    }
  }

  return (
    <Appbar style={styles.bottom}>
      <Appbar.Action
        icon={
          location.pathname === ROUTES.PROFILES
            ? "magnify-plus"
            : "magnify-plus-outline"
        }
        size={30}
        onPress={() => {
          navigate(ROUTES.PROFILES);
        }}
        animated={false}
      />
      <Appbar.Action
        icon={location.pathname === ROUTES.MATCHES ? "chat" : "chat-outline"}
        size={30}
        onPress={() => {
          navigate(ROUTES.MATCHES);
        }}
        animated={false}
      />
      <View>
        <Badge
          visible={!active}
          size={10}
          style={{ position: "absolute", top: 10, right: 10 }}
        />
        <Appbar.Action
          icon={location.pathname === ROUTES.CHECKOUT ? "cart" : "cart-outline"}
          size={30}
          onPress={() => {
            navigate(ROUTES.CHECKOUT);
          }}
          animated={false}
        />
      </View>
      <Appbar.Action
        icon={
          location.pathname === ROUTES.ACCOUNT ? "account" : "account-outline"
        }
        size={30}
        onPress={() => {
          navigate(ROUTES.ACCOUNT);
        }}
        animated={false}
      />
    </Appbar>
  );
}
