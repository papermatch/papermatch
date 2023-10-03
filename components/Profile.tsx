import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { View, Alert } from "react-native";
import { Button, Appbar } from "react-native-paper";
import { Session } from "@supabase/supabase-js";
import Avatar from "./Avatar";
import { useParams, useNavigate } from "../lib/routing";
import { ProfileData } from "../lib/types";
import styles from "../lib/styles";

export default function Profile({ session }: { session: Session }) {
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [interaction, setInteraction] = useState(null);
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
        <Appbar.Content title={profile?.username || ""} />
      </Appbar.Header>
      <View style={styles.container}>
        <View style={styles.centerAligned}>
          <Avatar size={200} url={profile?.avatar_url || null} />
        </View>
        {interaction !== "like" ? (
          <Button
            style={styles.verticallySpaced}
            onPress={() => handleInteraction("like")}
            disabled={loading}
          >
            Like
          </Button>
        ) : (
          <Button
            style={styles.verticallySpaced}
            onPress={() => handleInteraction("none")}
            disabled={loading}
          >
            Unlike
          </Button>
        )}
        {interaction !== "pass" ? (
          <Button
            style={styles.verticallySpaced}
            onPress={() => handleInteraction("pass")}
            disabled={loading}
          >
            Pass
          </Button>
        ) : (
          <Button
            style={styles.verticallySpaced}
            onPress={() => handleInteraction("none")}
            disabled={loading}
          >
            Unpass
          </Button>
        )}
        {interaction !== "block" ? (
          <Button
            style={styles.verticallySpaced}
            onPress={() => handleInteraction("block")}
            disabled={loading}
          >
            Block
          </Button>
        ) : (
          <Button
            style={styles.verticallySpaced}
            onPress={() => handleInteraction("none")}
            disabled={loading}
          >
            Unblock
          </Button>
        )}
      </View>
    </View>
  );
}
