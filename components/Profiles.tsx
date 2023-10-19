import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { View, FlatList } from "react-native";
import {
  Card,
  Text,
  Appbar,
  ActivityIndicator,
  Menu,
  Checkbox,
  Portal,
  Modal,
  Snackbar,
  useTheme,
} from "react-native-paper";
import { Session } from "@supabase/supabase-js";
import Avatar from "./Avatar";
import Navigation from "./Navigation";
import { ROUTES, useNavigate } from "../lib/routing";
import { ProfilesData } from "../lib/types";
import { useStyles } from "../lib/styles";
import { Attributes } from "./Attributes";

const MAX_USER_SCORE = 10;

export default function Profiles({ session }: { session: Session }) {
  const [loading, setLoading] = useState(true);
  const [appbarMenuVisible, setAppbarMenuVisible] = useState(false);
  const [data, setData] = useState<ProfilesData[]>([]);
  const [settingsVisible, setHideSettings] = useState(false);
  const [hideInteractions, setHideInteractions] = useState(true);
  const [hidePreferences, setHidePreferences] = useState(true);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const navigate = useNavigate();
  const styles = useStyles();
  const theme = useTheme();

  useEffect(() => {
    if (session) {
      getData();
    }
  }, [session, hideInteractions, hidePreferences]);

  async function getInteractions(): Promise<{ [key: string]: string }> {
    try {
      const { data, error, status } = await supabase
        .from("interactions")
        .select("*")
        .eq("user_id", session?.user.id);

      if (error && status !== 406) {
        throw error;
      }

      return (
        data?.reduce((acc, interaction) => {
          acc[interaction.target_id] = interaction.interaction;
          return acc;
        }, {}) || {}
      );
    } catch (error) {
      if (error instanceof Error) {
        console.log(error.message);
        setSnackbarMessage("Unable to get interactions");
        setSnackbarVisible(true);
      }
    }
    return {};
  }

  async function getData() {
    try {
      setLoading(true);

      const { data, error } = await supabase
        .rpc("search_active_profiles")
        .select("*");

      if (error) {
        throw error;
      }

      let nextData = data || [];

      const interactions = await getInteractions();

      if (hideInteractions) {
        // Show only profiles without an interaction (or none)
        nextData = nextData.filter(
          (item) =>
            !interactions[item.profile.id] ||
            interactions[item.profile.id] === "none"
        );
      } else {
        // Show all profiles (that are not blocked)
        nextData = nextData.filter(
          (item) => interactions[item.profile.id] !== "block"
        );
      }

      if (hidePreferences) {
        // Show only profiles with a perfect score (or no score if no preferences)
        nextData = nextData.filter(
          (item) =>
            !item.score ||
            Math.abs(item.score - MAX_USER_SCORE) < Number.EPSILON
        );
      }

      setData(nextData);
    } catch (error) {
      if (error instanceof Error) {
        console.log(error.message);
        setSnackbarMessage("Unable to get profiles");
        setSnackbarVisible(true);
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={{ flex: 1 }}>
      <Appbar.Header mode="center-aligned">
        <Appbar.Content titleStyle={styles.appbarTitle} title="Profiles" />
        <Menu
          visible={appbarMenuVisible}
          onDismiss={() => setAppbarMenuVisible(false)}
          anchor={
            <Appbar.Action
              icon="dots-vertical"
              onPress={() => setAppbarMenuVisible(!appbarMenuVisible)}
            />
          }
        >
          <Menu.Item
            onPress={() => {
              setAppbarMenuVisible(false);
              setHideSettings(!settingsVisible);
            }}
            title="Settings"
          />
          <Menu.Item
            onPress={() => {
              navigate(ROUTES.PREFERENCES);
            }}
            title="Preferences"
          />
        </Menu>
      </Appbar.Header>
      {loading ? (
        <View
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
          <ActivityIndicator animating={true} size="large" />
        </View>
      ) : (
        <View style={styles.container}>
          {data.length ? (
            <FlatList
              data={data}
              keyExtractor={(item) => item.profile.id.toString()}
              renderItem={({ item }) => (
                <Card
                  onPress={() => {
                    navigate(`${ROUTES.PROFILE}/${item.profile.id}`);
                  }}
                  style={[styles.verticallySpaced]}
                >
                  <View
                    style={[
                      {
                        flexDirection: "row",
                        padding: 16,
                      },
                    ]}
                  >
                    <View style={{ alignSelf: "center" }}>
                      <Avatar
                        size={100}
                        url={item.profile.avatar_urls[0] || null}
                        onPress={() => {
                          navigate(`${ROUTES.PROFILE}/${item.profile.id}`);
                        }}
                      />
                    </View>
                    <View
                      style={{
                        flex: 1,
                        flexDirection: "column",
                        marginLeft: 16,
                      }}
                    >
                      <Text variant="titleLarge">{item.profile.username}</Text>
                      <Attributes
                        style={{
                          flexDirection: "row",
                          flexWrap: "wrap",
                        }}
                        profile={item.profile}
                        distance={item.distance}
                        loading={loading}
                      />
                    </View>
                    <View
                      style={{
                        position: "absolute",
                        top: 0,
                        bottom: 0,
                        left: 0,
                        right: 0,
                      }}
                      pointerEvents="box-only"
                    />
                  </View>
                </Card>
              )}
            />
          ) : (
            <Text style={styles.verticallySpaced}>
              No compatible profiles found, try adjusting your preferences.
            </Text>
          )}
        </View>
      )}
      <Portal>
        <Modal
          contentContainerStyle={styles.modal}
          visible={settingsVisible}
          onDismiss={() => setHideSettings(false)}
        >
          <View style={styles.verticallySpaced}>
            <Text variant="titleLarge">Settings</Text>
            <Checkbox.Item
              labelStyle={{ color: theme.colors.onTertiaryContainer }}
              label="Hide profiles you've already liked/passed"
              status={hideInteractions ? "checked" : "unchecked"}
              onPress={() => setHideInteractions(!hideInteractions)}
            />
            <Checkbox.Item
              labelStyle={{ color: theme.colors.onTertiaryContainer }}
              label="Hide profiles that don't meet all of your preferences"
              status={hidePreferences ? "checked" : "unchecked"}
              onPress={() => setHidePreferences(!hidePreferences)}
            />
          </View>
        </Modal>
      </Portal>
      <Portal>
        <Snackbar
          style={[styles.snackbar, styles.aboveNav]}
          visible={snackbarVisible}
          onDismiss={() => setSnackbarVisible(false)}
          action={{
            label: "Dismiss",
            onPress: () => setSnackbarVisible(false),
          }}
        >
          {snackbarMessage}
        </Snackbar>
      </Portal>
      <Navigation key={session.user.id} session={session} />
    </View>
  );
}
