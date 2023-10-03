import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { View, Alert } from "react-native";
import { Appbar, FAB, Menu, Chip, Divider, Text } from "react-native-paper";
import { Session } from "@supabase/supabase-js";
import Avatar from "./Avatar";
import { ROUTES, useParams, useNavigate } from "../lib/routing";
import { ProfileData } from "../lib/types";
import styles from "../lib/styles";

export default function Profile({ session }: { session: Session }) {
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [interaction, setInteraction] = useState(null);
  const [menuVisible, setMenuVisible] = useState(false);
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

  function calculateAge(birthday: number) {
    const ageDiffMs = Date.now() - birthday;
    const ageDate = new Date(ageDiffMs);
    return Math.abs(ageDate.getUTCFullYear() - 1970);
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
        <Appbar.Content title={profile?.username || ""} />
        <Menu
          visible={menuVisible}
          onDismiss={() => setMenuVisible(false)}
          anchor={
            <Appbar.Action
              icon="dots-vertical"
              onPress={() => setMenuVisible(!menuVisible)}
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
      <View style={styles.container}>
        <View style={styles.centerAligned}>
          <Avatar size={200} url={profile?.avatar_url || null} />
        </View>
        <View
          style={[
            styles.verticallySpaced,
            { flexDirection: "row", justifyContent: "center" },
          ]}
        >
          <Chip style={{ margin: 8 }} icon="cake" disabled={loading}>
            {profile?.birthday
              ? calculateAge(Date.parse(profile?.birthday))
              : ""}
          </Chip>
          <Chip
            style={{ margin: 8 }}
            icon="gender-transgender"
            disabled={loading}
          >
            {profile?.gender}
          </Chip>
          <Chip style={{ margin: 8 }} icon="baby-carriage" disabled={loading}>
            {profile?.kids}
          </Chip>
        </View>
        <Divider style={styles.verticallySpaced} />
        <Text style={styles.verticallySpaced} variant="titleLarge">
          About
        </Text>
        <Text style={[styles.verticallySpaced, { marginLeft: 16 }]}>
          {profile?.about}
        </Text>
        {session?.user.id != id && (
          <View>
            <FAB
              icon="thumb-up"
              style={{ position: "absolute", margin: 16, left: 0, bottom: 0 }}
              color={interaction == "like" ? "green" : "grey"}
              onPress={() =>
                interaction == "like"
                  ? handleInteraction("none")
                  : handleInteraction("like")
              }
              disabled={loading}
            />
            <FAB
              icon="thumb-down"
              style={{ position: "absolute", margin: 16, right: 0, bottom: 0 }}
              color={interaction == "pass" ? "red" : "grey"}
              onPress={() =>
                interaction == "pass"
                  ? handleInteraction("none")
                  : handleInteraction("pass")
              }
              disabled={loading}
            />
          </View>
        )}
      </View>
    </View>
  );
}
