import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { View, Alert, FlatList } from "react-native";
import {
  Card,
  Text,
  Appbar,
  ActivityIndicator,
  Menu,
} from "react-native-paper";
import { Session } from "@supabase/supabase-js";
import Avatar from "./Avatar";
import Navigation from "./Navigation";
import { ROUTES, useNavigate } from "../lib/routing";
import { ProfileData } from "../lib/types";
import styles from "../lib/styles";
import { Attributes } from "./Attributes";

export default function Profiles({ session }: { session: Session }) {
  const [loading, setLoading] = useState(true);
  const [appbarMenuVisible, setAppbarMenuVisible] = useState(false);
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

      let { data, error } = await supabase
        .rpc("get_compatible_profiles")
        .select("*");

      if (error) {
        throw error;
      }

      let profiles = data?.map((item) => item.profile) || [];

      const blockedIDs = await getBlockedIDs();
      profiles =
        profiles?.filter((profile) => !blockedIDs.includes(profile.id)) || [];

      setProfiles(profiles);
    } catch (error) {
      if (error instanceof Error) {
        Alert.alert(error.message);
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={{ flex: 1 }}>
      <Appbar.Header mode="center-aligned">
        <Appbar.Content title="Profiles" />
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
              navigate(ROUTES.PREFERENCES);
            }}
            title="Preferences"
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
        <View style={styles.container}>
          {profiles.length ? (
            <FlatList
              data={profiles}
              keyExtractor={(profile) => profile.id.toString()}
              renderItem={({ item: profile }) => (
                <Card
                  onPress={() => {
                    navigate(`${ROUTES.PROFILE}/${profile.id}`);
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
                      <Avatar
                        size={100}
                        url={profile.avatar_url}
                        onPress={() => {
                          navigate(`${ROUTES.PROFILE}/${profile.id}`);
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
                      <Text variant="titleLarge">{profile.username}</Text>
                      <Attributes
                        style={{
                          flexDirection: "row",
                          flexWrap: "wrap",
                        }}
                        profile={profile}
                        loading={loading}
                      />
                    </View>
                  </View>
                </Card>
              )}
            />
          ) : (
            <Text style={styles.verticallySpaced}>
              No compatible profiles found, try adjusting your preferences.
            </Text>
          )}
        </View>
      )}
      <Navigation key={session.user.id} session={session} />
    </View>
  );
}
