import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { View, FlatList, Image } from "react-native";
import {
  Card,
  Text,
  Appbar,
  ActivityIndicator,
  Badge,
  Portal,
  Snackbar,
} from "react-native-paper";
import { Session } from "@supabase/supabase-js";
import Avatar from "./Avatar";
import Navigation from "./Navigation";
import { ROUTES, useNavigate } from "../lib/routing";
import { MatchesData, ProfileData } from "../lib/types";
import { useStyles } from "../lib/styles";

export default function Matches({ session }: { session: Session }) {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<MatchesData[]>([]);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const navigate = useNavigate();
  const styles = useStyles();

  useEffect(() => {
    if (session) {
      getData();
    }
  }, [session]);

  async function getData() {
    try {
      setLoading(true);

      const { data, error } = await supabase.rpc("get_matches_data");

      if (error) {
        throw error;
      }

      await Promise.all(
        data.map(async (item: MatchesData) => {
          try {
            await Image.prefetch(item.profile.avatar_urls[0]);
          } catch (error) {
            console.error(
              `Error prefetching ${item.profile.avatar_urls[0]}:`,
              error
            );
          }
        })
      );

      setData(data || []);
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
      <Appbar.Header mode="center-aligned">
        <Appbar.Content titleStyle={styles.appbarTitle} title="Matches" />
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
                    <Badge
                      visible={item.unread}
                      size={10}
                      style={{ position: "absolute", top: 10, right: 10 }}
                    />
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
                        {item.message
                          ? item.message.message
                              .replace(/\n/g, " ")
                              .slice(0, 280) +
                            (item.message.message.length > 280 ? "..." : "")
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
            <Text style={styles.verticallySpaced}>No matches yet.</Text>
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
