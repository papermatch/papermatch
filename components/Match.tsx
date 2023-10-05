import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { View, Alert, FlatList } from "react-native";
import {
  Card,
  Text,
  TextInput,
  IconButton,
  Appbar,
  ActivityIndicator,
  useTheme,
} from "react-native-paper";
import { Session } from "@supabase/supabase-js";
import Avatar from "./Avatar";
import { ROUTES, useParams, useNavigate } from "../lib/routing";
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
  const theme = useTheme();

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
                payload.new as MessageData,
                ...prevMessages,
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
        .order("created_at", { ascending: false });

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
    <View style={{ flex: 1 }}>
      <Appbar.Header mode="center-aligned">
        <Appbar.BackAction
          onPress={() => {
            navigate(-1);
          }}
        />
        <Appbar.Content title={profile?.username || "Match"} />
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
            data={messages}
            keyExtractor={(item) => item.id.toString()}
            inverted={true}
            renderItem={({ item }) => (
              <Card style={styles.verticallySpaced}>
                <View
                  style={[
                    {
                      flexDirection:
                        item.user_id == session.user.id ? "row-reverse" : "row",
                      backgroundColor:
                        item.user_id == session.user.id
                          ? theme.colors.elevation.level5
                          : theme.colors.elevation.level1,
                      padding: 8,
                    },
                  ]}
                >
                  {item.user_id != session.user.id && (
                    <View style={{ alignSelf: "flex-start" }}>
                      <Avatar
                        size={50}
                        url={profile?.avatar_url || null}
                        onPress={() =>
                          navigate(`${ROUTES.PROFILE}/${profile?.id}`)
                        }
                      />
                    </View>
                  )}
                  <Text style={{ marginHorizontal: 12 }}>{item.message}</Text>
                </View>
              </Card>
            )}
          />
          <View style={[styles.verticallySpaced, { flexDirection: "row" }]}>
            <TextInput
              style={{ flex: 1 }}
              value={message}
              onChangeText={setMessage}
              placeholder="Type a message"
              multiline={true}
              numberOfLines={2}
            />
            <IconButton
              style={{ alignSelf: "center" }}
              icon="send"
              onPress={handleMessage}
            />
          </View>
        </View>
      )}
    </View>
  );
}
