import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { View, Alert } from "react-native";
import { Button, TextInput } from "react-native-paper";
import { Session } from "@supabase/supabase-js";
import Avatar from "./Avatar";
import { ROUTES, useNavigate } from "../lib/routing";

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
    <View>
      <View>
        <Avatar
          size={200}
          url={avatarUrl}
          onUpload={(url: string) => {
            setAvatarUrl(url);
            updateProfile({ username, website, avatar_url: url });
          }}
        />
      </View>
      <View>
        <TextInput label="Email" value={session?.user?.email} disabled />
      </View>
      <View>
        <TextInput
          label="Username"
          value={username || ""}
          onChangeText={(text) => setUsername(text)}
        />
      </View>
      <View>
        <TextInput
          label="Website"
          value={website || ""}
          onChangeText={(text) => setWebsite(text)}
        />
      </View>

      <View>
        <Button
          onPress={() =>
            updateProfile({ username, website, avatar_url: avatarUrl })
          }
          disabled={loading}
        >
          {loading ? "Loading ..." : "Update"}
        </Button>
      </View>

      <View>
        <Button onPress={viewProfile}>View Profile</Button>
      </View>

      <View>
        <Button onPress={getCredits}>Get Credits</Button>
      </View>

      <View>
        <Button onPress={() => supabase.auth.signOut()}>Sign Out</Button>
      </View>
    </View>
  );
}
