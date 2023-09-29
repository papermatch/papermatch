import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { View, Alert, FlatList } from "react-native";
import { Card, Text, TextInput, Button, Appbar } from "react-native-paper";
import { Session } from "@supabase/supabase-js";
import Avatar from "./Avatar";
import { ROUTES, Link } from "../lib/routing";
import { useParams, useNavigate } from "../lib/routing";
import { MatchData, MessageData, ProfileData } from "../lib/types";
import styles from "../lib/styles";

export default function Match({ session }: { session: Session }) {
  const [loading, setLoading] = useState(true);
  const [match, setMatch] = useState<MatchData | null>(null);
  const [messages, setMessages] = useState<MessageData[]>([]);
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [message, setMessage] = useState("");
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  useEffect(() => {
    if (id && session) {
      getData();
    }

    const messagesChannel = supabase
      .channel("messages")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "messages",
          filter: `match_id=eq.${id}`,
        },
        (payload) => {
          switch (payload.eventType) {
            case "INSERT":
              setMessages((prevMessages) => [
                ...prevMessages,
                payload.new as MessageData,
              ]);
              break;
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(messagesChannel);
    };
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

      await getProfile(
        data?.user1_id === session.user.id ? data.user2_id : data?.user1_id
      );

      setMatch(data);
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
        .order("created_at", { ascending: true });

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

  async function getProfile(userID: string) {
    try {
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

  async function handleMessage() {
    if (message.trim() === "") {
      return;
    }

    try {
      const { error } = await supabase.from("messages").insert({
        match_id: id,
        user_id: session.user.id,
        message: message,
      });

      if (error) {
        throw error;
      }

      setMessage("");
    } catch (error) {
      if (error instanceof Error) {
        Alert.alert("Error sending message", error.message);
      }
    }
  }

  if (loading) {
    return null;
  }

  return (
    <View>
      <Appbar.Header>
        <Appbar.BackAction
          onPress={() => {
            navigate(-1);
          }}
        />
        <Appbar.Content title={profile?.username || ""} />
      </Appbar.Header>
      <View style={styles.container}>
        <Link to={`${ROUTES.PROFILE}/${profile?.id}`}>
          <Card style={styles.verticallySpaced}>
            <Avatar size={100} url={profile?.avatar_url || ""} />
            <Text style={styles.verticallySpaced}>
              {profile?.username || ""}
            </Text>
          </Card>
        </Link>
        <FlatList
          data={messages}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <Card style={styles.verticallySpaced}>
              <Text style={styles.verticallySpaced}>{item.message}</Text>
            </Card>
          )}
        />
        <TextInput
          style={styles.verticallySpaced}
          value={message}
          onChangeText={setMessage}
          placeholder="Type a message"
        />
        <Button style={styles.verticallySpaced} onPress={handleMessage}>
          Send
        </Button>
      </View>
    </View>
  );
}
