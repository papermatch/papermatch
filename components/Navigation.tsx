import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { Session } from "@supabase/supabase-js";
import { View } from "react-native";
import { Appbar, Badge } from "react-native-paper";
import { ROUTES, useNavigate, useLocation } from "../lib/routing";
import { useStyles } from "../lib/styles";

export default function Navigation({ session }: { session: Session }) {
  const [active, setActive] = useState(false);
  const [unread, setUnread] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();
  const styles = useStyles();

  useEffect(() => {
    if (session) {
      getData();
    }
  }, [session]);

  async function getData() {
    setLoading(true);
    await Promise.all([getActive(), getUnread()]);
    setLoading(false);
  }

  async function getActive() {
    try {
      setLoading(true);
      const { data, error } = await supabase
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
        console.log(error.message);
      }
    } finally {
      setLoading(false);
    }
  }

  async function getUnread() {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("messages")
        .select("*")
        .neq("user_id", session.user.id)
        .eq("is_read", false);

      if (error) {
        throw error;
      }

      setUnread(!!data?.length || false);
    } catch (error) {
      if (error instanceof Error) {
        console.log(error.message);
      }
    } finally {
      setLoading(false);
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
      <View>
        <Badge
          visible={!loading && unread}
          size={10}
          style={{ position: "absolute", top: 10, right: 10 }}
        />
        <Appbar.Action
          icon={location.pathname === ROUTES.MATCHES ? "chat" : "chat-outline"}
          size={30}
          onPress={() => {
            navigate(ROUTES.MATCHES);
          }}
          animated={false}
        />
      </View>
      <View>
        <Badge
          visible={!loading && !active}
          size={10}
          style={{ position: "absolute", top: 10, right: 10 }}
        />
        <Appbar.Action
          icon={
            location.pathname === ROUTES.CREDITS
              ? "credit-card-plus"
              : "credit-card-plus-outline"
          }
          size={30}
          onPress={() => {
            navigate(ROUTES.CREDITS);
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
