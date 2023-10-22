import { useState, useEffect, useCallback } from "react";
import { supabase } from "../lib/supabase";
import {
  View,
  FlatList,
  ViewToken,
  Image,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import {
  Card,
  Text,
  TextInput,
  Appbar,
  ActivityIndicator,
  useTheme,
  Menu,
  Badge,
  Portal,
  Snackbar,
} from "react-native-paper";
import { Session } from "@supabase/supabase-js";
import Avatar from "./Avatar";
import { ROUTES, useParams, useNavigate } from "../lib/routing";
import { MatchData, MessageData, ProfileData } from "../lib/types";
import { useStyles } from "../lib/styles";

export default function Match({ session }: { session: Session }) {
  const [loading, setLoading] = useState(true);
  const [appbarMenuVisible, setAppbarMenuVisible] = useState(false);
  const [match, setMatch] = useState<MatchData | null>(null);
  const [messages, setMessages] = useState<MessageData[]>([]);
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [message, setMessage] = useState("");
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const navigate = useNavigate();
  const styles = useStyles();
  const theme = useTheme();
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
                payload.new as MessageData,
                ...prevMessages,
              ]);
              break;
            case "UPDATE":
              setMessages((prevMessages) =>
                prevMessages.map((message) => {
                  if (message.id === payload.new.id) {
                    return payload.new as MessageData;
                  } else {
                    return message;
                  }
                })
              );
              break;
            case "DELETE":
              setMessages((prevMessages) =>
                prevMessages.filter((message) => message.id !== payload.old.id)
              );
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
      const { data, error } = await supabase
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
        console.error(error.message);
        setSnackbarMessage("Unable to get match");
        setSnackbarVisible(true);
      }
    }
  }

  async function getMessages() {
    try {
      setLoading(true);

      const { data, error } = await supabase
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
        console.error(error.message);
        setSnackbarMessage("Unable to get messages");
        setSnackbarVisible(true);
      }
    } finally {
      setLoading(false);
    }
  }

  async function getProfile(userID: string) {
    try {
      const { data, error, status } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userID)
        .single();
      if (error && status !== 406) {
        throw error;
      }

      if (data.avatar_urls[0]) {
        await Image.prefetch(data.avatar_urls[0]);
      }

      setProfile(data);
    } catch (error) {
      if (error instanceof Error) {
        console.error(error.message);
        setSnackbarMessage("Unable to get profile");
        setSnackbarVisible(true);
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
        console.error(error.message);
        setSnackbarMessage("Unable to send message");
        setSnackbarVisible(true);
      }
    }
  }

  async function setMessageRead(message: MessageData) {
    try {
      const { error } = await supabase.rpc("set_message_read", {
        msg_id: message.id,
      });

      if (error) {
        throw error;
      }
    } catch (error) {
      if (error instanceof Error) {
        console.error(error.message);
        setSnackbarMessage("Unable to update message");
        setSnackbarVisible(true);
      }
    }
  }

  const viewabilityConfig = {
    waitForInteraction: false,
    viewAreaCoveragePercentThreshold: 10,
  };

  const handleViewableItemsChanged = useCallback(
    ({ viewableItems }: { viewableItems: Array<ViewToken> }) => {
      for (const { item } of viewableItems) {
        if (item.user_id !== session.user.id && !item.is_read) {
          setMessageRead(item);
        }
      }
    },
    []
  );

  return (
    <View style={{ flex: 1 }}>
      <Appbar.Header mode="center-aligned">
        <Appbar.BackAction
          onPress={() => {
            navigate(-1);
          }}
        />
        <Appbar.Content
          titleStyle={styles.appbarTitle}
          title={profile?.username || "Match"}
        />
        <Menu
          visible={appbarMenuVisible}
          onDismiss={() => setAppbarMenuVisible(false)}
          anchor={
            <Appbar.Action
              icon="dots-vertical"
              onPress={() => setAppbarMenuVisible(!appbarMenuVisible)}
            />
          }
        >
          <Menu.Item
            onPress={() => {
              navigate(`${ROUTES.PROFILE}/${profile?.id}`);
            }}
            title="Profile"
          />
        </Menu>
      </Appbar.Header>
      {loading ? (
        <View
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
          <ActivityIndicator animating={true} size="large" />
        </View>
      ) : (
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={{ flex: 1 }}
        >
          <View style={styles.container}>
            <FlatList
              data={messages}
              keyExtractor={(item) => item.id.toString()}
              inverted={true}
              renderItem={({ item }) => (
                <Card
                  style={[
                    styles.verticallySpaced,
                    {
                      backgroundColor:
                        item.user_id == session.user.id
                          ? theme.colors.elevation.level5
                          : theme.colors.elevation.level1,
                      marginLeft: item.user_id == session.user.id ? 64 : 0,
                      marginRight: item.user_id == session.user.id ? 0 : 64,
                    },
                  ]}
                >
                  <View
                    style={[
                      {
                        flexDirection:
                          item.user_id == session.user.id
                            ? "row-reverse"
                            : "row",
                        padding: 8,
                      },
                    ]}
                  >
                    <Badge
                      visible={!item.is_read && item.user_id != session.user.id}
                      size={10}
                      style={{ position: "absolute", top: 10, right: 10 }}
                    />
                    {item.user_id != session.user.id && (
                      <View style={{ alignSelf: "flex-start" }}>
                        <Avatar
                          size={50}
                          url={profile?.avatar_urls[0] || null}
                          onPress={() =>
                            navigate(`${ROUTES.PROFILE}/${profile?.id}`)
                          }
                        />
                      </View>
                    )}
                    <Text style={{ marginHorizontal: 12, alignSelf: "center" }}>
                      {item.message}
                    </Text>
                  </View>
                </Card>
              )}
              viewabilityConfig={viewabilityConfig}
              onViewableItemsChanged={handleViewableItemsChanged}
            />
            <View style={[styles.verticallySpaced, { flexDirection: "row" }]}>
              <TextInput
                style={{ flex: 1 }}
                value={message}
                onChangeText={setMessage}
                onSubmitEditing={handleMessage}
                blurOnSubmit={true}
                placeholder="Type a message"
                multiline={true}
                numberOfLines={4}
                right={
                  <TextInput.Icon
                    icon="send"
                    onPress={handleMessage}
                    disabled={message.trim() === ""}
                  />
                }
              />
            </View>
          </View>
        </KeyboardAvoidingView>
      )}
      <Portal>
        <Snackbar
          style={styles.snackbar}
          visible={snackbarVisible}
          onDismiss={() => setSnackbarVisible(false)}
          action={{
            label: "Dismiss",
            onPress: () => setSnackbarVisible(false),
          }}
        >
          {snackbarMessage}
        </Snackbar>
      </Portal>
    </View>
  );
}
