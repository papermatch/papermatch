import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { Session } from "@supabase/supabase-js";
import { View } from "react-native";
import { Appbar, Badge, useTheme } from "react-native-paper";
import { ROUTES, useNavigate, useLocation } from "../lib/routing";
import { useStyles } from "../lib/styles";
import { MatchesData } from "../lib/types";

export default function Navigation({ session }: { session: Session }) {
  const [active, setActive] = useState(true);
  const [newOrUnread, setNewOrUnread] = useState(false);
  const [onboarding, setOnboarding] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();
  const styles = useStyles();
  const theme = useTheme();

  useEffect(() => {
    if (session) {
      getData();
    }
  }, [session]);

  async function getData() {
    setLoading(true);
    await Promise.all([getActive(), getNewOrUnread(), getOnboarding()]);
    setLoading(false);
  }

  async function getActive() {
    try {
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
        console.error(error.message);
      }
    }
  }

  async function getNewOrUnread() {
    try {
      const { data, error } = await supabase.rpc("get_matches_data");

      if (error) {
        throw error;
      }

      setNewOrUnread(
        data?.filter(
          (item: MatchesData) => item.message === null || item.unread
        ).length > 0 || false
      );
    } catch (error) {
      if (error instanceof Error) {
        console.error(error.message);
      }
    }
  }

  async function getOnboarding() {
    try {
      const { data: profilesData, error: profilesError } = await supabase
        .from("profiles")
        .select("updated_at,avatar_urls")
        .eq("id", session.user.id)
        .single();

      if (profilesError) {
        throw profilesError;
      }

      const { data: preferencesData, error: preferencesError } = await supabase
        .from("preferences")
        .select("updated_at")
        .eq("id", session.user.id)
        .single();

      if (preferencesError) {
        throw preferencesError;
      }

      setOnboarding(
        !profilesData.updated_at ||
          profilesData.avatar_urls.length === 0 ||
          !preferencesData.updated_at
      );
    } catch (error) {
      if (error instanceof Error) {
        console.error(error.message);
      }
    }
  }

  return (
    <View
      style={{
        paddingHorizontal: 12,
        backgroundColor: theme.colors.surface,
      }}
    >
      <Appbar style={styles.bottom}>
        <Appbar.Action
          icon={
            location.pathname === `/${ROUTES.PROFILES}`
              ? "magnify-plus"
              : "magnify-plus-outline"
          }
          size={30}
          onPress={() => {
            navigate(`../${ROUTES.PROFILES}`);
          }}
          animated={false}
        />
        <View>
          <Badge
            visible={!loading && newOrUnread}
            size={10}
            style={{ position: "absolute", top: 10, right: 10 }}
          />
          <Appbar.Action
            icon={
              location.pathname === `/${ROUTES.MATCHES}`
                ? "chat"
                : "chat-outline"
            }
            size={30}
            onPress={() => {
              navigate(`../${ROUTES.MATCHES}`);
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
              location.pathname === `/${ROUTES.CREDITS}`
                ? "credit-card-plus"
                : "credit-card-plus-outline"
            }
            size={30}
            onPress={() => {
              navigate(`../${ROUTES.CREDITS}`);
            }}
            animated={false}
          />
        </View>
        <View>
          <Badge
            visible={!loading && onboarding}
            size={10}
            style={{ position: "absolute", top: 10, right: 10 }}
          />
          <Appbar.Action
            icon={
              location.pathname === `/${ROUTES.ACCOUNT}`
                ? "account"
                : "account-outline"
            }
            size={30}
            onPress={() => {
              navigate(`../${ROUTES.ACCOUNT}`);
            }}
            animated={false}
          />
        </View>
      </Appbar>
    </View>
  );
}
