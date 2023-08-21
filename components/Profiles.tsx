import { useState, useEffect } from "react";
import { StyleSheet, View, Alert, Text, FlatList } from "react-native";
import { Card } from "@rneui/themed";
import { ROUTES, Link } from "../lib/routing";
import { supabase } from "../lib/supabase";
import Avatar from "./Avatar";

type ProfileData = {
  id: string | number; // depending on your data type
  username: string;
  avatar_url: string;
};

export default function Profiles() {
  const [loading, setLoading] = useState(true);
  const [profiles, setProfiles] = useState<ProfileData[]>([]);

  useEffect(() => {
    getProfiles();
  }, []);

  async function getProfiles() {
    try {
      setLoading(true);

      let { data, error } = await supabase
        .from("profiles")
        .select(`id, username, avatar_url`);

      if (error) {
        throw error;
      }

      setProfiles(data || []);
    } catch (error) {
      if (error instanceof Error) {
        Alert.alert(error.message);
      }
    } finally {
      setLoading(false);
    }
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
