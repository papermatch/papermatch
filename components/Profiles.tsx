import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { StyleSheet, View, Alert, Text, FlatList } from "react-native";
import { Card } from "@rneui/themed";
import { Session } from "@supabase/supabase-js";
import { ROUTES, Link } from "../lib/routing";
import { ProfileData } from "../lib/types";
import Avatar from "./Avatar";

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

    return data?.map((item) => item.target_id) || [];
  }

  async function getProfiles() {
    try {
      setLoading(true);

      let { data, error } = await supabase.from("profiles").select("*");

      if (error) {
        throw error;
      }

      const blockedIDs = await getBlockedIDs();
      data = data?.filter((item) => !blockedIDs.includes(item.id)) || [];

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
      <FlatList
        data={profiles}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <Link to={`${ROUTES.PROFILE}/${item.id}`}>
            <Card containerStyle={styles.card}>
              <View>
                <Avatar size={100} url={item.avatar_url} />
              </View>
              <View style={styles.verticallySpaced}>
                <Text>{item.username || ""}</Text>
              </View>
            </Card>
          </Link>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 40,
    padding: 12,
  },
  card: {
    marginBottom: 20,
  },
  verticallySpaced: {
    paddingTop: 4,
    paddingBottom: 4,
    alignSelf: "stretch",
  },
});
