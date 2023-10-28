import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { View, ScrollView, Image, Pressable } from "react-native";
import {
  Appbar,
  FAB,
  Menu,
  Divider,
  Text,
  ActivityIndicator,
  Portal,
  Modal,
  Snackbar,
} from "react-native-paper";
import { Session } from "@supabase/supabase-js";
import Avatar from "./Avatar";
import { ROUTES, useParams, useNavigate } from "../lib/routing";
import { ProfileData } from "../lib/types";
import { useStyles } from "../lib/styles";
import { Attributes } from "./Attributes";
import { Carousel } from "./Carousel";

export default function Profile({ session }: { session: Session }) {
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [distance, setDistance] = useState<number | null>(null);
  const [interaction, setInteraction] = useState(null);
  const [appbarMenuVisible, setAppbarMenuVisible] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const navigate = useNavigate();
  const styles = useStyles();
  const { id } = useParams<{ id: string }>();

  useEffect(() => {
    if (id && session) {
      getData();
    }
  }, [id, session]);

  async function getData() {
    setLoading(true);
    await Promise.all([getProfile(), getDistance(), getInteraction()]);
    setLoading(false);
  }

  async function getProfile() {
    try {
      const { data, error, status } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", id)
        .single();
      if (error && status !== 406) {
        throw error;
      }

      await Promise.all(
        data.avatar_urls.map(async (avatarUrl: string) => {
          try {
            await Image.prefetch(avatarUrl);
          } catch (error) {
            console.error(`Error prefetching ${avatarUrl}:`, error);
          }
        })
      );

      setProfile(data);
    } catch (error) {
      if (error instanceof Error) {
        console.error(error.message);
        setSnackbarMessage("Unable to get profile");
        setSnackbarVisible(true);
      }
    }
  }

  async function getDistance() {
    try {
      const { data, error } = await supabase.rpc("get_user_distance", {
        user1_id: session?.user.id,
        user2_id: id,
      });

      if (error) {
        throw error;
      }

      setDistance(data || null);
    } catch (error) {
      if (error instanceof Error) {
        console.error(error.message);
        setSnackbarMessage("Unable to get distance");
        setSnackbarVisible(true);
      }
    }
  }

  async function getInteraction() {
    try {
      const { data, error, status } = await supabase
        .from("interactions")
        .select("interaction")
        .eq("user_id", session?.user.id)
        .eq("target_id", id)
        .limit(1)
        .maybeSingle();
      if (error && status !== 406) {
        throw error;
      }

      if (data) {
        setInteraction(data.interaction);
      } else {
        setInteraction(null);
      }
    } catch (error) {
      if (error instanceof Error) {
        console.error(error.message);
        setSnackbarMessage("Unable to get interaction");
        setSnackbarVisible(true);
      }
    }
  }

  async function handleInteraction(type: string) {
    try {
      const { error } = await supabase.from("interactions").upsert([
        {
          user_id: session?.user.id,
          target_id: id,
          interaction: type,
          updated_at: new Date(),
        },
      ]);

      if (error) {
        throw error;
      }

      if (type == "block") {
        navigate(-1);
      } else {
        getInteraction();
      }
    } catch (error) {
      if (error instanceof Error) {
        console.error(error.message);
        setSnackbarMessage("Unable to update interaction");
        setSnackbarVisible(true);
      }
    }
  }

  return (
    <View style={{ flex: 1 }}>
      <Appbar.Header mode="center-aligned">
        <Appbar.BackAction
          onPress={() => {
            navigate(-1);
          }}
        />
        <Appbar.Content
          titleStyle={styles.appbarTitle}
          title={profile?.username ?? "Profile"}
        />
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
          {session?.user.id == id ? (
            <Menu.Item
              onPress={() => {
                navigate(`../${ROUTES.EDIT}`);
              }}
              title="Edit"
            />
          ) : (
            <Menu.Item
              onPress={() => {
                handleInteraction(interaction == "block" ? "none" : "block");
              }}
              title={interaction == "block" ? "Unblock" : "Block"}
            />
          )}
        </Menu>
      </Appbar.Header>
      {loading ? (
        <View
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
          <ActivityIndicator animating={true} size="large" />
        </View>
      ) : (
        <ScrollView style={{ flex: 1 }}>
          <View style={styles.container}>
            {profile ? (
              <View>
                <Carousel
                  data={profile.avatar_urls || [""]}
                  renderItem={(item) => (
                    <Avatar
                      size={200}
                      url={item}
                      onPress={() => {
                        setImageUrl(item);
                      }}
                    />
                  )}
                  loading={loading}
                />
                <Attributes
                  style={{
                    flexDirection: "row",
                    flexWrap: "wrap",
                    justifyContent: "center",
                  }}
                  distance={distance}
                  profile={profile}
                  loading={loading}
                />
                <Divider style={styles.verticallySpaced} />
                <Text style={styles.verticallySpaced} variant="titleLarge">
                  About
                </Text>
                <Text
                  style={[
                    styles.verticallySpaced,
                    { marginLeft: 16, marginBottom: 88 },
                  ]}
                >
                  {profile.about}
                </Text>
              </View>
            ) : (
              <Text style={styles.verticallySpaced}>Profile not found</Text>
            )}
          </View>
        </ScrollView>
      )}
      {session?.user.id != id && profile && (
        <View style={styles.fabContainer}>
          <FAB
            icon="thumb-down"
            style={{ position: "absolute", margin: 16, left: 0, bottom: 0 }}
            color={interaction == "pass" ? "red" : "grey"}
            size="medium"
            onPress={() =>
              interaction == "pass"
                ? handleInteraction("none")
                : handleInteraction("pass")
            }
            disabled={loading}
          />
          <FAB
            icon="thumb-up"
            style={{ position: "absolute", margin: 16, right: 0, bottom: 0 }}
            color={interaction == "like" ? "green" : "grey"}
            size="medium"
            onPress={() =>
              interaction == "like"
                ? handleInteraction("none")
                : handleInteraction("like")
            }
            disabled={loading}
          />
        </View>
      )}
      <Portal>
        <Modal
          visible={!!imageUrl}
          onDismiss={() => setImageUrl(null)}
          contentContainerStyle={{ flex: 1 }}
        >
          {!!imageUrl && (
            <Pressable style={{ flex: 1 }} onPress={() => setImageUrl(null)}>
              <Image
                source={{ uri: imageUrl }}
                style={{ flex: 1 }}
                resizeMode="contain"
                onError={(error) =>
                  console.error(`Image ${imageUrl} error:`, error)
                }
              />
            </Pressable>
          )}
        </Modal>
      </Portal>
      <Portal>
        <Snackbar
          style={styles.snackbar}
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
    </View>
  );
}
