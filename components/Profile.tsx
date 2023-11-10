import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { View, ScrollView, Pressable } from "react-native";
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
  useTheme,
} from "react-native-paper";
import { Image } from "expo-image";
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
  const theme = useTheme();
  const { id, index } = useParams<{ id: string; index: string | undefined }>();

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
            if (error instanceof Error) {
              console.error(error.message);
            }
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

      if (type == "pass" || type == "block") {
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
            <View>
              <Menu.Item
                onPress={() => {
                  handleInteraction(interaction == "block" ? "none" : "block");
                }}
                title={interaction == "block" ? "Unblock" : "Block"}
              />
              <Menu.Item
                onPress={() => {
                  navigate(`../${ROUTES.REPORT}/${id}`);
                }}
                title="Report"
              />
            </View>
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
            <View style={styles.separator} />
            {profile ? (
              <View>
                <Carousel
                  data={profile.avatar_urls.length ? profile.avatar_urls : [""]}
                  renderItem={(item) => (
                    <Avatar
                      size={300}
                      url={item}
                      onPress={() => {
                        setImageUrl(item);
                      }}
                    />
                  )}
                  size={300}
                  index={index ? parseInt(index) || 0 : 0}
                />
                <View style={styles.separator} />
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
                <View style={styles.separator} />
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
            icon={interaction == "pass" ? "close-circle" : "close"}
            style={{ position: "absolute", margin: 16, left: 0, bottom: 0 }}
            color="black"
            size="medium"
            onPress={() =>
              interaction == "pass"
                ? handleInteraction("none")
                : handleInteraction("pass")
            }
            disabled={loading}
          />
          <FAB
            icon={interaction == "like" ? "heart" : "heart-outline"}
            style={{ position: "absolute", margin: 16, right: 0, bottom: 0 }}
            color={theme.colors.secondary}
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
        {!!imageUrl && (
          <View style={styles.container}>
            <Modal
              visible={!!imageUrl}
              onDismiss={() => setImageUrl(null)}
              contentContainerStyle={{ flex: 1 }}
            >
              {!!imageUrl && (
                <Pressable
                  style={{ flex: 1 }}
                  onPress={() => setImageUrl(null)}
                >
                  <Image
                    source={{ uri: imageUrl }}
                    style={{ flex: 1 }}
                    contentFit="contain"
                    onError={(error) => {
                      if (error instanceof Error) {
                        console.error(error.message);
                      }
                    }}
                  />
                </Pressable>
              )}
            </Modal>
          </View>
        )}
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
