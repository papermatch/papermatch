import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { View, FlatList } from "react-native";
import {
  Card,
  Text,
  ActivityIndicator,
  Badge,
  Portal,
  Snackbar,
} from "react-native-paper";
import { Image } from "expo-image";
import { Session } from "@supabase/supabase-js";
import { Avatar } from "./Avatar";
import { Navigation } from "./Navigation";
import { ROUTES, useNavigate } from "../lib/routing";
import { MatchesData } from "../lib/types";
import { useStyles } from "../lib/styles";
import { Appbar } from "./Appbar";

export default function Matches({ session }: { session: Session }) {
  const [loading, setLoading] = useState(true);
  const [matches, setMatches] = useState<MatchesData[]>([]);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const navigate = useNavigate();
  const styles = useStyles();

  useEffect(() => {
    if (session) {
      getMatches();
    }
  }, [session]);

  async function getMatches() {
    try {
      setLoading(true);

      const { data, error } = await supabase.rpc("get_matches_data");

      if (error) {
        throw error;
      }

      await Promise.all(
        data.map(async (item: MatchesData) => {
          try {
            if (item.profile.avatar_urls[0]) {
              await Image.prefetch(item.profile.avatar_urls[0]);
            }
          } catch (error) {
            if (error instanceof Error) {
              console.error(error.message);
            }
          }
        })
      );

      setMatches(data || []);
    } catch (error) {
      if (error instanceof Error) {
        console.error(error.message);
        setSnackbarMessage("Unable to get matches");
        setSnackbarVisible(true);
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={{ flex: 1 }}>
      <Appbar title="Matches" />
      {loading ? (
        <View
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
          <ActivityIndicator animating={true} size="large" />
        </View>
      ) : (
        <View style={[styles.container, { paddingHorizontal: 0 }]}>
          {matches.length ? (
            <FlatList
              data={matches}
              keyExtractor={(item) => item.match.id.toString()}
              ItemSeparatorComponent={() => <View style={styles.separator} />}
              contentContainerStyle={{
                paddingVertical: 12,
              }}
              renderItem={({ item }) => (
                <Card
                  style={{ padding: 12, marginHorizontal: 12 }}
                  onPress={() =>
                    navigate(`../${ROUTES.MATCH}/${item.match.id}`)
                  }
                >
                  <View style={{ flexDirection: "row" }}>
                    <Badge
                      visible={item.message === null || item.unread}
                      size={10}
                      style={{ position: "absolute", top: 10, right: 10 }}
                    />
                    <View style={{ alignSelf: "center" }}>
                      <Avatar
                        size={75}
                        url={item.profile.avatar_urls[0] || null}
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
                      <Text>
                        {item.message
                          ? item.message.message
                              .replace(/\n/g, " ")
                              .slice(0, 140) +
                            (item.message.message.length > 140 ? "..." : "")
                          : "(No messages yet.)"}
                      </Text>
                    </View>
                    <View
                      style={{
                        position: "absolute",
                        top: 0,
                        bottom: 0,
                        left: 0,
                        right: 0,
                      }}
                      pointerEvents="box-only"
                    />
                  </View>
                </Card>
              )}
            />
          ) : (
            <Text
              style={[
                styles.verticallySpaced,
                { marginTop: 12, paddingHorizontal: 12 },
              ]}
            >
              No matches yet.
            </Text>
          )}
        </View>
      )}
      <Portal>
        <Snackbar
          style={[styles.snackbar, styles.aboveNav]}
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
      <Navigation key={session.user.id} session={session} />
    </View>
  );
}
