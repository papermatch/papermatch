import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { View, Alert, ScrollView } from "react-native";
import { Button, TextInput, Text } from "react-native-paper";
import { Session } from "@supabase/supabase-js";
import Avatar from "./Avatar";
import { ROUTES, useNavigate } from "../lib/routing";
import styles from "../lib/styles";

export default function Account({ session }: { session: Session }) {
  const [loading, setLoading] = useState(true);
  const [avatarUrl, setAvatarUrl] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    if (session) {
      getAvatarUrl();
    }
  }, [session]);

  async function getAvatarUrl() {
    try {
      setLoading(true);
      if (!session?.user) throw new Error("No user on the session!");

      let { data, error, status } = await supabase
        .from("profiles")
        .select(`avatar_url`)
        .eq("id", session?.user.id)
        .single();
      if (error && status !== 406) {
        throw error;
      }

      if (data) {
        setAvatarUrl(data.avatar_url);
      }
    } catch (error) {
      if (error instanceof Error) {
        Alert.alert(error.message);
      }
    } finally {
      setLoading(false);
    }
  }

  async function updateAvatarUrl({ url }: { url: string }) {
    try {
      setLoading(true);
      if (!session?.user) throw new Error("No user on the session!");

      const updates = {
        id: session?.user.id,
        avatar_url: url,
        updated_at: new Date(),
      };

      let { error } = await supabase.from("profiles").upsert(updates);

      if (error) {
        throw error;
      }

      setAvatarUrl(url);
    } catch (error) {
      if (error instanceof Error) {
        Alert.alert(error.message);
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <ScrollView style={styles.container}>
      <Text variant="headlineLarge">Account</Text>
      <View style={styles.centerAligned}>
        <Avatar
          size={200}
          url={avatarUrl}
          onUpload={(url: string) => {
            updateAvatarUrl({ url });
          }}
        />
      </View>
      <TextInput
        style={styles.verticallySpaced}
        label="Email"
        value={session?.user?.email}
        disabled
      />
      <Button
        style={styles.verticallySpaced}
        onPress={() => navigate(`${ROUTES.EDIT}`)}
        disabled={loading}
      >
        Edit Profile
      </Button>
      <Button
        style={styles.verticallySpaced}
        onPress={() => supabase.auth.signOut()}
        disabled={loading}
      >
        Sign Out
      </Button>
    </ScrollView>
  );
}
