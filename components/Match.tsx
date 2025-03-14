import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { supabase } from "../lib/supabase";
import {
  View,
  FlatList,
  ViewToken,
  KeyboardAvoidingView,
  Platform,
  Pressable,
} from "react-native";
import {
  Card,
  Text,
  TextInput,
  ActivityIndicator,
  Badge,
  HelperText,
  Portal,
  Dialog,
  Button,
  Snackbar,
  useTheme,
} from "react-native-paper";
import { Image } from "expo-image";
import { Session } from "@supabase/supabase-js";
import { Avatar } from "./Avatar";
import {
  ROUTES,
  useParams,
  useNavigate,
  NavigateFunction,
} from "../lib/routing";
import { MatchData, MessageData, ProfileData } from "../lib/types";
import { useStyles } from "../lib/styles";
import { Appbar } from "./Appbar";
import { toDateTimeString } from "../lib/utils";

const createOnPressHandler = (id: string, navigate: NavigateFunction) => () => {
  navigate(`../${ROUTES.PROFILE}/${id}`);
};

export default function Match({ session }: { session: Session }) {
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [match, setMatch] = useState<MatchData | null>(null);
  const [messages, setMessages] = useState<MessageData[]>([]);
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [message, setMessage] = useState("");
  const [deleteMessageID, setDeleteMessageID] = useState("");
  const [deleteDialogVisible, setDeleteDialogVisible] = useState(false);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const navigate = useNavigate();
  const styles = useStyles();
  const theme = useTheme();
  const { id } = useParams<{ id: string }>();
  const onPressHandler = useRef(() => { });
  const avatarUrl = useMemo(() => {
    return profile?.avatar_urls?.length ? profile.avatar_urls[0] : null;
  }, [profile?.avatar_urls]);

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

  useEffect(() => {
    if (profile) {
      onPressHandler.current = createOnPressHandler(profile.id, navigate);
    }

    return () => {
      onPressHandler.current = () => { };
    };
  }, [profile]);

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
        throw Error(error.message);
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
      const { data, error } = await supabase
        .from("messages")
        .select("*")
        .eq("match_id", id)
        .order("created_at", { ascending: false });

      if (error) {
        throw Error(error.message);
      }

      setMessages(data || []);
    } catch (error) {
      if (error instanceof Error) {
        console.error(error.message);
        setSnackbarMessage("Unable to get messages");
        setSnackbarVisible(true);
      }
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
        throw Error(error.message);
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
      setSending(true);

      const { error } = await supabase.from("messages").insert({
        match_id: id,
        user_id: session.user.id,
        message: message,
      });

      if (error) {
        throw Error(error.message);
      }

      setMessage("");
    } catch (error) {
      if (error instanceof Error) {
        console.error(error.message);
        setSnackbarMessage("Unable to send message");
        setSnackbarVisible(true);
      }
    } finally {
      setSending(false);
    }
  }

  async function setMessageRead(message: MessageData) {
    try {
      const { error } = await supabase.rpc("set_message_read", {
        msg_id: message.id,
      });

      if (error) {
        throw Error(error.message);
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

  async function handleDeleteMessage() {
    try {
      const { error } = await supabase
        .from("messages")
        .delete()
        .eq("id", deleteMessageID);

      if (error) {
        throw Error(error.message);
      }

      setDeleteMessageID("");
    } catch (error) {
      if (error instanceof Error) {
        console.error(error.message);
        setSnackbarMessage("Unable to update interaction");
        setSnackbarVisible(true);
      }
    }
  }

  return (
    <View style={{ flex: 1 }}>
      <Appbar
        backAction={true}
        title={profile?.username || "Match"}
        menuItems={[
          {
            title: "Profile",
            onPress: () => {
              navigate(`../${ROUTES.PROFILE}/${profile?.id}`);
            },
          },
          {
            title: "Report",
            onPress: () => {
              navigate(`../${ROUTES.REPORT}/${profile?.id}`);
            },
          },
        ]}
      />
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
          <View style={[styles.container, { paddingHorizontal: 0 }]}>
            <FlatList
              data={messages}
              keyExtractor={(item) => item.id.toString()}
              ItemSeparatorComponent={() => <View style={styles.separator} />}
              contentContainerStyle={{ paddingVertical: 12 }}
              inverted={true}
              renderItem={({ item }) => (
                <View
                  style={{
                    marginLeft: item.user_id == session.user.id ? 64 : 12,
                    marginRight: item.user_id == session.user.id ? 12 : 64,
                  }}
                >
                  <Pressable
                    disabled={item.user_id != session.user.id}
                    onLongPress={() => {
                      setDeleteMessageID(item.id);
                      setDeleteDialogVisible(true);
                    }}
                  >
                    <Card
                      style={[
                        {
                          padding: 6,
                          backgroundColor:
                            item.user_id == session.user.id
                              ? theme.colors.elevation.level5
                              : theme.colors.elevation.level1,
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
                          },
                        ]}
                      >
                        <Badge
                          visible={
                            !item.is_read && item.user_id != session.user.id
                          }
                          size={10}
                          style={{ position: "absolute", top: 10, right: 10 }}
                          theme={{ colors: { error: theme.colors.tertiaryContainer, onError: theme.colors.onTertiaryContainer } }}
                        />
                        {item.user_id != session.user.id && (
                          <View style={{ alignSelf: "flex-start" }}>
                            <Avatar
                              size={50}
                              url={avatarUrl}
                              onPress={onPressHandler.current}
                            />
                          </View>
                        )}
                        <Text
                          style={{
                            flexShrink: 1,
                            marginHorizontal: 12,
                            alignSelf: "center",
                          }}
                        >
                          {item.message}
                        </Text>
                      </View>
                    </Card>
                  </Pressable>
                  <View
                    style={{
                      flexDirection:
                        item.user_id == session.user.id ? "row-reverse" : "row",
                    }}
                  >
                    <HelperText type="info" visible={true}>
                      {toDateTimeString(new Date(item.created_at))}
                    </HelperText>
                  </View>
                </View>
              )}
              viewabilityConfig={viewabilityConfig}
              onViewableItemsChanged={handleViewableItemsChanged}
            />
            <View style={{ flexDirection: "row" }}>
              <TextInput
                disabled={sending}
                style={[styles.textInput, { flex: 1 }]}
                value={message}
                onChangeText={setMessage}
                onSubmitEditing={handleMessage}
                blurOnSubmit={true}
                placeholder="Type a message"
                multiline={true}
                numberOfLines={1}
                right={
                  <TextInput.Icon
                    icon="send"
                    onPress={handleMessage}
                    disabled={message.trim() === "" || sending}
                  />
                }
              />
            </View>
          </View>
        </KeyboardAvoidingView>
      )}
      <Portal>
        {deleteDialogVisible && (
          <View style={styles.portalContainer}>
            <Dialog
              style={styles.dialog}
              visible={deleteDialogVisible}
              onDismiss={() => setDeleteDialogVisible(false)}
            >
              <Dialog.Content>
                <Text variant="bodyLarge" style={styles.dialogText}>
                  Would you like to delete this message?
                </Text>
              </Dialog.Content>
              <Dialog.Actions>
                <Button
                  textColor={theme.colors.onSecondaryContainer}
                  mode="text"
                  labelStyle={styles.buttonLabel}
                  onPress={() => setDeleteDialogVisible(false)}
                >
                  Cancel
                </Button>
                <Button
                  textColor={theme.colors.onSecondaryContainer}
                  mode="text"
                  labelStyle={styles.buttonLabel}
                  onPress={() => {
                    handleDeleteMessage();
                    setDeleteDialogVisible(false);
                  }}
                >
                  Ok
                </Button>
              </Dialog.Actions>
            </Dialog>
          </View>
        )}
      </Portal>
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
