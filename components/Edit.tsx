import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { View, Alert } from "react-native";
import { Button, TextInput, Appbar, Snackbar } from "react-native-paper";
import { Session } from "@supabase/supabase-js";
import { ROUTES, useNavigate } from "../lib/routing";
import styles from "../lib/styles";

export default function Edit({ session }: { session: Session }) {
  const [loading, setLoading] = useState(false);
  const [username, setUsername] = useState("");
  const [visible, setVisible] = useState(false);
  const [message, setMessage] = useState("Default message");
  const navigate = useNavigate();

  useEffect(() => {
    if (session) {
      getProfile();
    }
  }, [session]);

  async function getProfile() {
    try {
      setLoading(true);
      if (!session?.user) throw new Error("No user on the session!");

      let { data, error, status } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", session?.user.id)
        .single();
      if (error && status !== 406) {
        throw error;
      }

      if (data) {
        setUsername(data.username);
      }
    } catch (error) {
      if (error instanceof Error) {
        Alert.alert(error.message);
      }
    } finally {
      setLoading(false);
    }
  }

  async function updateProfile({ username }: { username: string }) {
    try {
      setLoading(true);
      if (!session?.user) throw new Error("No user on the session!");

      const updates = {
        id: session?.user.id,
        username,
        updated_at: new Date(),
      };

      let { error } = await supabase.from("profiles").upsert(updates);

      if (error) {
        throw error;
      }

      setMessage("Profile updated!");
      setVisible(true);
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
        <Appbar.BackAction
          onPress={() => {
            navigate(-1);
          }}
        />
        <Appbar.Content title="Edit" />
      </Appbar.Header>
      <View style={styles.container}>
        <TextInput
          style={styles.verticallySpaced}
          label="Username"
          value={username || ""}
          onChangeText={(text) => setUsername(text)}
        />
        <Button
          style={styles.verticallySpaced}
          onPress={() => updateProfile({ username })}
          disabled={loading}
        >
          {loading ? "Loading ..." : "Update"}
        </Button>
        <Button
          style={styles.verticallySpaced}
          onPress={() => navigate(`${ROUTES.PROFILE}/${session.user.id}`)}
          disabled={loading}
        >
          View Profile
        </Button>
      </View>
      <Snackbar
        visible={visible}
        onDismiss={() => setVisible(false)}
        action={{ label: "Dismiss", onPress: () => setVisible(false) }}
      >
        {message}
      </Snackbar>
    </View>
  );
}
