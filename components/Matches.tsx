import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { View, Alert, FlatList } from "react-native";
import { Card, Text, Appbar, ActivityIndicator } from "react-native-paper";
import { Session } from "@supabase/supabase-js";
import Avatar from "./Avatar";
import Navigation from "./Navigation";
import { ROUTES, useNavigate } from "../lib/routing";
import { MatchData, ProfileData, MessageData } from "../lib/types";
import styles from "../lib/styles";

type MatchesData = {
  match: MatchData;
  profile: ProfileData;
  message: MessageData | null;
};

export default function Matches({ session }: { session: Session }) {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<MatchesData[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    if (session) {
      getMatches();
    }
  }, [session]);

  async function getMatches() {
    try {
      setLoading(true);

      let { data, error } = await supabase
        .rpc("get_active_matches")
        .select("*");

      if (error) {
        throw error;
      }

      const profileIDs =
        data?.map((match) => {
          if (match.user1_id === session.user.id) {
            return match.user2_id;
          } else {
            return match.user1_id;
          }
        }) || [];
      const profiles = await getProfiles(profileIDs);

      const matchIDs = data?.map((match) => match.id);
      const messages = await getMessages(matchIDs || []);

      setData(
        data?.reduce((acc: MatchesData[], match) => {
          const profile = profiles.find(
            (profile) =>
              profile.id === match.user1_id || profile.id === match.user2_id
          );
          const message = messages.find(
            (message) => message?.match_id === match.id
          );
          if (profile) {
            acc.push({
              match: match,
              profile: profile,
              message: message || null,
            });
          }
          return acc;
        }, []) || []
      );
    } catch (error) {
      if (error instanceof Error) {
        Alert.alert(error.message);
      }
    } finally {
      setLoading(false);
    }
  }

  async function getProfiles(ids: string[]): Promise<ProfileData[]> {
    let { data, error } = await supabase
      .from("profiles")
      .select("*")
      .in("id", ids);

    if (error) {
      throw error;
    }

    return data || [];
  }

  async function getMessages(ids: string[]): Promise<MessageData[]> {
    let { data, error } = await supabase
      .from("messages")
      .select("*")
      .in("match_id", ids)
      .order("created_at", { ascending: false });

    if (error) {
      throw error;
    }

    return ids.map((id) => data?.find((message) => message.match_id === id));
  }

  return (
    <View style={{ flex: 1 }}>
      <Appbar.Header mode="center-aligned">
        <Appbar.Content title="Matches" />
      </Appbar.Header>
      {loading ? (
        <View
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
          <ActivityIndicator animating={true} size="large" />
        </View>
      ) : (
        <View style={styles.container}>
          {data.length ? (
            <FlatList
              data={data}
              keyExtractor={(item) => item.match.id.toString()}
              renderItem={({ item }) => (
                <Card
                  style={styles.verticallySpaced}
                  onPress={() => navigate(`${ROUTES.MATCH}/${item.match.id}`)}
                >
                  <View style={{ flexDirection: "row", padding: 16 }}>
                    <View style={{ alignSelf: "center" }}>
                      <Avatar
                        size={75}
                        url={item.profile.avatar_urls[0] || null}
                        onPress={() => {
                          navigate(`${ROUTES.MATCH}/${item.match.id}`);
                        }}
                      />
                    </View>
                    <View
                      style={{
                        flex: 1,
                        flexDirection: "column",
                        marginLeft: 16,
                      }}
                    >
                      <Text
                        variant="titleLarge"
                        style={styles.verticallySpaced}
                      >
                        {item.profile.username}
                      </Text>
                      <Text style={styles.verticallySpaced}>
                        {item.message?.message || ""}
                      </Text>
                    </View>
                  </View>
                </Card>
              )}
            />
          ) : (
            <Text style={styles.verticallySpaced}>No matches yet.</Text>
          )}
        </View>
      )}
      <Navigation key={session.user.id} session={session} />
    </View>
  );
}
