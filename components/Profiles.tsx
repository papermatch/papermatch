import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { View, Alert, FlatList } from "react-native";
import { Card, Text, Chip } from "react-native-paper";
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

      let { data, error } = await supabase
        .rpc("get_active_profiles")
        .select("*");

      if (error) {
        throw error;
      }

      const blockedIDs = await getBlockedIDs();
      data = data?.filter((profile) => !blockedIDs.includes(profile.id)) || [];

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
              <View style={styles.cardContent}>
                <Avatar size={100} url={item.avatar_url} />
                <View style={styles.textColumn}>
                  <Text variant="titleLarge">{item.username || ""}</Text>
                </View>
              </View>
            </Card>
          </Link>
        )}
      />
    </View>
  );
}
