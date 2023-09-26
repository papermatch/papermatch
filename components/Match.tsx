import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { StyleSheet, View, Alert, Text, FlatList } from "react-native";
import { Card } from "@rneui/themed";
import { Session } from "@supabase/supabase-js";
import { ROUTES, Link } from "../lib/routing";
import { useParams } from "../lib/routing";
import { MatchData, MessageData, ProfileData } from "../lib/types";
import Avatar from "./Avatar";

export default function Match({ session }: { session: Session }) {
  const [loading, setLoading] = useState(true);
  const [match, setMatch] = useState<MatchData | null>(null);
  const [messages, setMessages] = useState<MessageData[]>([]);
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const { id } = useParams<{ id: string }>();

  useEffect(() => {
    if (id && session) {
      getData();
    }
  }, [id, session]);

  async function getData() {
    setLoading(true);
    await Promise.all([getMatch(), getMessages()]);
    setLoading(false);
  }

  async function getMatch() {
    try {
      let { data, error } = await supabase
        .from("matches")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        throw error;
      }

      setMatch(data);

      await getProfile();
    } catch (error) {
      if (error instanceof Error) {
        Alert.alert("Error", error.message);
      }
    }
  }

  async function getMessages() {
    try {
      setLoading(true);

      let { data, error } = await supabase
        .from("messages")
        .select("*")
        .eq("match_id", id)
        .order("inserted_at", { ascending: true });

      if (error) {
        throw error;
      }

      setMessages(data || []);
    } catch (error) {
      if (error instanceof Error) {
        Alert.alert("Error", error.message);
      }
    } finally {
      setLoading(false);
    }
  }

  async function getProfile() {
    try {
      const userID =
        match?.user1_id === session.user.id ? match.user2_id : match?.user1_id;

      let { data, error, status } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userID)
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

  if (loading) {
    return null;
  }

  return (
    <View style={styles.container}>
      <Link to={`${ROUTES.PROFILE}/${profile?.id}`}>
        <Card containerStyle={styles.card}>
          <View>
            <Avatar size={100} url={profile?.avatar_url || ""} />
          </View>
          <View style={styles.verticallySpaced}>
            <Text>{profile?.username || ""}</Text>
          </View>
        </Card>
      </Link>
      <FlatList
        data={messages}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <Card containerStyle={styles.card}>
            <Text>{item.message}</Text>
          </Card>
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
