import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { View, Alert, ScrollView, ActivityIndicator } from "react-native";
import { Button, TextInput, Appbar, IconButton } from "react-native-paper";
import { Session } from "@supabase/supabase-js";
import Avatar from "./Avatar";
import Navigation from "./Navigation";
import { ROUTES, useNavigate } from "../lib/routing";
import styles from "../lib/styles";

export default function Account({ session }: { session: Session }) {
  const [loading, setLoading] = useState(true);
  const [avatarUrl, setAvatarUrl] = useState("");
  const [email, setEmail] = useState<string | undefined>();
  const navigate = useNavigate();

  useEffect(() => {
    if (session) {
      getAvatarUrl();
      setEmail(session.user.email);
    }
  }, [session]);

  async function getAvatarUrl() {
    try {
      setLoading(true);
      if (!session?.user) throw new Error("No user on the session!");

      let { data, error, status } = await supabase
        .from("profiles")
        .select(`avatar_url`)
        .eq("id", session?.user.id)
        .single();
      if (error && status !== 406) {
        throw error;
      }

      if (data) {
        setAvatarUrl(data.avatar_url);
      }
    } catch (error) {
      if (error instanceof Error) {
        Alert.alert(error.message);
      }
    } finally {
      setLoading(false);
    }
  }

  async function updateAvatarUrl({ url }: { url: string }) {
    try {
      setLoading(true);
      if (!session?.user) throw new Error("No user on the session!");

      const updates = {
        id: session?.user.id,
        avatar_url: url,
        updated_at: new Date(),
      };

      const { error } = await supabase.from("profiles").upsert(updates);

      if (error) {
        throw error;
      }

      setAvatarUrl(url);
    } catch (error) {
      if (error instanceof Error) {
        Alert.alert(error.message);
      }
    } finally {
      setLoading(false);
    }
  }

  async function updateEmail({ email }: { email: string | undefined }) {
    if (!email) {
      return;
    }

    try {
      setLoading(true);
      const { error } = await supabase.auth.updateUser({
        email: email,
      });

      if (error) {
        throw error;
      } else {
        navigate(ROUTES.OTP, { state: { email } });
      }
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
        <Appbar.Content title="Account" />
      </Appbar.Header>
      {loading ? (
        <View
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
          <ActivityIndicator animating={true} size="large" />
        </View>
      ) : (
        <ScrollView style={styles.container}>
          <View style={styles.centerAligned}>
            <Avatar
              size={200}
              url={avatarUrl}
              onUpload={(url: string) => {
                updateAvatarUrl({ url });
              }}
            />
          </View>
          <View style={[styles.verticallySpaced, { flexDirection: "row" }]}>
            <TextInput
              style={{ flex: 1 }}
              label="Update Email"
              onChangeText={setEmail}
              value={email}
              placeholder="user@example.com"
              autoCapitalize={"none"}
            />
            <IconButton
              style={styles.verticallySpaced}
              icon="send"
              onPress={() => updateEmail({ email })}
              disabled={loading}
            />
          </View>
          <Button
            style={styles.verticallySpaced}
            onPress={() => navigate(`${ROUTES.EDIT}`)}
            disabled={loading}
          >
            Edit Profile
          </Button>
          <Button
            style={styles.verticallySpaced}
            onPress={() => supabase.auth.signOut()}
            disabled={loading}
          >
            Sign Out
          </Button>
        </ScrollView>
      )}
      <Navigation key={session.user.id} session={session} />
    </View>
  );
}
