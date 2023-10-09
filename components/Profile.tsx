import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { View, Alert, ScrollView, Image, TouchableOpacity } from "react-native";
import {
  Appbar,
  FAB,
  Menu,
  Chip,
  Divider,
  Text,
  ActivityIndicator,
  Portal,
  Modal,
} from "react-native-paper";
import { Session } from "@supabase/supabase-js";
import Avatar from "./Avatar";
import { ROUTES, useParams, useNavigate } from "../lib/routing";
import { ProfileData } from "../lib/types";
import styles from "../lib/styles";
import { calculateAge } from "../lib/utils";

export default function Profile({ session }: { session: Session }) {
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [interaction, setInteraction] = useState(null);
  const [appbarMenuVisible, setAppbarMenuVisible] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  useEffect(() => {
    if (id && session) {
      getData();
    }
  }, [id, session]);

  async function getData() {
    setLoading(true);
    await Promise.all([getProfile(), getInteraction()]);
    setLoading(false);
  }

  async function getProfile() {
    try {
      let { data, error, status } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", id)
        .single();
      if (error && status !== 406) {
        throw error;
      }

      setProfile(data);
    } catch (error) {
      if (error instanceof Error) {
        Alert.alert(error.message);
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
        Alert.alert("An error occurred", error.message);
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
      if (error) throw error;

      getInteraction();
    } catch (error) {
      if (error instanceof Error) {
        Alert.alert("An error occurred", error.message);
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
        <Appbar.Content title={profile?.username ?? "Profile"} />
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
                navigate(ROUTES.EDIT);
              }}
              title="Edit"
            />
          ) : (
            <Menu.Item
              onPress={() => {
                handleInteraction("block");
              }}
              title="Block"
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
        <ScrollView style={styles.container}>
          <View style={styles.centerAligned}>
            <Avatar
              size={200}
              url={profile?.avatar_url || null}
              onPress={() => {
                setImageUrl(profile?.avatar_url || null);
              }}
            />
          </View>
          <View
            style={[
              styles.verticallySpaced,
              {
                flexDirection: "row",
                flexWrap: "wrap",
                justifyContent: "center",
              },
            ]}
          >
            {profile?.birthday && (
              <Chip
                style={{ margin: 8 }}
                icon="cake-variant"
                disabled={loading}
              >
                {calculateAge(Date.parse(profile?.birthday))}
              </Chip>
            )}
            {profile?.gender && (
              <Chip
                style={{ margin: 8 }}
                icon="gender-transgender"
                disabled={loading}
              >
                {profile.gender}
              </Chip>
            )}
            {profile?.kids && (
              <Chip
                style={{ margin: 8 }}
                icon="baby-carriage"
                disabled={loading}
              >
                {profile.kids}
              </Chip>
            )}
          </View>
          <Divider style={styles.verticallySpaced} />
          <Text style={styles.verticallySpaced} variant="titleLarge">
            About
          </Text>
          <Text style={[styles.verticallySpaced, { marginLeft: 16 }]}>
            {profile?.about}
          </Text>
        </ScrollView>
      )}
      {session?.user.id != id && (
        <View>
          <FAB
            icon="thumb-down"
            style={{ position: "absolute", margin: 16, left: 0, bottom: 0 }}
            color={interaction == "pass" ? "red" : "grey"}
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
            <TouchableOpacity
              style={{ flex: 1 }}
              onPress={() => setImageUrl(null)}
            >
              <Image
                source={{ uri: imageUrl }}
                style={{ flex: 1 }}
                resizeMode="contain"
                onLoad={() => console.log(`Image ${imageUrl} loaded!`)}
                onError={(error) =>
                  console.log(`Image ${imageUrl} error:`, error)
                }
              />
            </TouchableOpacity>
          )}
        </Modal>
      </Portal>
    </View>
  );
}
