import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { StyleSheet, View, Alert, Text, Button } from "react-native";
import { Card } from "@rneui/themed";
import { Session } from "@supabase/supabase-js";
import { useParams } from "../lib/routing";
import { ProfileData } from "../lib/types";
import Avatar from "./Avatar";

export default function Profile({ session }: { session: Session }) {
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [interaction, setInteraction] = useState(null);
  const { id } = useParams<{ id: string }>();

  useEffect(() => {
    if (id && session) {
      getData();
    }
  }, [id, session]);

  async function getData() {
    setLoading(true);
    await Promise.all([getProfile(), getInteraction()]);
    setLoading(false);
  }

  async function getProfile() {
    try {
      let { data, error, status } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", id)
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

  async function getInteraction() {
    try {
      const { data, error, status } = await supabase
        .from("interactions")
        .select("interaction")
        .eq("user_id", session?.user.id)
        .eq("target_id", id)
        .limit(1)
        .single();
      if (error && status !== 406) {
        throw error;
      }

      if (data) {
        setInteraction(data.interaction);
      } else {
        setInteraction(null);
      }
    } catch (error) {
      if (error instanceof Error) {
        Alert.alert("An error occurred", error.message);
      }
    }
  }

  async function handleInteraction(type: string) {
    try {
      const { error } = await supabase.from("interactions").upsert([
        {
          user_id: session?.user.id,
          target_id: id,
          interaction: type,
          updated_at: new Date(),
        },
      ]);
      if (error) throw error;

      getInteraction();
    } catch (error) {
      if (error instanceof Error) {
        Alert.alert("An error occurred", error.message);
      }
    }
  }

  return (
    <View style={styles.container}>
      <Card>
        <View>
          <Avatar size={200} url={profile?.avatar_url || null} />
        </View>
        <View style={(styles.verticallySpaced, styles.mt20)}>
          <Text>{profile?.username || ""}</Text>
        </View>
        <View style={styles.buttonContainer}>
          {interaction !== "like" ? (
            <Button
              title="Like"
              onPress={() => handleInteraction("like")}
              disabled={loading}
            />
          ) : (
            <Button
              title="Unlike"
              onPress={() => handleInteraction("none")}
              disabled={loading}
            />
          )}
          {interaction !== "pass" ? (
            <Button
              title="Pass"
              onPress={() => handleInteraction("pass")}
              disabled={loading}
            />
          ) : (
            <Button
              title="Unpass"
              onPress={() => handleInteraction("none")}
              disabled={loading}
            />
          )}
          {interaction !== "block" ? (
            <Button
              title="Block"
              onPress={() => handleInteraction("block")}
              disabled={loading}
            />
          ) : (
            <Button
              title="Unblock"
              onPress={() => handleInteraction("none")}
              disabled={loading}
            />
          )}
        </View>
      </Card>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 40,
    padding: 12,
  },
  verticallySpaced: {
    paddingTop: 4,
    paddingBottom: 4,
    alignSelf: "stretch",
  },
  mt20: {
    marginTop: 20,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 15,
  },
});
