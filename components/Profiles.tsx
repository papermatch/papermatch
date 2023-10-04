import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { View, Alert, FlatList } from "react-native";
import {
  Card,
  Text,
  Appbar,
  ActivityIndicator,
  Chip,
} from "react-native-paper";
import { Session } from "@supabase/supabase-js";
import Avatar from "./Avatar";
import Navigation from "./Navigation";
import { ROUTES, useNavigate } from "../lib/routing";
import { ProfileData } from "../lib/types";
import styles from "../lib/styles";
import { calculateAge } from "../lib/utils";

export default function Profiles({ session }: { session: Session }) {
  const [loading, setLoading] = useState(true);
  const [profiles, setProfiles] = useState<ProfileData[]>([]);
  const navigate = useNavigate();

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
    <View style={{ flex: 1 }}>
      <Appbar.Header mode="center-aligned">
        <Appbar.Content title="Profiles" />
      </Appbar.Header>
      {loading ? (
        <View
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
          <ActivityIndicator animating={true} size="large" />
        </View>
      ) : (
        <View style={styles.container}>
          <FlatList
            data={profiles}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => (
              <Card
                onPress={() => {
                  navigate(`${ROUTES.PROFILE}/${item.id}`);
                }}
                style={[styles.verticallySpaced]}
              >
                <View
                  style={[
                    {
                      flexDirection: "row",
                      padding: 16,
                    },
                  ]}
                >
                  <View style={{ alignSelf: "center" }}>
                    <Avatar size={100} url={item.avatar_url} />
                  </View>
                  <View
                    style={{
                      flex: 1,
                      flexDirection: "column",
                      marginLeft: 16,
                    }}
                  >
                    <Text variant="titleLarge">{item.username}</Text>
                    <View
                      style={[
                        styles.verticallySpaced,
                        {
                          flexDirection: "row",
                          flexWrap: "wrap",
                        },
                      ]}
                    >
                      <Chip
                        style={{ margin: 4 }}
                        icon="cake-variant"
                        disabled={loading}
                      >
                        {item.birthday
                          ? calculateAge(Date.parse(item.birthday))
                          : ""}
                      </Chip>
                      <Chip
                        style={{ margin: 4 }}
                        icon="gender-transgender"
                        disabled={loading}
                      >
                        {item.gender}
                      </Chip>
                      <Chip
                        style={{ margin: 4 }}
                        icon="baby-carriage"
                        disabled={loading}
                      >
                        {item.kids}
                      </Chip>
                    </View>
                  </View>
                </View>
              </Card>
            )}
          />
        </View>
      )}
      <Navigation key={session.user.id} session={session} />
    </View>
  );
}
