import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { View, Alert, FlatList } from "react-native";
import { Card, Text } from "react-native-paper";
import { Session } from "@supabase/supabase-js";
import Avatar from "./Avatar";
import { ROUTES, Link } from "../lib/routing";
import { ProfileData } from "../lib/types";
import styles from "../lib/styles";

export default function Profiles({ session }: { session: Session }) {
  const [loading, setLoading] = useState(true);
  const [profiles, setProfiles] = useState<ProfileData[]>([]);

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

      // Get active profiles (except current user)
      let { data, error } = await supabase
        .rpc("get_active_profiles")
        .select("*");

      if (error) {
        throw error;
      }

      const blockedIDs = await getBlockedIDs();
      data = data?.filter((profile) => !blockedIDs.includes(profile.id)) || [];

      data = data?.filter((profile) => profile.id !== session.user.id) || [];

      setProfiles(data);
    } catch (error) {
      if (error instanceof Error) {
        Alert.alert(error.message);
      }
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return null;
  }

  return (
    <View style={styles.container}>
      <Text variant="headlineLarge">Profiles</Text>
      <FlatList
        data={profiles}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <Link to={`${ROUTES.PROFILE}/${item.id}`}>
            <Card style={styles.verticallySpaced}>
              <Avatar size={100} url={item.avatar_url} />
              <Text variant="titleLarge" style={styles.verticallySpaced}>
                {item.username || ""}
              </Text>
            </Card>
          </Link>
        )}
      />
    </View>
  );
}
