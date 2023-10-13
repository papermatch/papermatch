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
  Divider,
  Portal,
  Snackbar,
} from "react-native-paper";
import { Session } from "@supabase/supabase-js";
import Avatar from "./Avatar";
import Navigation from "./Navigation";
import { ROUTES, useNavigate } from "../lib/routing";
import { ProfileData } from "../lib/types";
import styles from "../lib/styles";
import { Attributes } from "./Attributes";

type ProfilesData = {
  profile: ProfileData;
  distance: number | null;
  score: number | null;
};

export default function Profiles({ session }: { session: Session }) {
  const [loading, setLoading] = useState(true);
  const [appbarMenuVisible, setAppbarMenuVisible] = useState(false);
  const [data, setData] = useState<ProfilesData[]>([]);
  const [showAll, setShowAll] = useState(false);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    if (session) {
      getProfiles();
    }
  }, [session]);

  useEffect(() => {
    getProfiles();
  }, [showAll]);

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

  async function getProfiles() {
    try {
      setLoading(true);

      const { data, error } = await supabase
        .rpc("search_active_profiles")
        .select("*");

      if (error) {
        throw error;
      }

      const interactions = await getInteractions();

      if (data) {
        if (showAll) {
          // Show all profiles (that are not blocked)
          setData(
            data.filter((item) => interactions[item.profile.id] !== "block")
          );
        } else {
          // Show only profiles without an interaction (or none)
          setData(
            data.filter(
              (item) =>
                !interactions[item.profile.id] ||
                interactions[item.profile.id] === "none"
            )
          );
        }
      } else {
        setData([]);
      }
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
          <Checkbox.Item
            style={styles.verticallySpaced}
            label="Show all profiles"
            status={showAll ? "checked" : "unchecked"}
            onPress={() => setShowAll(!showAll)}
          />
          <Divider style={styles.verticallySpaced} />
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
