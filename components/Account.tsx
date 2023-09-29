import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { View, Alert } from "react-native";
import { Button, TextInput, Text } from "react-native-paper";
import { Session } from "@supabase/supabase-js";
import Avatar from "./Avatar";
import { ROUTES, useNavigate } from "../lib/routing";
import styles from "../lib/styles";

export default function Account({ session }: { session: Session }) {
  const [loading, setLoading] = useState(true);
  const [username, setUsername] = useState("");
  const [website, setWebsite] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
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
        .select(`username, website, avatar_url`)
        .eq("id", session?.user.id)
        .single();
      if (error && status !== 406) {
        throw error;
      }

      if (data) {
        setUsername(data.username);
        setWebsite(data.website);
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

  async function updateProfile({
    username,
    website,
    avatar_url,
  }: {
    username: string;
    website: string;
    avatar_url: string;
  }) {
    try {
      setLoading(true);
      if (!session?.user) throw new Error("No user on the session!");

      const updates = {
        id: session?.user.id,
        username,
        website,
        avatar_url,
        updated_at: new Date(),
      };

      let { error } = await supabase.from("profiles").upsert(updates);

      if (error) {
        throw error;
      }
    } catch (error) {
      if (error instanceof Error) {
        Alert.alert(error.message);
      }
    } finally {
      setLoading(false);
    }
  }

  function viewProfile() {
    if (session?.user?.id) {
      navigate(`${ROUTES.PROFILE}/${session.user.id}`);
    }
  }

  function getCredits() {
    navigate(ROUTES.CHECKOUT);
  }

  return (
    <View style={styles.container}>
      <Text variant="headlineLarge">Account</Text>
      <View style={styles.centerAligned}>
        <Avatar
          size={200}
          url={avatarUrl}
          onUpload={(url: string) => {
            setAvatarUrl(url);
            updateProfile({ username, website, avatar_url: url });
          }}
        />
      </View>
      <TextInput
        style={styles.verticallySpaced}
        label="Email"
        value={session?.user?.email}
        disabled
      />
      <TextInput
        style={styles.verticallySpaced}
        label="Username"
        value={username || ""}
        onChangeText={(text) => setUsername(text)}
      />
      <TextInput
        style={styles.verticallySpaced}
        label="Website"
        value={website || ""}
        onChangeText={(text) => setWebsite(text)}
      />
      <Button
        style={styles.verticallySpaced}
        onPress={() =>
          updateProfile({ username, website, avatar_url: avatarUrl })
        }
        disabled={loading}
      >
        {loading ? "Loading ..." : "Update"}
      </Button>
      <Button style={styles.verticallySpaced} onPress={viewProfile}>
        View Profile
      </Button>
      <Button style={styles.verticallySpaced} onPress={getCredits}>
        Get Credits
      </Button>
      <Button
        style={styles.verticallySpaced}
        onPress={() => supabase.auth.signOut()}
      >
        Sign Out
      </Button>
    </View>
  );
}
