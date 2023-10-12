import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { View, FlatList } from "react-native";
import {
  Card,
  Text,
  Appbar,
  ActivityIndicator,
  Menu,
  IconButton,
  Portal,
  Snackbar,
} from "react-native-paper";
import { Session } from "@supabase/supabase-js";
import Avatar from "./Avatar";
import Navigation from "./Navigation";
import { ROUTES, useNavigate } from "../lib/routing";
import { ProfileData } from "../lib/types";
import styles from "../lib/styles";

export default function Blocked({ session }: { session: Session }) {
  const [loading, setLoading] = useState(true);
  const [appbarMenuVisible, setAppbarMenuVisible] = useState(false);
  const [profiles, setProfiles] = useState<ProfileData[]>([]);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    if (session) {
      getProfiles();
    }
  }, [session]);

  async function getBlockedIDs(): Promise<string[]> {
    const { data, error, status } = await supabase
      .from("interactions")
      .select("target_id")
      .eq("user_id", session?.user.id)
      .eq("interaction", "block");
    if (error && status !== 406) {
      throw error;
    }

    return data?.map((interaction) => interaction.target_id) || [];
  }

  async function getProfiles() {
    try {
      setLoading(true);

      const blockedIDs = await getBlockedIDs();

      let { data, error } = await supabase
        .from("profiles")
        .select("*")
        .in("id", blockedIDs);

      if (error) {
        throw error;
      }

      setProfiles(data || []);
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

  async function handleUnblock(id: string) {
    try {
      const { error } = await supabase.from("interactions").upsert([
        {
          user_id: session?.user.id,
          target_id: id,
          interaction: "none",
          updated_at: new Date(),
        },
      ]);

      if (error) {
        throw error;
      }

      setSnackbarMessage("User unblocked!");
      setSnackbarVisible(true);

      getProfiles();
    } catch (error) {
      if (error instanceof Error) {
        console.log(error.message);
        setSnackbarMessage("Unable to unblock user");
        setSnackbarVisible(true);
      }
    }
  }

  return (
    <View style={{ flex: 1 }}>
      <Appbar.Header mode="center-aligned">
        <Appbar.Content titleStyle={styles.appbarTitle} title="Blocked" />
      </Appbar.Header>
      {loading ? (
        <View
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
          <ActivityIndicator animating={true} size="large" />
        </View>
      ) : (
        <View style={styles.container}>
          {profiles.length ? (
            <FlatList
              data={profiles}
              keyExtractor={(profile) => profile.id.toString()}
              renderItem={({ item: profile }) => (
                <Card
                  onPress={() => {
                    navigate(`${ROUTES.PROFILE}/${profile.id}`);
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
                        size={50}
                        url={profile.avatar_urls[0] || null}
                        onPress={() => {
                          navigate(`${ROUTES.PROFILE}/${profile.id}`);
                        }}
                      />
                    </View>
                    <View
                      style={{
                        flex: 1,
                        flexDirection: "row",
                        justifyContent: "space-between",
                        marginLeft: 16,
                        alignItems: "center",
                      }}
                    >
                      <Text variant="titleLarge">{profile.username}</Text>
                      <IconButton
                        icon="close"
                        onPress={() => {
                          handleUnblock(profile.id);
                        }}
                      />
                    </View>
                  </View>
                </Card>
              )}
            />
          ) : (
            <Text style={styles.verticallySpaced}>
              No blocked profiles found.
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
