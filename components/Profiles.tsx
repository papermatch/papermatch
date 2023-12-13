import { useState, useEffect, useCallback } from "react";
import { supabase } from "../lib/supabase";
import { View, FlatList } from "react-native";
import {
  Card,
  Text,
  ActivityIndicator,
  Checkbox,
  Portal,
  Modal,
  Snackbar,
  useTheme,
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

const PROFILES_PER_PAGE = 6;

export default function Profiles({ session }: { session: Session }) {
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [data, setData] = useState<ProfilesData[]>([]);
  const [triggerCount, setTriggerCount] = useState(0);
  const [initComplete, setInitComplete] = useState(false);
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
      setInitComplete(true);
    }
  }, [session, triggerCount]);

  useEffect(() => {
    setPage(0);
    setHasMore(true);
    initComplete && setTriggerCount((prev) => prev + 1);
  }, [hideInteractions, hidePreferences]);

  async function getData() {
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
        throw error;
      }

      let nextData = data || [];
      if (nextData.length < PROFILES_PER_PAGE) {
        setHasMore(false);
      }

      await Promise.all(
        nextData.map(async (item) => {
          try {
            await Image.prefetch(item.profile.avatar_urls);
          } catch (error) {
            if (error instanceof Error) {
              console.error(error.message);
            }
          }
        })
      );

      if (page === 0) {
        setData(nextData);
      } else {
        setData((prevData) => [...prevData, ...nextData]);
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

  const onPress = useCallback(() => {}, []);

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
        {data.length ? (
          <FlatList
            data={data}
            keyExtractor={(item) => item.profile.id.toString()}
            ItemSeparatorComponent={() => <View style={styles.separator} />}
            contentContainerStyle={{ paddingVertical: 12 }}
            renderItem={({ item }) => (
              <Card
                style={{ marginHorizontal: 12 }}
                onPress={() => {
                  navigate(`../${ROUTES.PROFILE}/${item.profile.id}`);
                }}
              >
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
                      onPress={onPress}
                    />
                  </View>
                  <View style={styles.separator} />
                </View>
              </Card>
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
                  onPress={() => setHideInteractions(!hideInteractions)}
                  disabled={loading}
                />
                <Checkbox.Item
                  labelStyle={{ color: theme.colors.onTertiaryContainer }}
                  label="Hide profiles that don't meet all of your preferences"
                  status={hidePreferences ? "checked" : "unchecked"}
                  onPress={() => setHidePreferences(!hidePreferences)}
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
