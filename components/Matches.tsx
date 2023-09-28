import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { StyleSheet, View, Alert, Text, FlatList } from "react-native";
import { Card } from "@rneui/themed";
import { Session } from "@supabase/supabase-js";
import { ROUTES, Link } from "../lib/routing";
import { MatchData, ProfileData } from "../lib/types";
import Avatar from "./Avatar";

type MatchProfileData = {
  match: MatchData;
  profile: ProfileData;
};

export default function Matches({ session }: { session: Session }) {
  const [loading, setLoading] = useState(true);
  const [matchProfiles, setMatchProfiles] = useState<MatchProfileData[]>([]);

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

      setMatchProfiles(
        data?.reduce((acc: MatchProfileData[], match) => {
          const profile = profiles.find(
            (profile) =>
              profile.id === match.user1_id || profile.id === match.user2_id
          );
          if (profile) {
            acc.push({ match, profile });
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

  if (loading) {
    return null;
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={matchProfiles}
        keyExtractor={(item) => item.match.id.toString()}
        renderItem={({ item }) => (
          <Link to={`${ROUTES.MATCH}/${item.match.id}`}>
            <Card containerStyle={styles.card}>
              <View>
                <Avatar size={100} url={item.profile.avatar_url} />
              </View>
              <View style={styles.verticallySpaced}>
                <Text>{item.profile.username || ""}</Text>
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
