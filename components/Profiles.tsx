import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { View, FlatList, Pressable } from "react-native";
import {
  Card,
  Text,
  ActivityIndicator,
  Checkbox,
  Portal,
  Modal,
  Snackbar,
  useTheme,
  Badge,
} from "react-native-paper";
import { Image } from "expo-image";
import { Session } from "@supabase/supabase-js";
import { Avatar } from "./Avatar";
import { Navigation } from "./Navigation";
import { ROUTES, useNavigate } from "../lib/routing";
import { ProfilesData } from "../lib/types";
import { useStyles } from "../lib/styles";
import { Appbar } from "./Appbar";
import { calculateAge } from "../lib/utils";
import { Storage } from "../lib/storage";
import { interpolateColor } from "react-native-reanimated";

const PROFILES_PER_PAGE = 6;

export default function Profiles({ session }: { session: Session }) {
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [profiles, setProfiles] = useState<ProfilesData[]>([]);
  const [triggerCount, setTriggerCount] = useState(0);
  const [initComplete, setInitComplete] = useState(false);
  const [settingsVisible, setHideSettings] = useState(false);
  const [hideInteractions, setHideInteractions] = useState(true);
  const [hidePreferences, setHidePreferences] = useState(false);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const navigate = useNavigate();
  const styles = useStyles();
  const theme = useTheme();

  useEffect(() => {
    if (session) {
      getSettings();
    }
  }, [session]);

  useEffect(() => {
    initComplete && getProfiles();
  }, [triggerCount]);

  useEffect(() => {
    setPage(0);
    setHasMore(true);
    initComplete && setTriggerCount((prev) => prev + 1);
  }, [hideInteractions, hidePreferences, initComplete]);

  async function getSettings() {
    const settings = {
      hideInteractions: {
        state: hideInteractions,
        setter: setHideInteractions,
      },
      hidePreferences: {
        state: hidePreferences,
        setter: setHidePreferences,
      },
    };

    for (const [key, value] of Object.entries(settings)) {
      const storedValue = await Storage.getItem(key);
      if (storedValue) {
        value.setter(JSON.parse(storedValue));
      } else {
        Storage.setItem(key, JSON.stringify(value.state));
      }
    }

    setInitComplete(true);
  }

  async function getProfiles() {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .rpc("search_active_profiles", {
          hide_interactions: hideInteractions,
          hide_preferences: hidePreferences,
        })
        .select("*")
        .range(page * PROFILES_PER_PAGE, (page + 1) * PROFILES_PER_PAGE - 1);

      if (error) {
        throw Error(error.message);
      }

      let nextData = data || [];
      if (nextData.length < PROFILES_PER_PAGE) {
        setHasMore(false);
      }

      await Promise.all(
        nextData.map(async (item: ProfilesData) => {
          try {
            if (item.profile.avatar_urls[0]) {
              await Image.prefetch(item.profile.avatar_urls[0]);
            }
          } catch (error) {
            if (error instanceof Error) {
              console.error(error.message);
            }
          }
        })
      );

      if (page === 0) {
        setProfiles(nextData);
      } else {
        setProfiles((prevData) => [...prevData, ...nextData]);
      }
    } catch (error) {
      if (error instanceof Error) {
        console.error(error.message);
        setSnackbarMessage("Unable to get profiles");
        setSnackbarVisible(true);
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={{ flex: 1 }}>
      <Appbar
        title="Profiles"
        menuItems={[
          {
            title: "Settings",
            onPress: () => {
              setHideSettings(!settingsVisible);
            },
          },
          {
            title: "Preferences",
            onPress: () => {
              navigate(`../${ROUTES.PREFERENCES}`);
            },
          },
        ]}
      />
      <View style={[styles.container, { paddingHorizontal: 0 }]}>
        {profiles.length ? (
          <FlatList
            data={profiles}
            keyExtractor={(item) => item.profile.id.toString()}
            ItemSeparatorComponent={() => <View style={styles.separator} />}
            contentContainerStyle={{ paddingVertical: 12 }}
            renderItem={({ item }) => (
              <Pressable
                onPress={() =>
                  navigate(`../${ROUTES.PROFILE}/${item.profile.id}`)
                }
              >
                {item.score && (
                  <Badge
                    theme={{
                      colors: {
                        error: interpolateColor(
                          item.score,
                          [1, 10],
                          [
                            theme.colors.primaryContainer,
                            theme.colors.secondaryContainer,
                          ]
                        ),
                        onError: interpolateColor(
                          item.score,
                          [1, 10],
                          [
                            theme.colors.onPrimaryContainer,
                            theme.colors.onSecondaryContainer,
                          ]
                        ),
                      },
                    }}
                    visible={true}
                    size={36}
                    style={{
                      fontFamily: theme.fonts.default.fontFamily,
                      position: "absolute",
                      top: 12,
                      right: 24,
                      zIndex: 1,
                    }}
                  >
                    {Math.round(item.score)}
                  </Badge>
                )}
                <Card style={{ marginHorizontal: 12 }}>
                  <View>
                    <View style={styles.separator} />
                    <Text
                      variant="titleLarge"
                      style={[styles.verticallySpaced, { textAlign: "center" }]}
                    >
                      {item.profile.username}
                      {item.profile.birthday &&
                        ", " + calculateAge(Date.parse(item.profile.birthday))}
                    </Text>
                    <View style={{ alignSelf: "center" }}>
                      <Avatar
                        size={styles.avatarSize.width}
                        url={item.profile.avatar_urls[0] || null}
                      />
                    </View>
                    <View style={styles.separator} />
                  </View>
                </Card>
              </Pressable>
            )}
            onEndReached={() => {
              if (hasMore) {
                setPage((prev) => prev + 1);
                setTriggerCount((prev) => prev + 1);
              }
            }}
            onEndReachedThreshold={0.1}
            ListFooterComponent={() =>
              loading ? (
                <View
                  style={{
                    flex: 1,
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <View style={styles.separator} />
                  <ActivityIndicator animating={true} size="large" />
                </View>
              ) : null
            }
          />
        ) : loading ? (
          <View
            style={{
              flex: 1,
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <ActivityIndicator animating={true} size="large" />
          </View>
        ) : (
          <Text
            style={[
              styles.verticallySpaced,
              { marginTop: 12, paddingHorizontal: 12 },
            ]}
          >
            No compatible profiles found, try adjusting your preferences.
          </Text>
        )}
      </View>
      <Portal>
        {settingsVisible && (
          <View style={styles.portalContainer}>
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
                  onPress={() => {
                    const newHideInteractions = !hideInteractions;
                    setHideInteractions(newHideInteractions);
                    Storage.setItem(
                      "hideInteractions",
                      JSON.stringify(newHideInteractions)
                    );
                  }}
                  disabled={loading}
                />
                <Checkbox.Item
                  labelStyle={{ color: theme.colors.onTertiaryContainer }}
                  label="Hide profiles that don't meet your additional preferences"
                  status={hidePreferences ? "checked" : "unchecked"}
                  onPress={() => {
                    const newHidePreferences = !hidePreferences;
                    setHidePreferences(newHidePreferences);
                    Storage.setItem(
                      "hidePreferences",
                      JSON.stringify(newHidePreferences)
                    );
                  }}
                  disabled={loading}
                />
              </View>
            </Modal>
          </View>
        )}
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
